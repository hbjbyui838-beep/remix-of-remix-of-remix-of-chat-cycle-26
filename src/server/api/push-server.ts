import { Router, type APIContext } from '@tanstack/start';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-shared';

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

const pushNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string(),
  body: z.string(),
  icon: z.string().optional(),
  data: z.object({
    url: z.string().optional(),
    type: z.enum(['purchase', 'expense', 'task', 'invoice', 'system']),
    id: z.string().uuid().optional(),
  }).optional(),
  tag: z.string().optional(),
});

/**
 * Save push subscription for user
 */
export async function savePushSubscription(ctx: APIContext) {
  const request = ctx.request;
  const body = await request.json();
  
  const parsedBody = pushSubscriptionSchema.safeParse(body);
  if (!parsedBody.success) {
    return ctx.json({ error: 'Invalid subscription data' }, { status: 400 });
  }
  
  try {
    const supabase = await createSupabaseServerClient(ctx);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return ctx.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Insert or update subscription
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint: parsedBody.data.endpoint,
        keys: parsedBody.data.keys,
        expiration_time: parsedBody.data.expirationTime,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'endpoint',
      });
    
    if (error) {
      console.error('[Push] Failed to save subscription:', error);
      return ctx.json({ error: 'Failed to save subscription' }, { status: 500 });
    }
    
    return ctx.json({ success: true });
  } catch (error) {
    console.error('[Push] Error saving subscription:', error);
    return ctx.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Remove push subscription
 */
export async function removePushSubscription(ctx: APIContext, endpoint: string) {
  try {
    const supabase = await createSupabaseServerClient(ctx);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return ctx.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('[Push] Failed to remove subscription:', error);
      return ctx.json({ error: 'Failed to remove subscription' }, { status: 500 });
    }
    
    return ctx.json({ success: true });
  } catch (error) {
    console.error('[Push] Error removing subscription:', error);
    return ctx.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Send push notification to specific user
 */
export async function sendPushNotification(ctx: APIContext) {
  const request = ctx.request;
  const body = await request.json();
  
  const parsedBody = pushNotificationSchema.safeParse(body);
  if (!parsedBody.success) {
    return ctx.json({ error: 'Invalid notification data' }, { status: 400 });
  }
  
  try {
    const supabase = await createSupabaseServerClient(ctx);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return ctx.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check permissions
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (!userProfile || !['admin', 'manager'].includes(userProfile.role)) {
      return ctx.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Get recipient's subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', parsedBody.data.userId);
    
    if (!subscriptions || subscriptions.length === 0) {
      return ctx.json({ error: 'No active subscriptions for user' }, { status: 404 });
    }
    
    // Send to all subscriptions
    const payload = JSON.stringify({
      title: parsedBody.data.title,
      body: parsedBody.data.body,
      icon: parsedBody.data.icon,
      data: parsedBody.data.data,
      tag: parsedBody.data.tag,
    });
    
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const response = await fetch(sub.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `vapid t=${generateVAPIDToken()}`,
            },
            body: payload,
          });
          
          if (!response.ok) {
            // If subscription is no longer valid, remove it
            if (response.status === 410) {
              await supabase
                .from('push_subscriptions')
                .delete()
                .eq('endpoint', sub.endpoint);
            }
            throw new Error(`Failed to send: ${response.status}`);
          }
          
          return { success: true, endpoint: sub.endpoint };
        } catch (error) {
          console.error('[Push] Failed to send to endpoint:', sub.endpoint, error);
          return { success: false, endpoint: sub.endpoint, error };
        }
      })
    );
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
    
    // Log notification
    await supabase.from('notifications').insert({
      user_id: parsedBody.data.userId,
      title: parsedBody.data.title,
      message: parsedBody.data.body,
      type: parsedBody.data.data?.type || 'system',
      entity_id: parsedBody.data.data?.id,
      read: false,
    });
    
    return ctx.json({ 
      success: true, 
      sent: successful, 
      failed,
      total: subscriptions.length 
    });
  } catch (error) {
    console.error('[Push] Error sending notification:', error);
    return ctx.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Broadcast notification to all users with specific role
 */
export async function broadcastNotification(ctx: APIContext) {
  const request = ctx.request;
  const body = await request.json();
  
  const schema = z.object({
    role: z.enum(['admin', 'manager', 'mechanic', 'sales', 'accountant', 'customer']),
    title: z.string(),
    body: z.string(),
    icon: z.string().optional(),
    data: z.object({
      url: z.string().optional(),
      type: z.enum(['purchase', 'expense', 'task', 'invoice', 'system']),
    }).optional(),
  });
  
  const parsedBody = schema.safeParse(body);
  if (!parsedBody.success) {
    return ctx.json({ error: 'Invalid broadcast data' }, { status: 400 });
  }
  
  try {
    const supabase = await createSupabaseServerClient(ctx);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return ctx.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only admins can broadcast
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (!userProfile || userProfile.role !== 'admin') {
      return ctx.json({ error: 'Only admins can broadcast' }, { status: 403 });
    }
    
    // Get all users with specified role
    const { data: targetUsers } = await supabase
      .from('users')
      .select('id')
      .eq('role', parsedBody.data.role);
    
    if (!targetUsers || targetUsers.length === 0) {
      return ctx.json({ message: 'No users found with specified role' }, { status: 200 });
    }
    
    const userIds = targetUsers.map(u => u.id);
    
    // Get all subscriptions for these users
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds);
    
    if (!subscriptions || subscriptions.length === 0) {
      return ctx.json({ message: 'No active subscriptions found' }, { status: 200 });
    }
    
    const payload = JSON.stringify({
      title: parsedBody.data.title,
      body: parsedBody.data.body,
      icon: parsedBody.data.icon,
      data: parsedBody.data.data,
    });
    
    let successCount = 0;
    let failCount = 0;
    
    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          const response = await fetch(sub.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `vapid t=${generateVAPIDToken()}`,
            },
            body: payload,
          });
          
          if (response.ok) {
            successCount++;
          } else {
            failCount++;
            if (response.status === 410) {
              await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
            }
          }
        } catch {
          failCount++;
        }
      })
    );
    
    // Log broadcast
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'broadcast_notification',
      entity_type: 'notification',
      details: {
        role: parsedBody.data.role,
        title: parsedBody.data.title,
        recipients: userIds.length,
        subscriptions: subscriptions.length,
      },
    });
    
    return ctx.json({ 
      success: true, 
      recipients: userIds.length,
      subscriptions: subscriptions.length,
      sent: successCount,
      failed: failCount 
    });
  } catch (error) {
    console.error('[Push] Error broadcasting notification:', error);
    return ctx.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Get user's push subscriptions
 */
export async function getUserSubscriptions(ctx: APIContext) {
  try {
    const supabase = await createSupabaseServerClient(ctx);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return ctx.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, created_at, updated_at, expiration_time')
      .eq('user_id', user.id);
    
    if (error) {
      return ctx.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }
    
    return ctx.json({ subscriptions: subscriptions || [] });
  } catch (error) {
    console.error('[Push] Error fetching subscriptions:', error);
    return ctx.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to generate VAPID token (simplified - in production use proper JWT)
function generateVAPIDToken(): string {
  // In production, implement proper VAPID JWT generation
  // This is a placeholder
  return 'placeholder-token';
}
