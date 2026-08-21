-- ============================================
-- دوچرخه‌یار - Supabase Schema & Security
-- نسخه: 2.0.0 (Production-Ready)
-- توضیحات: اسکیما کامل، امن و بهینه برای سیستم مدیریت فروشگاه و تعمیرگاه دوچرخه
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS - انواع داده‌ای
-- ============================================

DO $$ BEGIN
  CREATE TYPE app_role AS ENUM (
    'ADMIN',
    'STORE_MANAGER',
    'EMPLOYEE',
    'MECHANIC',
    'ACCOUNTANT',
    'VIEWER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE bike_type AS ENUM ('GIRL', 'BOY', 'SPORT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE purchase_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'SYNCED_TO_ACCOUNTING',
    'CANCELLED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE expense_category AS ENUM (
    'RENT',
    'UTILITIES',
    'SALARIES',
    'REPAIR_PARTS',
    'MARKETING',
    'TRANSPORT',
    'OFFICE_SUPPLIES',
    'MISCELLANEOUS'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'SUBMITTED',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM (
    'PRE_INVOICE',
    'FINALIZED',
    'APPROVED',
    'SYNCED_TO_ACCOUNTING',
    'CANCELLED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'INFO',
    'WARNING',
    'ERROR',
    'SUCCESS',
    'TASK_ASSIGNED',
    'TASK_UPDATED',
    'PURCHASE_APPROVED',
    'PURCHASE_REJECTED',
    'EXPENSE_APPROVED',
    'EXPENSE_REJECTED',
    'INVOICE_UPDATED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_priority AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLES - جداول اصلی
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL DEFAULT '',
  username VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL DEFAULT '',
  title VARCHAR(100) NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  is_worker BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  custom_role VARCHAR(100),
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Bicycle purchases table
CREATE TABLE IF NOT EXISTS bicycle_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  size VARCHAR(20) NOT NULL DEFAULT '',
  brand VARCHAR(100) NOT NULL DEFAULT '',
  color VARCHAR(50) NOT NULL DEFAULT '',
  bike_type bike_type NOT NULL DEFAULT 'BOY',
  purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  created_by UUID NOT NULL REFERENCES profiles(id),
  status purchase_status NOT NULL DEFAULT 'PENDING',
  review_note TEXT,
  accounting_ref UUID,
  repair_task_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category expense_category NOT NULL DEFAULT 'MISCELLANEOUS',
  name VARCHAR(255),
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL DEFAULT '',
  related_user_id UUID REFERENCES profiles(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  status purchase_status NOT NULL DEFAULT 'PENDING',
  review_note TEXT,
  accounting_ref UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES profiles(id),
  bike_id UUID REFERENCES bicycle_purchases(id),
  title VARCHAR(255) NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  priority task_priority NOT NULL DEFAULT 'MEDIUM',
  due_date DATE,
  wage NUMERIC(12, 2) NOT NULL DEFAULT 0,
  final_wage NUMERIC(12, 2),
  status task_status NOT NULL DEFAULT 'PENDING',
  created_by UUID NOT NULL REFERENCES profiles(id),
  completed_note TEXT,
  photo TEXT,
  photos TEXT[] DEFAULT '{}',
  reject_reason TEXT,
  accounting_ref UUID,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  accounting_at TIMESTAMPTZ,
  wage_note TEXT,
  edit_request TEXT,
  edit_request_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purchase invoices table
CREATE TABLE IF NOT EXISTS purchase_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(100) NOT NULL DEFAULT '',
  supplier VARCHAR(255) NOT NULL DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status invoice_status NOT NULL DEFAULT 'PRE_INVOICE',
  notes TEXT NOT NULL DEFAULT '',
  created_by UUID NOT NULL REFERENCES profiles(id),
  accounting_ref UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL DEFAULT '',
  probable_qty NUMERIC(10, 2) NOT NULL DEFAULT 0,
  probable_unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  final_qty NUMERIC(10, 2),
  final_unit_price NUMERIC(12, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_roles app_role[] NOT NULL DEFAULT '{}',
  user_ids UUID[] DEFAULT '{}',
  title VARCHAR(255) NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  url TEXT DEFAULT '',
  type notification_type NOT NULL DEFAULT 'INFO',
  priority notification_priority NOT NULL DEFAULT 'NORMAL',
  vibrate_pattern INTEGER[] DEFAULT '{}',
  deliver_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered BOOLEAN NOT NULL DEFAULT false,
  read_by UUID[] DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel VARCHAR(100) NOT NULL,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  text TEXT NOT NULL DEFAULT '',
  attachment JSONB,
  read_by UUID[] DEFAULT '{}',
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- App settings table (singleton)
CREATE TABLE IF NOT EXISTS app_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true,
  currency VARCHAR(10) NOT NULL DEFAULT 'TOMAN',
  alarms JSONB NOT NULL DEFAULT '{}'::jsonb,
  custom_roles JSONB NOT NULL DEFAULT '[]'::jsonb,
  chat_groups JSONB NOT NULL DEFAULT '[]'::jsonb,
  login_banner TEXT,
  app_banner TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = true)
);

-- Activity log table (immutable audit trail)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  before_data JSONB,
  after_data JSONB,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Custom roles table
CREATE TABLE IF NOT EXISTS custom_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  base_role app_role NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chat groups table
CREATE TABLE IF NOT EXISTS chat_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  member_ids UUID[] NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES - ایندکس‌های بهینه‌سازی
-- ============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_is_archived ON profiles(is_archived);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Bicycle purchases indexes
CREATE INDEX IF NOT EXISTS idx_bicycle_purchases_created_at ON bicycle_purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bicycle_purchases_status ON bicycle_purchases(status);
CREATE INDEX IF NOT EXISTS idx_bicycle_purchases_created_by ON bicycle_purchases(created_by);
CREATE INDEX IF NOT EXISTS idx_bicycle_purchases_bike_type ON bicycle_purchases(bike_type);

-- Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON expenses(created_by);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_worker_id ON tasks(worker_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Purchase invoices indexes
CREATE INDEX IF NOT EXISTS idx_purchase_invoices_created_at ON purchase_invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_invoices_status ON purchase_invoices(status);
CREATE INDEX IF NOT EXISTS idx_purchase_invoices_date ON purchase_invoices(date);

-- Invoice items indexes
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_delivered ON notifications(delivered);
CREATE INDEX IF NOT EXISTS idx_notifications_deliver_at ON notifications(deliver_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_roles ON notifications USING GIN(user_roles);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_channel_created ON messages(channel, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_record ON activity_log(entity, record_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);

-- ============================================
-- TRIGGERS - تریگرهای خودکار
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_bicycle_purchases_updated_at
  BEFORE UPDATE ON bicycle_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_purchase_invoices_updated_at
  BEFORE UPDATE ON purchase_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_invoice_items_updated_at
  BEFORE UPDATE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- FUNCTIONS & RPC - توابع و رویه‌ها
-- ============================================

-- Check if user has specific role
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is manager (ADMIN or STORE_MANAGER)
CREATE OR REPLACE FUNCTION is_manager(_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role IN ('ADMIN', 'STORE_MANAGER')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Claim a general task (atomic operation)
CREATE OR REPLACE FUNCTION claim_task(_task_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Only workers can claim tasks
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = current_user_id AND is_worker = true) THEN
    RETURN FALSE;
  END IF;
  
  -- Atomically claim the task if it's unassigned
  UPDATE tasks
  SET worker_id = current_user_id,
      status = 'IN_PROGRESS',
      updated_at = NOW()
  WHERE id = _task_id
    AND worker_id IS NULL
    AND status = 'PENDING';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's effective permissions
CREATE OR REPLACE FUNCTION get_user_permissions(_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  user_perms JSONB;
  role_perms JSONB;
  custom_role_name VARCHAR;
BEGIN
  -- Get direct user permissions
  SELECT permissions INTO user_perms
  FROM profiles
  WHERE id = _user_id;
  
  -- Get custom role if exists
  SELECT custom_role INTO custom_role_name
  FROM profiles
  WHERE id = _user_id AND custom_role IS NOT NULL;
  
  IF custom_role_name IS NOT NULL THEN
    SELECT permissions INTO role_perms
    FROM custom_roles
    WHERE name = custom_role_name;
  END IF;
  
  RETURN COALESCE(user_perms, '{}'::jsonb) || COALESCE(role_perms, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Mark notification as read for current user
CREATE OR REPLACE FUNCTION mark_notification_read(_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET read_by = array_append(
    COALESCE(read_by, '{}'),
    auth.uid()
  )
  WHERE id = _notification_id
    AND auth.uid() != ALL(COALESCE(read_by, '{}'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark all notifications as read for current user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE notifications
    SET read_by = array_append(
      COALESCE(read_by, '{}'),
      auth.uid()
    )
    WHERE auth.uid() != ALL(COALESCE(read_by, '{}'))
      AND (auth.uid() = ANY(user_ids) OR auth.uid() IN (SELECT unnest(user_roles)::app_role))
    RETURNING 1
  )
  SELECT COUNT(*) INTO updated_count FROM updated;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notification with automatic delivery
CREATE OR REPLACE FUNCTION create_notification(
  _title VARCHAR,
  _body TEXT,
  _user_roles app_role[],
  _user_ids UUID[] DEFAULT '{}',
  _url TEXT DEFAULT '',
  _type notification_type DEFAULT 'INFO',
  _priority notification_priority DEFAULT 'NORMAL',
  _vibrate_pattern INTEGER[] DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO notifications (
    title, body, user_roles, user_ids, url, type, priority, vibrate_pattern, deliver_at
  ) VALUES (
    _title, _body, _user_roles, _user_ids, _url, _type, _priority, _vibrate_pattern, NOW()
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Soft delete archive user
CREATE OR REPLACE FUNCTION archive_user(_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET is_archived = true,
      is_active = false,
      updated_at = NOW()
  WHERE id = _user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restore archived user
CREATE OR REPLACE FUNCTION restore_user(_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET is_archived = false,
      is_active = true,
      updated_at = NOW()
  WHERE id = _user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get dashboard statistics for admin/manager
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'totalPurchases', (SELECT COUNT(*) FROM bicycle_purchases),
    'pendingPurchases', (SELECT COUNT(*) FROM bicycle_purchases WHERE status = 'PENDING'),
    'approvedPurchases', (SELECT COUNT(*) FROM bicycle_purchases WHERE status = 'APPROVED'),
    'totalExpenses', (SELECT SUM(amount) FROM expenses WHERE status = 'APPROVED'),
    'pendingExpenses', (SELECT COUNT(*) FROM expenses WHERE status = 'PENDING'),
    'activeTasks', (SELECT COUNT(*) FROM tasks WHERE status IN ('PENDING', 'IN_PROGRESS', 'SUBMITTED')),
    'completedTasks', (SELECT COUNT(*) FROM tasks WHERE status = 'APPROVED'),
    'pendingInvoices', (SELECT COUNT(*) FROM purchase_invoices WHERE status IN ('PRE_INVOICE', 'FINALIZED')),
    'totalUsers', (SELECT COUNT(*) FROM profiles WHERE is_active = true AND is_archived = false),
    'totalWorkers', (SELECT COUNT(*) FROM profiles WHERE is_worker = true AND is_active = true)
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Search function for universal search
CREATE OR REPLACE FUNCTION global_search(_query TEXT)
RETURNS TABLE(
  entity_type TEXT,
  record_id UUID,
  title TEXT,
  description TEXT,
  relevance_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'bicycle_purchase'::TEXT,
    bp.id,
    CONCAT(bp.brand, ' ', bp.color, ' ', bp.size),
    bp.description,
    ts_rank(to_tsvector('simple', CONCAT(bp.brand, ' ', bp.color, ' ', bp.size, ' ', bp.description)), to_tsquery('simple', _query))
  FROM bicycle_purchases bp
  WHERE to_tsvector('simple', CONCAT(bp.brand, ' ', bp.color, ' ', bp.size, ' ', bp.description)) @@ to_tsquery('simple', _query)
  
  UNION ALL
  
  SELECT 
    'expense'::TEXT,
    e.id,
    COALESCE(e.name, e.category::TEXT),
    e.description,
    ts_rank(to_tsvector('simple', CONCAT(COALESCE(e.name, ''), ' ', e.description)), to_tsquery('simple', _query))
  FROM expenses e
  WHERE to_tsvector('simple', CONCAT(COALESCE(e.name, ''), ' ', e.description)) @@ to_tsquery('simple', _query)
  
  UNION ALL
  
  SELECT 
    'task'::TEXT,
    t.id,
    t.title,
    t.description,
    ts_rank(to_tsvector('simple', CONCAT(t.title, ' ', t.description)), to_tsquery('simple', _query))
  FROM tasks t
  WHERE to_tsvector('simple', CONCAT(t.title, ' ', t.description)) @@ to_tsquery('simple', _query)
  
  UNION ALL
  
  SELECT 
    'invoice'::TEXT,
    pi.id,
    CONCAT(pi.invoice_number, ' - ', pi.supplier),
    pi.notes,
    ts_rank(to_tsvector('simple', CONCAT(pi.invoice_number, ' ', pi.supplier, ' ', pi.notes)), to_tsquery('simple', _query))
  FROM purchase_invoices pi
  WHERE to_tsvector('simple', CONCAT(pi.invoice_number, ' ', pi.supplier, ' ', pi.notes)) @@ to_tsquery('simple', _query)
  
  ORDER BY relevance_score DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- ROW LEVEL SECURITY (RLS) - امنیت سطرداده
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bicycle_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_groups ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - سیاست‌های امنیتی
-- ============================================

-- Profiles policies
CREATE POLICY "Users can view active profiles"
  ON profiles FOR SELECT
  USING (is_active = true AND is_archived = false);

CREATE POLICY "Managers can view all profiles"
  ON profiles FOR SELECT
  USING (has_role(auth.uid(), 'ADMIN') OR has_role(auth.uid(), 'STORE_MANAGER'));

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Managers can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'ADMIN') OR has_role(auth.uid(), 'STORE_MANAGER'));

CREATE POLICY "Managers can update profiles"
  ON profiles FOR UPDATE
  USING (has_role(auth.uid(), 'ADMIN') OR has_role(auth.uid(), 'STORE_MANAGER'));

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Managers can view all roles"
  ON user_roles FOR SELECT
  USING (has_role(auth.uid(), 'ADMIN') OR has_role(auth.uid(), 'STORE_MANAGER'));

CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  USING (has_role(auth.uid(), 'ADMIN'))
  WITH CHECK (has_role(auth.uid(), 'ADMIN'));

-- Bicycle purchases policies
CREATE POLICY "Workers can view pending/approved purchases"
  ON bicycle_purchases FOR SELECT
  USING (
    status IN ('PENDING', 'APPROVED') AND
    (has_role(auth.uid(), 'ADMIN') OR has_role(auth.uid(), 'STORE_MANAGER') OR has_role(auth.uid(), 'EMPLOYEE'))
  );

CREATE POLICY "Managers can view all purchases"
  ON bicycle_purchases FOR SELECT
  USING (has_role(auth.uid(), 'ADMIN') OR has_role(auth.uid(), 'STORE_MANAGER'));

CREATE POLICY "Employees can insert purchases"
  ON bicycle_purchases FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'ADMIN') OR 
    has_role(auth.uid(), 'STORE_MANAGER') OR 
    has_role(auth.uid(), 'EMPLOYEE')
  );

CREATE POLICY "Managers can update purchases"
  ON bicycle_purchases FOR UPDATE
  USING (has_role(auth.uid(), 'ADMIN') OR has_role(auth.uid(), 'STORE_MANAGER'));

CREATE POLICY "Admins can delete purchases"
  ON bicycle_purchases FOR DELETE
  USING (has_role(auth.uid(), 'ADMIN'));

-- Expenses policies
CREATE POLICY "Workers can view approved expenses"
  ON expenses FOR SELECT
  USING (
    status = 'APPROVED' AND
    (has_role(auth.uid(), 'ADMIN') OR has_role(auth.uid(), 'STORE_MANAGER') OR has_role(auth.uid(), 'EMPLOYEE') OR has_role(auth.uid(), 'ACCOUNTANT'))
  );

CREATE POLICY "Managers and accountants can view all expenses"
  ON expenses FOR SELECT
  USING (
    has_role(auth.uid(), 'ADMIN') OR 
    has_role(auth.uid(), 'STORE_MANAGER') OR 
    has_role(auth.uid(), 'ACCOUNTANT')
  );

CREATE POLICY "Workers can insert expenses"
  ON expenses FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'ADMIN') OR 
    has_role(auth.uid(), 'STORE_MANAGER') OR 
    has_role(auth.uid(), 'EMPLOYEE')
  );

CREATE POLICY "Managers can update expenses"
  ON expenses FOR UPDATE
  USING (has_role(auth.uid(), 'ADMIN') OR has_role(auth.uid(), 'STORE_MANAGER') OR has_role(auth.uid(), 'ACCOUNTANT'));

-- Tasks policies
CREATE POLICY "Workers can view assigned tasks"
  ON tasks FOR SELECT
  USING (
    worker_id = auth.uid() OR
    has_role(auth.uid(), 'ADMIN') OR 
    has_role(auth.uid(), 'STORE_MANAGER')
  );

CREATE POLICY "Workers can update own tasks"
  ON tasks FOR UPDATE
  USING (worker_id = auth.uid())
  WITH CHECK (worker_id = auth.uid());

CREATE POLICY "Managers can manage all tasks"
  ON tasks FOR ALL
  USING (has_role(auth.uid(), 'ADMIN') OR has_role(auth.uid(), 'STORE_MANAGER'))
  WITH CHECK (has_role(auth.uid(), 'ADMIN') OR has_role(auth.uid(), 'STORE_MANAGER'));

-- Purchase invoices policies
CREATE POLICY "Managers can view invoices"
  ON purchase_invoices FOR SELECT
  USING (
    has_role(auth.uid(), 'ADMIN') OR 
    has_role(auth.uid(), 'STORE_MANAGER') OR 
    has_role(auth.uid(), 'ACCOUNTANT')
  );

CREATE POLICY "Managers can insert invoices"
  ON purchase_invoices FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'ADMIN') OR 
    has_role(auth.uid(), 'STORE_MANAGER')
  );

CREATE POLICY "Managers can update invoices"
  ON purchase_invoices FOR UPDATE
  USING (
    has_role(auth.uid(), 'ADMIN') OR 
    has_role(auth.uid(), 'STORE_MANAGER') OR 
    has_role(auth.uid(), 'ACCOUNTANT')
  );

-- Invoice items policies (follow parent invoice)
CREATE POLICY "Authorized users can view invoice items"
  ON invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM purchase_invoices pi
      WHERE pi.id = invoice_items.invoice_id
        AND (
          has_role(auth.uid(), 'ADMIN') OR 
          has_role(auth.uid(), 'STORE_MANAGER') OR 
          has_role(auth.uid(), 'ACCOUNTANT')
        )
    )
  );

CREATE POLICY "Managers can manage invoice items"
  ON invoice_items FOR ALL
  USING (
    has_role(auth.uid(), 'ADMIN') OR 
    has_role(auth.uid(), 'STORE_MANAGER')
  )
  WITH CHECK (
    has_role(auth.uid(), 'ADMIN') OR 
    has_role(auth.uid(), 'STORE_MANAGER')
  );

-- Notifications policies
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (
    auth.uid() = ANY(user_ids) OR
    has_role(auth.uid(), ANY(user_roles)) OR
    has_role(auth.uid(), 'ADMIN')
  );

CREATE POLICY "Managers can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'ADMIN') OR 
    has_role(auth.uid(), 'STORE_MANAGER')
  );

CREATE POLICY "Users can update their read status"
  ON notifications FOR UPDATE
  USING (
    auth.uid() = ANY(user_ids) OR
    has_role(auth.uid(), ANY(user_roles))
  )
  WITH CHECK (
    auth.uid() = ANY(user_ids) OR
    has_role(auth.uid(), ANY(user_roles))
  );

-- Messages policies
CREATE POLICY "Users can view channel messages"
  ON messages FOR SELECT
  USING (
    sender_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM chat_groups cg
      WHERE cg.id = messages.channel::UUID
        AND auth.uid() = ANY(cg.member_ids)
    ) OR
    has_role(auth.uid(), 'ADMIN')
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- App settings policies
CREATE POLICY "Everyone can view app settings"
  ON app_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update app settings"
  ON app_settings FOR UPDATE
  USING (has_role(auth.uid(), 'ADMIN'))
  WITH CHECK (has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Admins can insert app settings"
  ON app_settings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'ADMIN'));

-- Activity log policies (read-only for admins)
CREATE POLICY "Admins can view activity log"
  ON activity_log FOR SELECT
  USING (has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "System can insert activity log"
  ON activity_log FOR INSERT
  WITH CHECK (true); -- Insertions happen via secure functions

-- Custom roles policies
CREATE POLICY "Admins can manage custom roles"
  ON custom_roles FOR ALL
  USING (has_role(auth.uid(), 'ADMIN'))
  WITH CHECK (has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Users can view custom roles"
  ON custom_roles FOR SELECT
  USING (true);

-- Chat groups policies
CREATE POLICY "Members can view their groups"
  ON chat_groups FOR SELECT
  USING (
    auth.uid() = ANY(member_ids) OR
    has_role(auth.uid(), 'ADMIN')
  );

CREATE POLICY "Admins can manage chat groups"
  ON chat_groups FOR ALL
  USING (has_role(auth.uid(), 'ADMIN'))
  WITH CHECK (has_role(auth.uid(), 'ADMIN'));

-- ============================================
-- INITIAL DATA - داده‌های اولیه
-- ============================================

-- Insert default app settings
INSERT INTO app_settings (currency, alarms, custom_roles, chat_groups)
VALUES ('TOMAN', '{}'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- COMMENTS - توضیحات
-- ============================================

COMMENT ON TABLE profiles IS 'پروفایل کاربران سیستم - گسترش auth.users';
COMMENT ON TABLE user_roles IS 'نقش‌های کاربران (ADMIN, STORE_MANAGER, EMPLOYEE, MECHANIC, ACCOUNTANT, VIEWER)';
COMMENT ON TABLE bicycle_purchases IS 'خریدهای دوچرخه ثبت‌شده در فروشگاه';
COMMENT ON TABLE expenses IS 'هزینه‌های عملیاتی فروشگاه و تعمیرگاه';
COMMENT ON TABLE tasks IS 'وظایف محول‌شده به کارگران و تعمیرکاران';
COMMENT ON TABLE purchase_invoices IS 'فاکتورهای خرید از تأمین‌کنندگان';
COMMENT ON TABLE invoice_items IS 'اقلام هر فاکتور خرید';
COMMENT ON TABLE notifications IS 'اعلان‌های سیستم برای کاربران';
COMMENT ON TABLE messages IS 'پیام‌های چت بین کاربران';
COMMENT ON TABLE app_settings IS 'تنظیمات کلی برنامه (تک‌سطری)';
COMMENT ON TABLE activity_log IS 'لاگ فعالیت‌ها برای حسابرسی (غیرقابل تغییر)';
COMMENT ON TABLE custom_roles IS 'نقش‌های سفارشی تعریف‌شده توسط ادمین';
COMMENT ON TABLE chat_groups IS 'گروه‌های چت برای ارتباط تیمی';

COMMENT ON FUNCTION has_role IS 'بررسی داشتن نقش خاص توسط کاربر';
COMMENT ON FUNCTION is_manager IS 'بررسی مدیر بودن کاربر (ADMIN یا STORE_MANAGER)';
COMMENT ON FUNCTION claim_task IS 'دریافت وظیفه عمومی توسط کارگر (عملیات اتمیک)';
COMMENT ON FUNCTION get_user_permissions IS 'دریافت دسترسی‌های مؤثر کاربر';
COMMENT ON FUNCTION mark_notification_read IS 'علامت‌گذاری اعلان به‌عنوان خوانده‌شده';
COMMENT ON FUNCTION create_notification IS 'ایجاد اعلان جدید با تحویل خودکار';
COMMENT ON FUNCTION archive_user IS 'غیرفعال‌سازی موقت کاربر (نرم‌افزاری)';
COMMENT ON FUNCTION restore_user IS 'بازگرداندن کاربر بایگانی‌شده';
COMMENT ON FUNCTION get_dashboard_stats IS 'آمار داشبورد برای مدیران';
COMMENT ON FUNCTION global_search IS 'جستجوی سراسری در تمام موجودیت‌ها';
