-- ============================================
-- دوچرخه‌یار - Push Notifications & Offline Sync Schema
-- نسخه: 2.1.0
-- توضیحات: جداول و توابع مربوط به نوتیفیکیشن پوش و سینک آفلاین
-- ============================================

-- ============================================
-- جدول سابسکریپشن‌های Push Notification
-- ============================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL, -- { p256dh: string, auth: string }
  expiration_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_endpoint CHECK (endpoint ~ '^https://'),
  CONSTRAINT valid_keys CHECK (
    keys ? 'p256dh' AND 
    keys ? 'auth' AND 
    keys->>'p256dh' IS NOT NULL AND 
    keys->>'auth' IS NOT NULL
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_expiration ON push_subscriptions(expiration_time) WHERE expiration_time IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_updated_at ON push_subscriptions(updated_at DESC);

-- Comments
COMMENT ON TABLE push_subscriptions IS 'ذخیره سابسکریپشن‌های نوتیفیکیشن پوش کاربران';
COMMENT ON COLUMN push_subscriptions.user_id IS 'آیدی کاربر صاحب سابسکریپشن';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'اندپوینت سرویس پوش (Google, Mozilla, etc.)';
COMMENT ON COLUMN push_subscriptions.keys IS 'کلیدهای رمزنگاری (p256dh, auth)';
COMMENT ON COLUMN push_subscriptions.expiration_time IS 'زمان انقضای سابسکریپشن (اختیاری)';

-- ============================================
-- تریگر آپدیت خودکار updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_push_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER tr_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscription_updated_at();

-- ============================================
-- Row Level Security (RLS) برای push_subscriptions
-- ============================================

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- کاربران می‌توانند سابسکریپشن‌های خودشان را ببینند
CREATE POLICY users_can_view_own_subscriptions ON push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- کاربران می‌توانند سابسکریپشن خودشان را ایجاد کنند
CREATE POLICY users_can_insert_own_subscriptions ON push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- کاربران می‌توانند سابسکریپشن خودشان را آپدیت کنند
CREATE POLICY users_can_update_own_subscriptions ON push_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- کاربران می‌توانند سابسکریپشن خودشان را حذف کنند
CREATE POLICY users_can_delete_own_subscriptions ON push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- مدیران می‌توانند همه سابسکریپشن‌ها را ببینند (برای ارسال نوتیفیکیشن)
CREATE POLICY admins_can_view_all_subscriptions ON push_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'STORE_MANAGER')
    )
  );

-- ============================================
-- تابع تمیز کردن سابسکریپشن‌های منقضی‌شده
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_push_subscriptions()
RETURNS void AS $$
BEGIN
  DELETE FROM push_subscriptions
  WHERE expiration_time IS NOT NULL 
    AND expiration_time < NOW();
  
  RAISE NOTICE 'Cleaned up expired push subscriptions';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_expired_push_subscriptions IS 'حذف سابسکریپشن‌های پوش منقضی‌شده';

-- ============================================
-- جدول Queue برای عملیات آفلاین (Sync Queue)
-- ============================================
CREATE TABLE IF NOT EXISTS offline_sync_queue (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  operation_type TEXT NOT NULL, -- 'purchase', 'expense', 'task', 'notification', etc.
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  CONSTRAINT valid_action CHECK (action IN ('create', 'update', 'delete'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_offline_queue_status ON offline_sync_queue(status) WHERE status IN ('pending', 'processing');
CREATE INDEX IF NOT EXISTS idx_offline_queue_user_id ON offline_sync_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_queue_created_at ON offline_sync_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offline_queue_operation ON offline_sync_queue(operation_type);

-- Comments
COMMENT ON TABLE offline_sync_queue IS 'صف عملیات برای سینک زمانی که کاربر آنلاین می‌شود';
COMMENT ON COLUMN offline_sync_queue.operation_type IS 'نوع عملیات (خرید، هزینه، وظیفه، ...)';
COMMENT ON COLUMN offline_sync_queue.action IS 'عملیات CRUD';
COMMENT ON COLUMN offline_sync_queue.payload IS 'داده‌های عملیات به صورت JSON';
COMMENT ON COLUMN offline_sync_queue.retry_count IS 'تعداد تلاش‌های ناموفق';
COMMENT ON COLUMN offline_sync_queue.max_retries IS 'حداکثر تعداد تلاش مجاز';

-- RLS برای offline_sync_queue
ALTER TABLE offline_sync_queue ENABLE ROW LEVEL SECURITY;

-- کاربران می‌توانند آیتم‌های خودشان را ببینند
CREATE POLICY users_can_view_own_queue ON offline_sync_queue
  FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

-- کاربران می‌توانند به صف خودشان اضافه کنند
CREATE POLICY users_can_insert_to_own_queue ON offline_sync_queue
  FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- فقط ادمین‌ها می‌توانند وضعیت را آپدیت کنند
CREATE POLICY admins_can_update_queue ON offline_sync_queue
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'STORE_MANAGER')
    )
  );

