# 🚀 راهنمای راه‌اندازی بک‌اند قدرتمند دوچرخه‌یار

## 📋 فهرست
1. [معرفی](#introduction)
2. [معماری سیستم](#architecture)
3. [راه‌اندازی اولیه](#setup)
4. [اسکیما دیتابیس](#database-schema)
5. [APIهای موجود](#available-apis)
6. [امنیت و دسترسی‌ها](#security)
7. [خروجی گرفتن](#export)

---

## 🎯 معرفی <a id="introduction"></a>

این بک‌اند با استفاده از **Supabase** و **TanStack Start Server Functions** ساخته شده است و ویژگی‌های زیر را دارد:

### ✨ ویژگی‌های کلیدی
- ⚡ **سریع و بهینه**: استفاده از ایندکس‌های هوشمند و کوئری‌های بهینه
- 🔒 **امن**: Row Level Security (RLS) + احراز هویت JWT
- 📊 **Real-time**: همگام‌سازی لحظه‌ای داده‌ها
- 📝 **Activity Log**: ثبت تمام تغییرات برای حسابرسی
- 🎭 **نقش‌محور**: ۶ نقش کاربری با دسترسی‌های متفاوت
- 📱 **Mobile-First**: طراحی شده برای موبایل و PWA
- 🌐 **خروجی Excel/CSV**: پشتیبانی از Export داده‌ها

---

## 🏗️ معماری سیستم <a id="architecture"></a>

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Pages     │  │ Components  │  │    Hooks    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                          │
                          │ TanStack Server Functions
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API Layer (src/server/api)          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  • getPurchases       • createPurchase          │    │
│  │  • getExpenses        • createExpense           │    │
│  │  • getTasks           • createTask              │    │
│  │  • getDashboardStats  • globalSearch            │    │
│  │  • getNotifications   • exportData              │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Supabase Client (Service Role)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase Database                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Tables  │  │Functions │  │   RLS    │              │
│  │  (13)    │  │  (12)    │  │Policies  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 راه‌اندازی اولیه <a id="setup"></a>

### مرحله ۱: نصب وابستگی‌ها
```bash
bun install
```

### مرحله ۲: تنظیم متغیرهای محیطی
فایل `.env` را بررسی کنید:
```bash
# باید این متغیرها وجود داشته باشند
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"  # مهم برای بک‌اند
```

### مرحله ۳: اجرای Migration روی Supabase

#### روش A: از طریق Supabase Dashboard
1. وارد داشبورد Supabase شوید
2. به بخش **SQL Editor** بروید
3. محتوای فایل `supabase/migrations/001_initial_schema.sql` را کپی و اجرا کنید

#### روش B: از طریق CLI
```bash
# نصب Supabase CLI
npm install -g supabase

# لاگین
supabase login

# لینک پروژه
supabase link --project-ref fqkznsjtibrfwsvfoyln

# اجرای migration
supabase db push
```

### مرحله ۴: تأیید راه‌اندازی
```bash
# اجرای پروژه در حالت توسعه
bun run dev

# ساخت نسخه production
bun run build

# پیش‌نمایش نسخه production
bun run preview
```

---

## 🗄️ اسکیما دیتابیس <a id="database-schema"></a>

### جداول اصلی (13 جدول)

| جدول | توضیحات | تعداد فیلد |
|------|---------|-----------|
| `profiles` | پروفایل کاربران | 13 |
| `user_roles` | نقش‌های کاربران | 4 |
| `bicycle_purchases` | خریدهای دوچرخه | 13 |
| `expenses` | هزینه‌ها | 13 |
| `tasks` | وظایف کارگران | 20 |
| `purchase_invoices` | فاکتورهای خرید | 10 |
| `invoice_items` | اقلام فاکتور | 9 |
| `notifications` | اعلان‌ها | 13 |
| `messages` | پیام‌های چت | 7 |
| `app_settings` | تنظیمات برنامه | 8 |
| `activity_log` | لاگ فعالیت‌ها | 8 |
| `custom_roles` | نقش‌های سفارشی | 6 |
| `chat_groups` | گروه‌های چت | 5 |

### ENUMها (8 نوع)
- `app_role`: نقش‌های کاربری
- `bike_type`: انواع دوچرخه
- `purchase_status`: وضعیت خرید
- `expense_category`: دسته‌بندی هزینه
- `task_status`: وضعیت وظیفه
- `task_priority`: اولویت وظیفه
- `invoice_status`: وضعیت فاکتور
- `notification_type`: نوع اعلان
- `notification_priority`: اولویت اعلان

### توابع ذخیره‌شده (12 تابع)
| تابع | توضیحات |
|------|---------|
| `has_role()` | بررسی نقش کاربر |
| `is_manager()` | بررسی مدیر بودن |
| `claim_task()` | دریافت وظیفه اتمیک |
| `get_user_permissions()` | دریافت دسترسی‌ها |
| `mark_notification_read()` | علامت‌گذاری اعلان |
| `mark_all_notifications_read()` | همه اعلان‌ها |
| `create_notification()` | ایجاد اعلان |
| `archive_user()` | بایگانی کاربر |
| `restore_user()` | بازگرداندن کاربر |
| `get_dashboard_stats()` | آمار داشبورد |
| `global_search()` | جستجوی سراسری |
| `update_updated_at_column()` | آپدیت خودکار timestamp |

---

## 🔌 APIهای موجود <a id="available-apis"></a>

### Bicycle Purchases API

#### `getPurchases`
```typescript
GET /api/purchases
Params: { page, limit, status, dateFrom, dateTo, search }
Returns: ApiResult<BicyclePurchase[]>
```

#### `createPurchase`
```typescript
POST /api/purchases
Body: { size, brand, color, bikeType, purchasePrice, description }
Returns: ApiResult<BicyclePurchase>
```

#### `updatePurchase`
```typescript
PUT /api/purchases/:id
Body: { id, size?, brand?, color?, status?, reviewNote? }
Returns: ApiResult<BicyclePurchase>
```

#### `deletePurchase`
```typescript
DELETE /api/purchases/:id
Body: { id }
Returns: ApiResult<void>
```

### Expenses API

#### `getExpenses`
```typescript
GET /api/expenses
Params: { page, limit, status, dateFrom, dateTo }
Returns: ApiResult<Expense[]>
```

#### `createExpense`
```typescript
POST /api/expenses
Body: { category, name, amount, date, description, relatedUserId? }
Returns: ApiResult<Expense>
```

### Tasks API

#### `getTasks`
```typescript
GET /api/tasks
Params: { page, limit, status, workerId, priority }
Returns: ApiResult<Task[]>
```

#### `createTask`
```typescript
POST /api/tasks
Body: { workerId, bikeId?, title, description, priority, dueDate?, wage }
Returns: ApiResult<Task>
```

#### `updateTaskStatus`
```typescript
PATCH /api/tasks/:id
Body: { id, status, completedNote?, finalWage?, rejectReason? }
Returns: ApiResult<Task>
```

### Dashboard & Stats

#### `getDashboardStats`
```typescript
GET /api/dashboard/stats
Returns: ApiResult<{
  totalPurchases: number,
  pendingPurchases: number,
  totalExpenses: number,
  activeTasks: number,
  totalUsers: number,
  ...
}>
```

### Notifications API

#### `getNotifications`
```typescript
GET /api/notifications
Params: { limit?, unreadOnly? }
Returns: ApiResult<Notification[]>
```

#### `markNotificationRead`
```typescript
POST /api/notifications/read
Body: { notificationId }
Returns: ApiResult<void>
```

#### `markAllNotificationsRead`
```typescript
POST /api/notifications/read-all
Returns: ApiResult<number> // تعداد اعلان‌های خوانده‌شده
```

### Search & Export

#### `globalSearch`
```typescript
GET /api/search
Params: { query }
Returns: ApiResult<{
  entity_type: string,
  record_id: UUID,
  title: string,
  description: string,
  relevance_score: number
}[]>
```

#### `exportData`
```typescript
POST /api/export
Body: { entity, format, dateFrom?, dateTo? }
Returns: ApiResult<string> // CSV or JSON content
```

---

## 🔐 امنیت و دسترسی‌ها <a id="security"></a>

### نقش‌های کاربری

| نقش | دسترسی‌ها |
|-----|----------|
| **ADMIN** | دسترسی کامل به همه چیز |
| **STORE_MANAGER** | مدیریت خرید، هزینه، وظایف، فاکتور |
| **EMPLOYEE** | ثبت خرید و هزینه، مشاهده وظایف |
| **MECHANIC** | فقط وظایف محول‌شده |
| **ACCOUNTANT** | مشاهده هزینه‌ها و فاکتورها |
| **VIEWER** | فقط مشاهده |

### Row Level Security (RLS)

تمام جداول دارای RLS هستند. مثال:

```sql
-- فقط مدیران می‌توانند همه پروفایل‌ها را ببینند
CREATE POLICY "Managers can view all profiles"
  ON profiles FOR SELECT
  USING (has_role(auth.uid(), 'ADMIN') OR has_role(auth.uid(), 'STORE_MANAGER'));

-- کاربران فقط اعلان‌های خود را می‌بینند
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (
    auth.uid() = ANY(user_ids) OR
    has_role(auth.uid(), ANY(user_roles))
  );
```

### Activity Logging

تمام عملیات CRUD به‌صورت خودکار لاگ می‌شوند:

```typescript
// نمونه لاگ ثبت‌شده
{
  entity: "bicycle_purchase",
  record_id: "uuid",
  user_id: "uuid",
  action: "CREATE", // یا UPDATE, DELETE, STATUS_UPDATE
  before_data: {...}, // فقط برای UPDATE
  after_data: {...},
  created_at: "2024-01-15T10:30:00Z"
}
```

---

## 📤 خروجی گرفتن <a id="export"></a>

### فرمت‌های پشتیبانی‌شده
- ✅ **CSV** (UTF-8 با BOM برای سازگاری با Excel فارسی)
- ✅ **JSON**

### مثال Export

```typescript
// Export خریدهای دوچرخه به CSV
const result = await exportData({
  entity: 'purchases',
  format: 'csv',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});

if (result.success) {
  // دانلود فایل CSV
  const blob = new Blob([result.data!], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'purchases-2024.csv';
  link.click();
}
```

---

## 🚀 نکات عملکردی

### بهینه‌سازی‌های انجام‌شده

1. **ایندکس‌های هوشمند**:
   - ایندکس روی `created_at DESC` برای مرتب‌سازی سریع
   - ایندکس ترکیبی روی `entity + record_id` برای activity_log
   - ایندکس GIN روی آرایه‌های `user_roles` و `user_ids`

2. **کوئری‌های بهینه**:
   - استفاده از `select` با فیلد‌های مشخص
   - Pagination با `range` به جای offset بزرگ
   - Joins محدود و هدفمند

3. **Transaction Support**:
   - عملیات اتمیک برای claim_task
   - Batch insert/update برای کارایی بهتر

4. **Caching Strategy**:
   - استفاده از React Query برای client-side caching
   - Invalidat_on_mutate برای به‌روزرسانی خودکار

---

## 📞 پشتیبانی

برای گزارش مشکل یا درخواست ویژگی جدید، لطفاً از طریق Issues گیت‌هاب اقدام کنید.

---

**ساخته‌شده با ❤️ برای دوچرخه‌یار**
