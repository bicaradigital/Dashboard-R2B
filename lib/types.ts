export interface User {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  crm_id?: string
  name: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Item {
  id: string
  sku?: string
  name: string
  unit: string
  price: number
  item_type: "product" | "service" | "training"
  stock: number
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  customer_id?: string
  customer?: Customer
  issued_date: string
  due_date?: string
  status: "draft" | "sent" | "paid" | "partial" | "cancelled"
  currency: string
  notes?: string
  subtotal: number
  tax: number
  discount: number
  total: number
  pdf_url?: string
  created_by?: string
  created_at: string
  updated_at: string
  items?: InvoiceItem[]
  payments?: Payment[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  item_id?: string
  item?: Item
  description?: string
  qty: number
  unit_price: number
  line_total: number
  created_at: string
}

export interface Payment {
  id: string
  invoice_id: string
  amount: number
  method: "cash" | "bank_transfer" | "gopay" | "qris" | "credit_card" | "other"
  paid_at: string
  reference?: string
  receipt_url?: string
  created_by?: string
  created_at: string
}

export interface Expense {
  id: string
  category: string
  amount: number
  description?: string
  expense_date: string
  receipt_url?: string
  created_by?: string
  created_at: string
}

export interface Account {
  id: string
  code: string
  name: string
  type: "asset" | "liability" | "equity" | "revenue" | "expense"
  parent_id?: string
  created_at: string
}

export interface JournalEntry {
  id: string
  entry_date: string
  description?: string
  created_at: string
  lines?: JournalLine[]
}

export interface JournalLine {
  id: string
  journal_entry_id: string
  account_id: string
  account?: Account
  debit: number
  credit: number
  created_at: string
}

export interface AuditLog {
  id: string
  user_id?: string
  action: string
  entity?: string
  entity_id?: string
  metadata?: any
  created_at: string
}

export interface ProfitLoss {
  period_start: string
  revenue: number
  expense: number
  net_profit: number
}

export interface BalanceSheet {
  code: string
  name: string
  type: "asset" | "liability" | "equity" | "revenue" | "expense"
  balance: number
}