-- ============================================
-- تابع افزودن به صف آفلاین
-- ============================================
CREATE OR REPLACE FUNCTION add_to_offline_queue(
  p_operation_type TEXT,
  p_action TEXT,
  p_payload JSONB
)
RETURNS BIGINT AS $$
DECLARE
  v_queue_id BIGINT;
BEGIN
  INSERT INTO offline_sync_queue (user_id, operation_type, action, payload)
  VALUES (auth.uid(), p_operation_type, p_action, p_payload)
  RETURNING id INTO v_queue_id;
  
  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION add_to_offline_queue IS 'افزودن عملیات به صف سینک آفلاین';

-- ============================================
-- تابع پردازش صف آفلاین
-- ============================================
CREATE OR REPLACE FUNCTION process_offline_queue_batch(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  queue_id BIGINT,
  success BOOLEAN,
  error_msg TEXT
) AS $$
DECLARE
  r RECORD;
  v_success BOOLEAN;
  v_error_msg TEXT;
BEGIN
  FOR r IN 
    SELECT * FROM offline_sync_queue
    WHERE status = 'pending' AND retry_count < max_retries
    ORDER BY created_at ASC
    LIMIT p_limit
  LOOP
    BEGIN
      -- Update status to processing
      UPDATE offline_sync_queue
      SET status = 'processing'
      WHERE id = r.id;
      
      -- Process based on operation type
      CASE r.operation_type
        WHEN 'purchase' THEN
          -- Handle purchase sync
          PERFORM sync_purchase_from_queue(r.payload);
        WHEN 'expense' THEN
          -- Handle expense sync
          PERFORM sync_expense_from_queue(r.payload);
        WHEN 'task' THEN
          -- Handle task sync
          PERFORM sync_task_from_queue(r.payload);
        ELSE
          RAISE NOTICE 'Unknown operation type: %', r.operation_type;
      END CASE;
      
      -- Mark as completed
      UPDATE offline_sync_queue
      SET status = 'completed',
          processed_at = NOW()
      WHERE id = r.id;
      
      queue_id := r.id;
      success := true;
      error_msg := NULL;
      
    EXCEPTION WHEN OTHERS THEN
      v_error_msg := SQLERRM;
      
      -- Increment retry count or mark as failed
      IF r.retry_count + 1 >= r.max_retries THEN
        UPDATE offline_sync_queue
        SET status = 'failed',
            retry_count = retry_count + 1,
            error_message = v_error_msg
        WHERE id = r.id;
      ELSE
        UPDATE offline_sync_queue
        SET status = 'pending',
            retry_count = retry_count + 1,
            error_message = v_error_msg
        WHERE id = r.id;
      END IF;
      
      queue_id := r.id;
      success := false;
      error_msg := v_error_msg;
    END;
    
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION process_offline_queue_batch IS 'پردازش دسته‌ای از صف آفلاین';

-- ============================================
-- توابع استاب برای سینک عملیات (باید بر اساس منطق کسب‌وکار تکمیل شوند)
-- ============================================
CREATE OR REPLACE FUNCTION sync_purchase_from_queue(p_payload JSONB)
RETURNS void AS $$
BEGIN
  -- TODO: Implement purchase sync logic
  RAISE NOTICE 'Syncing purchase: %', p_payload;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sync_expense_from_queue(p_payload JSONB)
RETURNS void AS $$
BEGIN
  -- TODO: Implement expense sync logic
  RAISE NOTICE 'Syncing expense: %', p_payload;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sync_task_from_queue(p_payload JSONB)
RETURNS void AS $$
BEGIN
  -- TODO: Implement task sync logic
  RAISE NOTICE 'Syncing task: %', p_payload;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- View برای مانیتورینگ صف
-- ============================================
CREATE OR REPLACE VIEW offline_queue_stats AS
SELECT
  status,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(retry_count) as avg_retries,
  MAX(created_at) as latest_item,
  MIN(created_at) as oldest_item
FROM offline_sync_queue
GROUP BY status;

COMMENT ON VIEW offline_queue_stats IS 'آمار صف سینک آفلاین برای مانیتورینگ';

-- ============================================
-- Grant دسترسی‌ها
-- ============================================
GRANT USAGE ON SEQUENCE offline_sync_queue_id_seq TO authenticated;
GRANT ALL ON offline_sync_queue TO authenticated;
GRANT ALL ON push_subscriptions TO authenticated;

-- ============================================
-- پایان فایل مهاجرت
-- ============================================
