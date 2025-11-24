import { supabase } from '@/integrations/supabase/client';
import { OrderFulfillment } from '@/types';

export interface CreateFulfillmentData {
  order_id: string;
  item_id: string;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipped_qty?: number;
  tracking_number?: string;
}

export interface UpdateFulfillmentData {
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipped_qty?: number;
  tracking_number?: string;
  fulfilled_by?: string;
  fulfilled_at?: string;
  shipped_at?: string;
}

export const fulfillmentService = {
  // Create a new fulfillment record
  async createFulfillment(data: CreateFulfillmentData): Promise<OrderFulfillment | null> {
    try {
      const { data: result, error } = await supabase
        .from('order_fulfillments')
        .insert({
          order_id: data.order_id,
          item_id: data.item_id,
          status: data.status || 'pending',
          shipped_qty: data.shipped_qty || 0,
          tracking_number: data.tracking_number || null,
        })
        .select()
        .single();

      if (error) {
        return null;
      }

      return result as OrderFulfillment;
    } catch (error) {
      return null;
    }
  },

  // Get fulfillments for a specific order
  async getFulfillmentsByOrderId(orderId: string): Promise<OrderFulfillment[]> {
    try {
      const { data, error } = await supabase
        .from('order_fulfillments')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        return [];
      }
      return (data || []) as OrderFulfillment[];
    } catch (error) {
      return [];
    }
  },

  // Get fulfillments for a specific order item
  async getFulfillmentsByOrderItem(orderId: string, itemId: string): Promise<OrderFulfillment[]> {
    try {
      const { data, error } = await supabase
        .from('order_fulfillments')
        .select('*')
        .eq('order_id', orderId)
        .eq('item_id', itemId)
        .order('created_at', { ascending: true });

      if (error) {
        return [];
      }
      return (data || []) as OrderFulfillment[];
    } catch (error) {
      return [];
    }
  },

  // Get all pending fulfillments (for admin dashboard)
  async getPendingFulfillments(): Promise<any[]> {
    try {
      // First, get the basic fulfillments
      const { data: fulfillments, error: fulfillmentError } = await supabase
        .from('order_fulfillments')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (fulfillmentError) {
        return [];
      }

      if (!fulfillments || fulfillments.length === 0) {
        return [];
      }

      // Get additional data for each fulfillment
      const enrichedFulfillments = await Promise.all(
        fulfillments.map(async (fulfillment) => {
          // Get order data
          const { data: order } = await supabase
            .from('orders')
            .select('id, customer_email, created_at')
            .eq('id', fulfillment.order_id)
            .single();

          // Get item data
          const { data: item } = await supabase
            .from('items')
            .select('name, img_url, author')
            .eq('id', fulfillment.item_id)
            .single();

          return {
            ...fulfillment,
            orders: order,
            items: item,
          };
        })
      );

      return enrichedFulfillments;
    } catch (error) {
      return [];
    }
  },

  // Update fulfillment status and details
  async updateFulfillment(fulfillmentId: string, data: UpdateFulfillmentData): Promise<OrderFulfillment | null> {
    try {
      const updateData: any = { ...data };
      
      // Auto-set timestamps based on status changes
      if (data.status === 'processing' && !data.fulfilled_at) {
        updateData.fulfilled_at = new Date().toISOString();
      }
      if (data.status === 'shipped' && !data.shipped_at) {
        updateData.shipped_at = new Date().toISOString();
      }

      const { data: result, error } = await supabase
        .from('order_fulfillments')
        .update(updateData)
        .eq('id', fulfillmentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating fulfillment:', error);
        return null;
      }
      return result as OrderFulfillment;
    } catch (error) {
      console.error('Error in updateFulfillment:', error);
      return null;
    }
  },

  // Mark fulfillment as shipped with tracking
  async markAsShipped(fulfillmentId: string, trackingNumber: string, shippedQty?: number): Promise<OrderFulfillment | null> {
    return this.updateFulfillment(fulfillmentId, {
      status: 'shipped',
      tracking_number: trackingNumber,
      shipped_qty: shippedQty,
      shipped_at: new Date().toISOString(),
    });
  },

  // Mark fulfillment as delivered
  async markAsDelivered(fulfillmentId: string): Promise<OrderFulfillment | null> {
    return this.updateFulfillment(fulfillmentId, {
      status: 'delivered',
    });
  },

  // Cancel fulfillment
  async cancelFulfillment(fulfillmentId: string): Promise<OrderFulfillment | null> {
    return this.updateFulfillment(fulfillmentId, {
      status: 'cancelled',
    });
  },

  // Cancel all fulfillments for an order (only if all are pending)
  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      // First, get all fulfillments for this order with more details
      const { data: fulfillments, error: fetchError } = await supabase
        .from('order_fulfillments')
        .select('id, status, shipped_qty, order_id')
        .eq('order_id', orderId);

      if (fetchError) {
        return false;
      }

      if (!fulfillments || fulfillments.length === 0) {
        return false;
      }

      // Check if all fulfillments are pending and unshipped
      const allPending = fulfillments.every(f => f.status === 'pending');
      const allUnshipped = fulfillments.every(f => f.shipped_qty === 0);

      if (!allPending) {
        return false;
      }

      if (!allUnshipped) {
        return false;
      }

      // Update all fulfillments to cancelled
      const { error: updateError } = await supabase
        .from('order_fulfillments')
        .update({ status: 'cancelled' })
        .eq('order_id', orderId)
        .select();

      if (updateError) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  },

  // Check if an order can be cancelled (all fulfillments are pending)
  async canCancelOrder(orderId: string): Promise<boolean> {
    try {
      const { data: fulfillments, error } = await supabase
        .from('order_fulfillments')
        .select('status, shipped_qty')
        .eq('order_id', orderId);

      if (error) {
        return false;
      }

      if (!fulfillments || fulfillments.length === 0) {
        return false;
      }

      const allPending = fulfillments.every(f => f.status === 'pending');
      const allUnshipped = fulfillments.every(f => f.shipped_qty === 0);
      const canCancel = allPending && allUnshipped;

      return canCancel;
    } catch (error) {
      return false;
    }
  },

  // Automatically create fulfillments when an order is placed
  async createFulfillmentsForOrder(orderId: string): Promise<boolean> {
    try {
      console.log('Creating fulfillments for order:', orderId);
      
      // Get order items for this order
      const { data: orderItems, error: orderError } = await supabase
        .from('order_items')
        .select('item_id, qty')
        .eq('order_id', orderId);

      if (orderError) {
        console.error('Error fetching order items:', orderError);
        return false;
      }
      
      console.log('Found order items:', orderItems);
      
      if (!orderItems?.length) {
        console.log('No order items found for order:', orderId);
        return true; // No items to fulfill
      }

      // Create fulfillment records for each order item
      const fulfillmentPromises = orderItems.map(item => {
        console.log('Creating fulfillment for item:', item);
        return this.createFulfillment({
          order_id: orderId,
          item_id: item.item_id,
          status: 'pending',
          shipped_qty: 0,
        });
      });

      const results = await Promise.allSettled(fulfillmentPromises);
      console.log('Fulfillment creation results:', results);
      
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value !== null).length;
      
      console.log(`Successfully created ${successCount} out of ${orderItems.length} fulfillments`);
      return successCount === orderItems.length;
    } catch (error) {
      console.error('Error in createFulfillmentsForOrder:', error);
      return false;
    }
  },

  // Get fulfillment statistics for admin dashboard
  async getFulfillmentStats(): Promise<{
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('order_fulfillments')
        .select('status');

      if (error) {
        console.error('Error fetching fulfillment stats:', error);
        return {
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        };
      }

      const stats = {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      };

      (data || []).forEach((fulfillment: any) => {
        if (fulfillment.status in stats) {
          stats[fulfillment.status as keyof typeof stats]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error in getFulfillmentStats:', error);
      return {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      };
    }
  },
};