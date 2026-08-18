import { nowISO } from "./datetime";
/**
 * Cloud persistence layer. The app keeps its familiar in-memory state shape and
 * this module mirrors every change to the shared cloud database, so all devices
 * of the shop see the same data (with realtime updates).
 */
import { supabase } from "@/integrations/supabase/client";

import type {
  ActivityEntry,
  AlarmSettings,
  AppNotification,
  BicyclePurchase,
  BikeType,
  ChatMessage,
  Expense,
  ExpenseCategory,
  InvoiceStatus,
  Priority,
  PurchaseInvoice,
  Role,
  State,
  Task,
  TaskStatus,
  User,
} from "./store";
import { saveTeamUser } from "./users.functions";

// Rows come back as loose JSON from the Data API.
type Row = any;

const num = (v: unknown) => Number(v ?? 0);
const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : nowISO());

/* ---------- mappers ---------- */

function userFromRow(p: Row, role: Role): User {
  const out = {
    id: p.id,
    fullName: p.full_name ?? "",
    username: p.username ?? "",
    phone: p.phone ?? "",
    password: "",
    role,
    isActive: !!p.is_active,
    isWorker: !!p.is_worker,
    isArchived: !!p.is_archived,
    customRole: p.custom_role ?? undefined,
    title: p.title ?? "",
    bio: (p.bio as string | null) ?? "",
    permissions: (p.permissions ?? {}) as Record<string, boolean>,
  };
  return out as unknown as User;
}


function purchaseFromRow(r: Row): BicyclePurchase {
  const out = {
    id: r.id,
    size: r.size ?? "",
    brand: r.brand ?? "",
    color: r.color ?? "",
    bikeType: (r.bike_type ?? "BOY") as BikeType,
    purchasePrice: num(r.purchase_price),
    description: r.description ?? "",
    createdBy: r.created_by,
    status: r.status,
    reviewNote: r.review_note ?? undefined,
    accountingRef: r.accounting_ref ?? undefined,
    repairTaskId: r.repair_task_id ?? undefined,
    createdAt: iso(r.created_at),
  };
  return out as unknown as BicyclePurchase;
}

const purchaseToRow = (p: BicyclePurchase): Row => ({
  id: p.id,
  size: p.size,
  brand: p.brand,
  color: p.color,
  bike_type: p.bikeType,
  purchase_price: p.purchasePrice,
  description: p.description,
  created_by: p.createdBy,
  status: p.status,
  review_note: p.reviewNote ?? null,
  accounting_ref: p.accountingRef ?? null,
  repair_task_id: p.repairTaskId ?? null,
});

function expenseFromRow(r: Row): Expense {
  const out = {
    id: r.id,
    category: (r.category ?? "MISCELLANEOUS") as ExpenseCategory,
    name: r.name ?? undefined,
    amount: num(r.amount),
    date: r.date ?? "",
    description: r.description ?? "",
    relatedUserId: r.related_user_id ?? undefined,
    createdBy: r.created_by,
    status: r.status,
    reviewNote: r.review_note ?? undefined,
    accountingRef: r.accounting_ref ?? undefined,
  };
  return out as unknown as Expense;
}

const expenseToRow = (e: Expense): Row => ({
  id: e.id,
  category: e.category,
  name: e.name ?? null,
  amount: e.amount,
  date: e.date || nowISO().slice(0, 10),
  description: e.description,
  related_user_id: e.relatedUserId ?? null,
  created_by: e.createdBy,
  status: e.status,
  review_note: e.reviewNote ?? null,
  accounting_ref: e.accountingRef ?? null,
});

function taskFromRow(r: Row): Task {
  const out = {
    id: r.id,
    workerId: r.worker_id ?? "",
    bikeId: r.bike_id ?? undefined,
    title: r.title ?? "",
    description: r.description ?? "",
    priority: (r.priority ?? "MEDIUM") as Priority,
    dueDate: r.due_date ?? undefined,
    wage: num(r.wage),
    finalWage: r.final_wage == null ? undefined : num(r.final_wage),
    status: (r.status ?? "PENDING") as TaskStatus,
    createdBy: r.created_by,
    completedNote: r.completed_note ?? undefined,
    photo: r.photo ?? undefined,
    photos: Array.isArray(r.photos) ? (r.photos as string[]) : [],
    rejectReason: r.reject_reason ?? undefined,
    accountingRef: r.accounting_ref ?? undefined,
    createdAt: iso(r.created_at),
    submittedAt: r.submitted_at ?? undefined,
    approvedAt: r.approved_at ?? undefined,
    accountingAt: r.accounting_at ?? undefined,
    wageNote: r.wage_note ?? undefined,
    editRequest: r.edit_request ?? undefined,
    editRequestAt: r.edit_request_at ?? undefined,
    updatedAt: r.updated_at ?? undefined,
  };
  return out as unknown as Task;
}

