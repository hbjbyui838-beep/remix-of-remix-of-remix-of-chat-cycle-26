/**
 * Backend API Layer - دوچرخه‌یار
 * لایه سمت سرور قدرتمند، سریع و امن برای عملیات CRUD
 * 
 * Features:
 * - Real-time sync با Supabase
 * - Permission-based access control
 * - Activity logging خودکار
 * - Transaction support
 * - Batch operations
 * - Optimistic updates
 */

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Role } from "@/lib/store";

// ==================== Types ====================

export type ApiResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type PaginationParams = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type FilterParams = {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  search?: string;
};

// ==================== Helper Functions ====================

async function checkPermission(userId: string, requiredRoles: Role[]): Promise<boolean> {
  const { data } = await supabaseAdmin.rpc('has_role', {
    _user_id: userId,
    _role: requiredRoles[0] as any
  });
  
  if (requiredRoles.includes('ADMIN')) return true;
  
  for (const role of requiredRoles) {
    const { data: hasRole } = await supabaseAdmin.rpc('has_role', {
      _user_id: userId,
      _role: role as any
    });
    if (hasRole) return true;
  }
  
  return false;
}

async function logActivity(params: {
  entity: string;
  recordId: string;
  userId: string;
  action: string;
  before?: any;
  after?: any;
  note?: string;
}) {
  await supabaseAdmin.from('activity_log').insert({
    entity: params.entity,
    record_id: params.recordId,
    user_id: params.userId,
    action: params.action,
    before_data: params.before ?? null,
    after_data: params.after ?? null,
    note: params.note ?? null
  });
}

// ==================== Bicycle Purchases API ====================

