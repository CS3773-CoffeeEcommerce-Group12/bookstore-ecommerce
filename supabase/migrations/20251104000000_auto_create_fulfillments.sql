-- Update checkout function to automatically create fulfillments
-- This ensures all orders have tracking from the moment they're created

CREATE OR REPLACE FUNCTION fn_checkout_with_shipping(
  p_cart_id UUID,
  p_discount_code TEXT DEFAULT NULL,
  p_shipping_address_id UUID DEFAULT NULL
)
RETURNS TABLE (
  order_id UUID,
  total_cents BIGINT,
  items_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_order_id UUID;
  v_total_cents BIGINT := 0;
  v_items_count INTEGER := 0;
  v_discount_pct NUMERIC := 0;     -- percentage as numeric (0-100)
  v_tax_rate NUMERIC := 0.0825;    -- 8.25% tax rate
BEGIN
  -- Get user ID from cart
  SELECT c.user_id INTO v_user_id
  FROM carts c
  WHERE c.id = p_cart_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Cart not found or invalid';
  END IF;
  
  -- Validate discount code if provided (using public.discounts)
  IF p_discount_code IS NOT NULL THEN
    SELECT d.pct_off INTO v_discount_pct
    FROM discounts d
    WHERE d.code = p_discount_code
      AND d.active = true
      AND (d.max_uses IS NULL OR d.used_count < d.max_uses)
      AND (d.expires_at IS NULL OR d.expires_at > NOW());
    
    IF v_discount_pct IS NULL THEN
      RAISE EXCEPTION 'INVALID_DISCOUNT';
    END IF;
  END IF;
  
  -- Calculate total and validate stock
  SELECT 
    COALESCE(SUM(ci.qty * i.price_cents)::bigint, 0),
    COALESCE(SUM(ci.qty)::int, 0)
  INTO v_total_cents, v_items_count
  FROM cart_items ci
  JOIN items i ON ci.item_id = i.id
  WHERE ci.cart_id = p_cart_id;
  
  IF v_items_count = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;
  
  -- Check stock availability (items.stock)
  IF EXISTS (
    SELECT 1 
    FROM cart_items ci
    JOIN items i ON ci.item_id = i.id
    WHERE ci.cart_id = p_cart_id AND ci.qty > i.stock
  ) THEN
    RAISE EXCEPTION 'OUT_OF_STOCK';
  END IF;
  
  -- Apply discount (pct_off is numeric 0-100)
  IF v_discount_pct > 0 THEN
    -- compute discounted total as numeric, then cast back to bigint (cents)
    v_total_cents := ( (v_total_cents::numeric * (100 - v_discount_pct)) / 100 )::bigint;
  END IF;
  
  -- Add tax (apply to cents using numeric math, round to nearest cent)
  v_total_cents := CEIL( (v_total_cents::numeric * (1 + v_tax_rate)) )::bigint;
  
  -- Create order with shipping address
  INSERT INTO orders (user_id, total_cents, shipping_address_id)
  VALUES (v_user_id, v_total_cents, p_shipping_address_id)
  RETURNING id INTO v_order_id;
  
  -- Create order items and snapshot price_cents
  INSERT INTO order_items (order_id, item_id, qty, price_cents)
  SELECT v_order_id, ci.item_id, ci.qty, i.price_cents
  FROM cart_items ci
  JOIN items i ON ci.item_id = i.id
  WHERE ci.cart_id = p_cart_id;
  
  -- **NEW: Automatically create pending fulfillments for each order item**
  INSERT INTO order_fulfillments (order_id, item_id, qty, status, created_at)
  SELECT v_order_id, ci.item_id, ci.qty, 'pending', NOW()
  FROM cart_items ci
  WHERE ci.cart_id = p_cart_id;
  
  -- Update stock quantities
  UPDATE items 
  SET stock = stock - ci.qty
  FROM cart_items ci
  WHERE items.id = ci.item_id 
    AND ci.cart_id = p_cart_id;
  
  -- Update discount usage if used
  IF p_discount_code IS NOT NULL THEN
    UPDATE discounts 
    SET used_count = used_count + 1
    WHERE code = p_discount_code;
  END IF;
  
  -- Clear the cart
  DELETE FROM cart_items WHERE cart_id = p_cart_id;
  
  -- Return order details
  RETURN QUERY SELECT v_order_id, v_total_cents, v_items_count;
END;
$$;