const taskToRow = (t: Task): Row => ({
  id: t.id,
  worker_id: t.workerId || null,
  bike_id: t.bikeId ?? null,
  title: t.title,
  description: t.description,
  priority: t.priority,
  due_date: t.dueDate || null,
  wage: t.wage,
  final_wage: t.finalWage ?? null,
  status: t.status,
  created_by: t.createdBy,
  completed_note: t.completedNote ?? null,
  photo: t.photo ?? null,
  photos: t.photos ?? [],
  reject_reason: t.rejectReason ?? null,
  accounting_ref: t.accountingRef ?? null,
  submitted_at: t.submittedAt ?? null,
  approved_at: t.approvedAt ?? null,
  accounting_at: t.accountingAt ?? null,
  wage_note: t.wageNote ?? null,
  edit_request: t.editRequest ?? null,
  edit_request_at: t.editRequestAt ?? null,
});

function invoiceFromRow(r: Row): PurchaseInvoice {
  const out = {
    id: r.id,
    invoiceNumber: r.invoice_number ?? "",
    supplier: r.supplier ?? "",
    date: r.date ?? "",
    status: (r.status ?? "PRE_INVOICE") as InvoiceStatus,
    notes: r.notes ?? "",
    createdBy: r.created_by,
    accountingRef: r.accounting_ref ?? undefined,
    items: ((r.invoice_items ?? []) as Row[]).map((i) => ({
      id: i.id,
      productName: i.product_name ?? "",
      probableQty: num(i.probable_qty),
      probableUnitPrice: num(i.probable_unit_price),
      finalQty: i.final_qty == null ? undefined : num(i.final_qty),
      finalUnitPrice: i.final_unit_price == null ? undefined : num(i.final_unit_price),
      notes: i.notes ?? undefined,
    })),
  };
  return out as unknown as PurchaseInvoice;
}

const invoiceToRow = (v: PurchaseInvoice): Row => ({
  id: v.id,
  invoice_number: v.invoiceNumber,
  supplier: v.supplier,
  date: v.date || nowISO().slice(0, 10),
  status: v.status,
  notes: v.notes,
  created_by: v.createdBy,
  accounting_ref: v.accountingRef ?? null,
});

const itemToRow = (invoiceId: string, i: PurchaseInvoice["items"][number]): Row => ({
  id: i.id,
  invoice_id: invoiceId,
  product_name: i.productName,
  probable_qty: i.probableQty,
  probable_unit_price: i.probableUnitPrice,
  final_qty: i.finalQty ?? null,
  final_unit_price: i.finalUnitPrice ?? null,
  notes: i.notes ?? null,
});

function notificationFromRow(r: Row, viewerId: string | null): AppNotification {
  const readBy = (r.read_by ?? []) as string[];
  const out = {
    id: r.id,
    userRole: (r.user_roles ?? []) as Role[],
    userIds: ((r.user_ids ?? []) as string[]).length ? (r.user_ids as string[]) : undefined,
    title: r.title ?? "",
    body: r.body ?? "",
    url: r.url ?? "",
    type: r.type,
    priority: r.priority,
    isRead: !!viewerId && readBy.includes(viewerId),
    createdAt: iso(r.created_at),
    vibratePattern: (r.vibrate_pattern ?? undefined) as number[] | undefined,
    deliverAt: iso(r.deliver_at),
    delivered: !!r.delivered,
  };
  return out as unknown as AppNotification;
}

