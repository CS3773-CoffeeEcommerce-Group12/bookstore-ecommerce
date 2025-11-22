-- Fix fn_checkout function to use sale prices
CREATE OR REPLACE FUNCTION public.fn_checkout(
  p_cart_id uuid,
  p_discount_code text DEFAULT NULL::text,
  p_shipping_address_id uuid DEFAULT NULL::uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
declare
  v_user uuid;
  v_total bigint := 0;
  v_discount_pct numeric(5,2) := 0;
  v_order_id uuid;
  rec record;
  v_stock int;
  v_actual_price bigint;
begin
  select user_id into v_user from public.carts where id = p_cart_id;
  if v_user is null then
    raise exception 'CART_NOT_FOUND';
  end if;

  if auth.uid() is null or v_user <> auth.uid() then
    raise exception 'SESSION_EXPIRED';
  end if;

  if p_discount_code is not null then
    with d as (
      update public.discounts
      set used_count = used_count + 1
      where code = p_discount_code
        and active = true
        and (expires_at is null or expires_at > now())
        and (max_uses is null or used_count < max_uses)
      returning pct_off
    )
    select pct_off into v_discount_pct from d;

    if v_discount_pct is null then
      raise exception 'INVALID_DISCOUNT';
    end if;
  end if;

  -- Calculate total using sale prices if applicable
  for rec in
    select
      ci.item_id,
      ci.qty,
      i.price_cents,
      i.on_sale,
      i.sale_price_cents,
      -- Use sale price if item is on sale, otherwise use regular price
      case
        when i.on_sale and i.sale_price_cents is not null
        then i.sale_price_cents
        else i.price_cents
      end as actual_price
    from public.cart_items ci
    join public.items i on i.id = ci.item_id
    where ci.cart_id = p_cart_id
  loop
    select stock into v_stock from public.items where id = rec.item_id for update;
    if v_stock is null or v_stock < rec.qty then
      raise exception 'OUT_OF_STOCK';
    end if;
    -- Use actual_price (which includes sale price logic)
    v_total := v_total + (rec.qty::bigint * rec.actual_price::bigint);
  end loop;

  -- Apply discount code if provided
  if v_discount_pct > 0 then
    v_total := round((v_total::numeric * (1 - v_discount_pct / 100)), 0)::bigint;
  end if;

  -- Add 8.25% tax
  v_total := round((v_total::numeric * 1.0825), 0)::bigint;

  insert into public.orders (user_id, customer_email, total_cents, shipping_address_id)
  values (v_user, (select email from auth.users where id = v_user), v_total, p_shipping_address_id)
  returning id into v_order_id;

  -- Insert order items with the actual price paid (sale price if on sale)
  insert into public.order_items (order_id, item_id, qty, price_cents)
  select
    v_order_id,
    ci.item_id,
    ci.qty,
    -- Use sale price if item is on sale, otherwise use regular price
    case
      when i.on_sale and i.sale_price_cents is not null
      then i.sale_price_cents
      else i.price_cents
    end
  from public.cart_items ci
  join public.items i on i.id = ci.item_id
  where ci.cart_id = p_cart_id;

  update public.items i
  set stock = i.stock - ci.qty
  from public.cart_items ci
  where ci.cart_id = p_cart_id and ci.item_id = i.id;

  delete from public.cart_items where cart_id = p_cart_id;

  return jsonb_build_object(
    'order_id', v_order_id,
    'total_cents', v_total,
    'discount_applied', v_discount_pct
  );
end;
$function$;