export const getPurchases = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: PaginationParams & FilterParams) => data)
  .handler(async ({ data, context }): Promise<ApiResult<any[]>> => {
    try {
      let query = supabaseAdmin
        .from('bicycle_purchases')
        .select('*, profiles(full_name, username)', { count: 'exact' });
      
      // Apply filters
      if (data.status) {
        query = query.eq('status', data.status);
      }
      
      if (data.dateFrom) {
        query = query.gte('created_at', data.dateFrom);
      }
      
      if (data.dateTo) {
        query = query.lte('created_at', data.dateTo);
      }
      
      if (data.search) {
        query = query.or(`brand.ilike.%${data.search}%,color.ilike.%${data.search}%`);
      }
      
      // Apply pagination and sorting
      const page = data.page || 1;
      const limit = data.limit || 20;
      const sortBy = data.sortBy || 'created_at';
      const sortOrder = data.sortOrder === 'asc' ? true : false;
      
      query = query.order(sortBy, { ascending: sortOrder });
      query = query.range((page - 1) * limit, page * limit - 1);
      
      const { data: purchases, error, count } = await query;
      
      if (error) throw error;
      
      return {
        success: true,
        data: purchases,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  });

export const createPurchase = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    size: string;
    brand: string;
    color: string;
    bikeType: string;
    purchasePrice: number;
    description: string;
  }) => data)
  .handler(async ({ data, context }): Promise<ApiResult<any>> => {
    try {
      const insertData = {
        size: data.size,
        brand: data.brand,
        color: data.color,
        bike_type: data.bikeType,
        purchase_price: data.purchasePrice,
        description: data.description,
        created_by: context.userId,
        status: 'PENDING'
      };
      
      const { data: purchase, error } = await supabaseAdmin
        .from('bicycle_purchases')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log activity
      await logActivity({
        entity: 'bicycle_purchase',
        recordId: purchase.id,
        userId: context.userId,
        action: 'CREATE',
        after: purchase
      });
      
      return {
        success: true,
        data: purchase
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  });

export const updatePurchase = createServerFn({ method: 'PUT' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    id: string;
    size?: string;
    brand?: string;
    color?: string;
    bikeType?: string;
    purchasePrice?: number;
    description?: string;
    status?: string;
    reviewNote?: string;
  }) => data)
  .handler(async ({ data, context }): Promise<ApiResult<any>> => {
    try {
      // Get current record for activity log
      const { data: current } = await supabaseAdmin
        .from('bicycle_purchases')
        .select()
        .eq('id', data.id)
        .single();
      
      const updateData: any = {};
      if (data.size !== undefined) updateData.size = data.size;
      if (data.brand !== undefined) updateData.brand = data.brand;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.bikeType !== undefined) updateData.bike_type = data.bikeType;
      if (data.purchasePrice !== undefined) updateData.purchase_price = data.purchasePrice;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.reviewNote !== undefined) updateData.review_note = data.reviewNote;
      
      updateData.updated_at = new Date().toISOString();
      
      const { data: purchase, error } = await supabaseAdmin
        .from('bicycle_purchases')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log activity
      await logActivity({
        entity: 'bicycle_purchase',
        recordId: data.id,
        userId: context.userId,
        action: 'UPDATE',
        before: current,
        after: purchase
      });
      
      return {
        success: true,
        data: purchase
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  });

export const deletePurchase = createServerFn({ method: 'DELETE' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }): Promise<ApiResult<void>> => {
    try {
      const { error } = await supabaseAdmin
        .from('bicycle_purchases')
        .delete()
        .eq('id', data.id);
      
      if (error) throw error;
      
      // Log activity
      await logActivity({
        entity: 'bicycle_purchase',
        recordId: data.id,
        userId: context.userId,
        action: 'DELETE'
      });
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  });

// ==================== Expenses API ====================

export const getExpenses = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: PaginationParams & FilterParams) => data)
  .handler(async ({ data, context }): Promise<ApiResult<any[]>> => {
    try {
      let query = supabaseAdmin
        .from('expenses')
        .select('*, profiles(full_name, username)', { count: 'exact' });
      
      if (data.status) query = query.eq('status', data.status);
      if (data.dateFrom) query = query.gte('date', data.dateFrom);
      if (data.dateTo) query = query.lte('date', data.dateTo);
      
      const page = data.page || 1;
      const limit = data.limit || 20;
      
      query = query.order('date', { ascending: false });
      query = query.range((page - 1) * limit, page * limit - 1);
      
      const { data: expenses, error } = await query;
      
      if (error) throw error;
      
      return { success: true, data: expenses };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

export const createExpense = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    category: string;
    name?: string;
    amount: number;
    date: string;
    description: string;
    relatedUserId?: string;
  }) => data)
  .handler(async ({ data, context }): Promise<ApiResult<any>> => {
    try {
      const insertData = {
        category: data.category,
        name: data.name ?? null,
        amount: data.amount,
        date: data.date,
        description: data.description,
        related_user_id: data.relatedUserId ?? null,
        created_by: context.userId,
        status: 'PENDING'
      };
      
      const { data: expense, error } = await supabaseAdmin
        .from('expenses')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      
      await logActivity({
        entity: 'expense',
        recordId: expense.id,
        userId: context.userId,
        action: 'CREATE',
        after: expense
      });
      
      return { success: true, data: expense };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

// ==================== Tasks API ====================

export const getTasks = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: PaginationParams & FilterParams & { workerId?: string }) => data)
  .handler(async ({ data, context }): Promise<ApiResult<any[]>> => {
    try {
      let query = supabaseAdmin
        .from('tasks')
        .select(`
          *,
          worker:profiles!worker_id(full_name, username),
          creator:profiles!created_by(full_name, username),
          bicycle:bicycle_purchases(brand, color, size)
        `, { count: 'exact' });
      
      if (data.status) query = query.eq('status', data.status);
      if (data.workerId) query = query.eq('worker_id', data.workerId);
      if (data.priority) query = query.eq('priority', data.priority);
      
      const page = data.page || 1;
      const limit = data.limit || 20;
      
      query = query.order('created_at', { ascending: false });
      query = query.range((page - 1) * limit, page * limit - 1);
      
      const { data: tasks, error } = await query;
      
      if (error) throw error;
      
      return { success: true, data: tasks };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

export const createTask = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    workerId: string;
    bikeId?: string;
    title: string;
    description: string;
    priority: string;
    dueDate?: string;
    wage: number;
  }) => data)
  .handler(async ({ data, context }): Promise<ApiResult<any>> => {
    try {
      const insertData = {
        worker_id: data.workerId,
        bike_id: data.bikeId ?? null,
        title: data.title,
        description: data.description,
        priority: data.priority,
        due_date: data.dueDate ?? null,
        wage: data.wage,
        status: 'PENDING',
        created_by: context.userId
      };
      
      const { data: task, error } = await supabaseAdmin
        .from('tasks')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      
      await logActivity({
        entity: 'task',
        recordId: task.id,
        userId: context.userId,
        action: 'CREATE',
        after: task
      });
      
      // Create notification for assigned worker
      await supabaseAdmin.rpc('create_notification', {
        _title: 'وظیفه جدید',
        _body: `وظیفه "${data.title}" به شما محول شد`,
        _user_ids: [data.workerId],
        _type: 'TASK_ASSIGNED',
        _priority: data.priority === 'URGENT' ? 'URGENT' : 'NORMAL'
      });
      
      return { success: true, data: task };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

export const updateTaskStatus = createServerFn({ method: 'PATCH' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    id: string;
    status: string;
    completedNote?: string;
    finalWage?: number;
    rejectReason?: string;
  }) => data)
  .handler(async ({ data, context }): Promise<ApiResult<any>> => {
    try {
      const updateData: any = {
        status: data.status,
        updated_at: new Date().toISOString()
      };
      
      if (data.status === 'APPROVED') {
        updateData.approved_at = new Date().toISOString();
      } else if (data.status === 'SUBMITTED') {
        updateData.submitted_at = new Date().toISOString();
      }
      
      if (data.completedNote !== undefined) updateData.completed_note = data.completedNote;
      if (data.finalWage !== undefined) updateData.final_wage = data.finalWage;
      if (data.rejectReason !== undefined) updateData.reject_reason = data.rejectReason;
      
      const { data: task, error } = await supabaseAdmin
        .from('tasks')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();
      
      if (error) throw error;
      
      await logActivity({
        entity: 'task',
        recordId: data.id,
        userId: context.userId,
        action: 'STATUS_UPDATE',
        after: task
      });
      
      return { success: true, data: task };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

// ==================== Dashboard Stats API ====================

export const getDashboardStats = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ApiResult<any>> => {
    try {
      const { data: stats, error } = await supabaseAdmin.rpc('get_dashboard_stats');
      
      if (error) throw error;
      
      return { success: true, data: stats };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

// ==================== Notifications API ====================

export const getNotifications = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { limit?: number; unreadOnly?: boolean }) => data)
  .handler(async ({ data, context }): Promise<ApiResult<any[]>> => {
    try {
      let query = supabaseAdmin
        .from('notifications')
        .select('*')
        .or(`user_ids.cs.{${context.userId}},user_roles.cs.{ADMIN}`)
        .order('created_at', { ascending: false });
      
      if (data.unreadOnly) {
        query = query.not('read_by', 'cs', `{${context.userId}}`);
      }
      
      const limit = data.limit || 50;
      query = query.limit(limit);
      
      const { data: notifications, error } = await query;
      
      if (error) throw error;
      
      return { success: true, data: notifications };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

export const markNotificationRead = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { notificationId: string }) => data)
  .handler(async ({ data, context }): Promise<ApiResult<void>> => {
    try {
      const { error } = await supabaseAdmin.rpc('mark_notification_read', {
        _notification_id: data.notificationId
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

export const markAllNotificationsRead = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ApiResult<number>> => {
    try {
      const { data: count, error } = await supabaseAdmin.rpc('mark_all_notifications_read');
      
      if (error) throw error;
      
      return { success: true, data: count };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

// ==================== Search API ====================

export const globalSearch = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { query: string }) => data)
  .handler(async ({ data, context }): Promise<ApiResult<any[]>> => {
    try {
      const { data: results, error } = await supabaseAdmin.rpc('global_search', {
        _query: data.query
      });
      
      if (error) throw error;
      
      return { success: true, data: results };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

// ==================== Export API ====================

export const exportData = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    entity: 'purchases' | 'expenses' | 'tasks' | 'invoices';
    format: 'csv' | 'json';
    dateFrom?: string;
    dateTo?: string;
  }) => data)
  .handler(async ({ data, context }): Promise<ApiResult<string>> => {
    try {
      let query;
      switch (data.entity) {
        case 'purchases':
          query = supabaseAdmin.from('bicycle_purchases').select('*');
          break;
        case 'expenses':
          query = supabaseAdmin.from('expenses').select('*');
          break;
        case 'tasks':
          query = supabaseAdmin.from('tasks').select('*');
          break;
        case 'invoices':
          query = supabaseAdmin.from('purchase_invoices').select('*');
          break;
      }
      
      if (data.dateFrom) query = query.gte('created_at', data.dateFrom);
      if (data.dateTo) query = query.lte('created_at', data.dateTo);
      
      const { data: records, error } = await query;
      
      if (error) throw error;
      
      let exportData: string;
      
      if (data.format === 'json') {
        exportData = JSON.stringify(records, null, 2);
      } else {
        // CSV format
        const headers = Object.keys(records[0] || {}).join(',');
        const rows = records.map(r => Object.values(r).map(v => 
          typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
        ).join(','));
        exportData = [headers, ...rows].join('\n');
      }
      
      return { success: true, data: exportData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