const notificationToRow = (n: AppNotification, viewerId: string | null, prevRead: string[] = []): Row => {
  const readBy = new Set(prevRead);
  if (viewerId) {
    if (n.isRead) readBy.add(viewerId);
    else readBy.delete(viewerId);
  }
  return {
    id: n.id,
    user_roles: n.userRole,
    user_ids: n.userIds ?? [],
    title: n.title,
    body: n.body,
    url: n.url,
    type: n.type,
    priority: n.priority,
    vibrate_pattern: n.vibratePattern ?? null,
    deliver_at: n.deliverAt,
    delivered: n.delivered,
    read_by: [...readBy],
    created_by: viewerId,
  };
};

function messageFromRow(r: Row): ChatMessage {
  const out = {
    id: r.id,
    channel: r.channel,
    senderId: r.sender_id,
    text: r.text ?? "",
    attachment: (r.attachment ?? undefined) as ChatMessage["attachment"],
    createdAt: iso(r.created_at),
    editedAt: r.edited_at ?? undefined,
    readBy: (r.read_by ?? []) as string[],
  };
  return out as unknown as ChatMessage;
}

const messageToRow = (m: ChatMessage): Row => ({
  id: m.id,
  channel: m.channel,
  sender_id: m.senderId,
  text: m.text,
  attachment: m.attachment ?? null,
  read_by: m.readBy ?? [],
  edited_at: m.editedAt ?? null,
});

/* ---------- loading ---------- */

export type LoadedData = Pick<
  State,
  | "users"
  | "purchases"
  | "expenses"
  | "tasks"
  | "invoices"
  | "notifications"
  | "messages"
  | "activity"
  | "currency"
  | "alarms"
  | "customRoles"
  | "chatGroups"
  | "banners"

>;

export async function loadAll(viewerId: string | null): Promise<Partial<LoadedData>> {
  const [
    profiles,
    roles,
    purchases,
    expenses,
    tasks,
    invoices,
    notifications,
    messages,
    settings,
    activity,
  ] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("user_roles").select("*"),
    supabase.from("bicycle_purchases").select("*").order("created_at", { ascending: false }),
    supabase.from("expenses").select("*").order("date", { ascending: false }),
    supabase.from("tasks").select("*").order("created_at", { ascending: false }),
    supabase
      .from("purchase_invoices")
      .select("*, invoice_items(*)")
      .order("created_at", { ascending: false }),
    supabase.from("notifications").select("*").order("created_at", { ascending: false }),
    supabase.from("messages").select("*").order("created_at", { ascending: true }),
    supabase.from("app_settings").select("*").maybeSingle(),
    supabase
      .from("activity_log" as never)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const roleOf = new Map<string, Role>();
  for (const r of (roles.data ?? []) as Row[]) roleOf.set(r.user_id, r.role as Role);

  const data: Partial<LoadedData> = {
    users: ((profiles.data ?? []) as Row[]).map((p) => userFromRow(p, roleOf.get(p.id) ?? "EMPLOYEE")),
    purchases: ((purchases.data ?? []) as Row[]).map(purchaseFromRow),
    expenses: ((expenses.data ?? []) as Row[]).map(expenseFromRow),
    tasks: ((tasks.data ?? []) as Row[]).map(taskFromRow),
    invoices: ((invoices.data ?? []) as Row[]).map(invoiceFromRow),
    notifications: ((notifications.data ?? []) as Row[]).map((n) => notificationFromRow(n, viewerId)),
    messages: ((messages.data ?? []) as Row[]).map(messageFromRow),
    activity: (((activity as { data?: Row[] }).data ?? []) as Row[]).map(activityFromRow),
  };
  if (settings.data) {
    data.currency = (settings.data as Row).currency === "RIAL" ? "RIAL" : "TOMAN";
    // Older saved settings predate per-event rules; the store fills the gaps.
    data.alarms = ((settings.data as Row).alarms ?? {}) as AlarmSettings;
    const roles = (settings.data as Row).custom_roles;
    data.customRoles = Array.isArray(roles) ? (roles as State["customRoles"]) : [];
    const groups = (settings.data as Row).chat_groups;
    data.chatGroups = Array.isArray(groups) ? (groups as State["chatGroups"]) : [];
    data.banners = {
      login: ((settings.data as Row).login_banner as string | null) ?? "",
      app: ((settings.data as Row).app_banner as string | null) ?? "",
    };
  }

  return data;
}

function activityFromRow(r: Row): ActivityEntry {
  const out = {
    id: r.id,
    entity: r.entity,
    recordId: r.record_id,
    userId: r.user_id,
    action: r.action ?? "",
    before: r.before_data ?? undefined,
    after: r.after_data ?? undefined,
    note: r.note ?? undefined,
    createdAt: iso(r.created_at),
  };
  return out as unknown as ActivityEntry;
}

/** Appends one immutable history line; history is never edited or removed. */
export async function logActivity(entry: {
  entity: ActivityEntry["entity"];
  recordId: string;
  userId: string;
  action: string;
  before?: unknown;
  after?: unknown;
  note?: string;
}) {
  const { error } = await supabase.from("activity_log" as never).insert({
    entity: entry.entity,
    record_id: entry.recordId,
    user_id: entry.userId,
    action: entry.action,
    before_data: entry.before ?? null,
    after_data: entry.after ?? null,
    note: entry.note ?? null,
  } as never);
  if (error) throw new Error(`ثبت تاریخچه: ${error.message}`);
}

/** Raw read_by values, needed to merge per-user read state safely. */
async function notificationReadMap() {
  const { data } = await supabase.from("notifications").select("id, read_by");
  const map = new Map<string, string[]>();
  for (const r of (data ?? []) as Row[]) map.set(r.id, (r.read_by ?? []) as string[]);
  return map;
}

/* ---------- diffing ---------- */

function diff<T extends { id: string }>(prev: T[], next: T[]) {
  const before = new Map(prev.map((x) => [x.id, x]));
  const after = new Map(next.map((x) => [x.id, x]));
  const inserted = next.filter((x) => !before.has(x.id));
  const updated = next.filter(
    (x) => before.has(x.id) && JSON.stringify(before.get(x.id)) !== JSON.stringify(x),
  );
  const removed = prev.filter((x) => !after.has(x.id)).map((x) => x.id);
  return { inserted, updated, removed };
}

async function run(label: string, work: PromiseLike<any>[]) {
  const results = await Promise.all(work);
  for (const r of results) {
    const error = r && "error" in r ? r.error : null;
    if (error) throw new Error(`${label}: ${(error as { message?: string }).message ?? "خطا"}`);
  }
}

/** Mirrors every difference between two app states to the cloud database. */
export async function pushChanges(prev: State, next: State, viewerId: string | null) {
  // --- purchases
  {
    const d = diff(prev.purchases, next.purchases);
    await run("خرید دوچرخه", [
      ...(d.inserted.length
        ? [supabase.from("bicycle_purchases").insert(d.inserted.map(purchaseToRow) as never)]
        : []),
      ...d.updated.map((p) =>
        supabase.from("bicycle_purchases").update(purchaseToRow(p) as never).eq("id", p.id),
      ),
      ...(d.removed.length
        ? [supabase.from("bicycle_purchases").delete().in("id", d.removed)]
        : []),
    ]);
  }
  // --- expenses
  {
    const d = diff(prev.expenses, next.expenses);
    await run("هزینه", [
      ...(d.inserted.length ? [supabase.from("expenses").insert(d.inserted.map(expenseToRow) as never)] : []),
      ...d.updated.map((e) => supabase.from("expenses").update(expenseToRow(e) as never).eq("id", e.id)),
      ...(d.removed.length ? [supabase.from("expenses").delete().in("id", d.removed)] : []),
    ]);
  }
  // --- tasks
  {
    const d = diff(prev.tasks, next.tasks);
    await run("وظیفه", [
      ...(d.inserted.length ? [supabase.from("tasks").insert(d.inserted.map(taskToRow) as never)] : []),
      ...d.updated.map((t) => supabase.from("tasks").update(taskToRow(t) as never).eq("id", t.id)),
      ...(d.removed.length ? [supabase.from("tasks").delete().in("id", d.removed)] : []),
    ]);
  }
  // --- invoices (+ nested items)
  {
    const d = diff(prev.invoices, next.invoices);
    const before = new Map(prev.invoices.map((v) => [v.id, v]));
    await run("فاکتور", [
      ...(d.inserted.length
        ? [supabase.from("purchase_invoices").insert(d.inserted.map(invoiceToRow) as never)]
        : []),
      ...d.updated.map((v) =>
        supabase.from("purchase_invoices").update(invoiceToRow(v) as never).eq("id", v.id),
      ),
      ...(d.removed.length ? [supabase.from("purchase_invoices").delete().in("id", d.removed)] : []),
    ]);
    for (const v of [...d.inserted, ...d.updated]) {
      const items = v.items.map((i) => itemToRow(v.id, i));
      const prevIds = (before.get(v.id)?.items ?? []).map((i) => i.id);
      const goneIds = prevIds.filter((id) => !v.items.some((i) => i.id === id));
      await run("اقلام فاکتور", [
        ...(items.length ? [supabase.from("invoice_items").upsert(items as never)] : []),
        ...(goneIds.length ? [supabase.from("invoice_items").delete().in("id", goneIds)] : []),
      ]);
    }
  }
  // --- notifications (read state is per user)
  {
    const d = diff(prev.notifications, next.notifications);
    if (d.inserted.length || d.updated.length || d.removed.length) {
      const readMap = d.updated.length ? await notificationReadMap() : new Map<string, string[]>();
      await run("اعلان", [
        ...(d.inserted.length
          ? [
              supabase
                .from("notifications")
                .insert(d.inserted.map((n) => notificationToRow(n, viewerId)) as never),
            ]
          : []),
        ...d.updated.map((n) =>
          supabase
            .from("notifications")
            .update(notificationToRow(n, viewerId, readMap.get(n.id) ?? []) as never)
            .eq("id", n.id),
        ),
        ...(d.removed.length ? [supabase.from("notifications").delete().in("id", d.removed)] : []),
      ]);
    }
  }
  // --- messages
  {
    const d = diff(prev.messages, next.messages);
    await run("پیام", [
      ...(d.inserted.length ? [supabase.from("messages").insert(d.inserted.map(messageToRow) as never)] : []),
      ...d.updated.map((m) => supabase.from("messages").update(messageToRow(m) as never).eq("id", m.id)),
      ...(d.removed.length ? [supabase.from("messages").delete().in("id", d.removed)] : []),
    ]);
  }
  // --- shop settings
  if (
    prev.currency !== next.currency ||
    JSON.stringify(prev.alarms) !== JSON.stringify(next.alarms) ||
    JSON.stringify(prev.customRoles ?? []) !== JSON.stringify(next.customRoles ?? []) ||
    JSON.stringify(prev.chatGroups ?? []) !== JSON.stringify(next.chatGroups ?? []) ||
    JSON.stringify(prev.banners ?? {}) !== JSON.stringify(next.banners ?? {})
  ) {
    await run("تنظیمات", [
      supabase.from("app_settings").upsert({
        id: true,
        currency: next.currency,
        alarms: next.alarms,
        custom_roles: next.customRoles ?? [],
        chat_groups: next.chatGroups ?? [],
        login_banner: next.banners?.login || null,
        app_banner: next.banners?.app || null,
      } as never),
    ]);
  }
  // --- team members go through a protected server function
  {
    const d = diff(prev.users, next.users);
    for (const u of [...d.inserted, ...d.updated]) {
      const isNew = d.inserted.includes(u);
      await saveTeamUser({
        data: {
          ...(isNew ? {} : { id: u.id }),
          fullName: u.fullName,
          username: u.username,
          phone: u.phone,
          title: u.title,
          role: u.role,
          isWorker: u.isWorker,
          isActive: u.isActive,
          isArchived: !!u.isArchived,
          customRole: u.customRole ?? "",
          bio: u.bio ?? "",
          permissions: u.permissions ?? {},
          ...(u.password ? { password: u.password } : {}),
        },
      });
    }
  }

}

/** Subscribes to every shared table and calls back on any remote change. */
export function subscribeAll(onChange: () => void) {
  const channel = supabase.channel(`dezz-rekab-sync-${Math.random().toString(36).slice(2)}`);
  for (const table of [
    "profiles",
    "user_roles",
    "bicycle_purchases",
    "expenses",
    "tasks",
    "purchase_invoices",
    "invoice_items",
    "notifications",
    "messages",
    "app_settings",
    "activity_log",
  ]) {
    channel.on("postgres_changes", { event: "*", schema: "public", table }, onChange);
  }
  channel.subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

/**
 * Atomically claims an unassigned (general) task for the signed-in worker.
 * Returns false when somebody else got there first.
 */
export async function claimTask(taskId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("claim_task", { _task_id: taskId });
  if (error) throw new Error(error.message);
  return data === true;
}
