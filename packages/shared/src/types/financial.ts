// ---------------------------------------------------------------------------
// Financial types — expenses, revenues, invoices, payouts
// ---------------------------------------------------------------------------

export enum ExpenseCategory {
  TRAINING = "TRAINING",
  BOARDING = "BOARDING",
  VET = "VET",
  FARRIER = "FARRIER",
  MEDICATION = "MEDICATION",
  SUPPLEMENTS = "SUPPLEMENTS",
  FEED = "FEED",
  TRANSPORTATION = "TRANSPORTATION",
  ENTRY_FEE = "ENTRY_FEE",
  NOMINATION_FEE = "NOMINATION_FEE",
  JOCKEY_FEE = "JOCKEY_FEE",
  INSURANCE = "INSURANCE",
  EQUIPMENT = "EQUIPMENT",
  LICENSING = "LICENSING",
  THERAPY = "THERAPY",
  OTHER = "OTHER",
}

export enum RevenueCategory {
  PURSE_EARNINGS = "PURSE_EARNINGS",
  CLAIM_SALE = "CLAIM_SALE",
  PRIVATE_SALE = "PRIVATE_SALE",
  BREEDING_FEE = "BREEDING_FEE",
  STALLION_SHARE = "STALLION_SHARE",
  SPONSORSHIP = "SPONSORSHIP",
  APPEARANCE_FEE = "APPEARANCE_FEE",
  OTHER = "OTHER",
}

export enum InvoiceStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
  PARTIALLY_PAID = "PARTIALLY_PAID",
}

export enum PaymentMethod {
  ACH = "ACH",
  CHECK = "CHECK",
  WIRE = "WIRE",
  CREDIT_CARD = "CREDIT_CARD",
  CASH = "CASH",
  OTHER = "OTHER",
}

export interface Expense {
  id: string;
  organizationId: string;
  horseId: string | null;
  category: ExpenseCategory;
  description: string;
  amountCents: number;
  vendorName: string | null;
  invoiceId: string | null;
  receiptUrl: string | null;
  occurredOn: Date;
  paidAt: Date | null;
  paymentMethod: PaymentMethod | null;
  notes: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Revenue {
  id: string;
  organizationId: string;
  horseId: string | null;
  category: RevenueCategory;
  description: string;
  amountCents: number;
  source: string | null;
  raceResultId: string | null;
  receivedOn: Date;
  notes: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  horseId: string | null;
  description: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  expenseCategory: ExpenseCategory | null;
}

export interface Invoice {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  recipientUserId: string;
  recipientName: string;
  recipientEmail: string;
  status: InvoiceStatus;
  issuedOn: Date;
  dueOn: Date;
  paidAt: Date | null;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  lineItems: InvoiceLineItem[];
  paymentMethod: PaymentMethod | null;
  notes: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OwnerPayout {
  id: string;
  organizationId: string;
  ownerId: string;
  ownerName: string;
  horseId: string;
  horseName: string;
  revenueId: string | null;
  amountCents: number;
  ownershipPercentage: number;
  periodStart: Date;
  periodEnd: Date;
  paidAt: Date | null;
  paymentMethod: PaymentMethod | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CostPerHorseSummary {
  horseId: string;
  horseName: string;
  periodStart: Date;
  periodEnd: Date;
  totalExpensesCents: number;
  totalRevenueCents: number;
  netCents: number;
  expensesByCategory: Record<ExpenseCategory, number>;
}

export interface CreateExpenseInput {
  organizationId: string;
  horseId?: string;
  category: ExpenseCategory;
  description: string;
  amountCents: number;
  vendorName?: string;
  receiptUrl?: string;
  occurredOn: Date | string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface CreateRevenueInput {
  organizationId: string;
  horseId?: string;
  category: RevenueCategory;
  description: string;
  amountCents: number;
  source?: string;
  raceResultId?: string;
  receivedOn: Date | string;
  notes?: string;
}

export interface CreateInvoiceInput {
  organizationId: string;
  recipientUserId: string;
  recipientName: string;
  recipientEmail: string;
  issuedOn: Date | string;
  dueOn: Date | string;
  taxCents?: number;
  lineItems: Omit<InvoiceLineItem, "id" | "invoiceId">[];
  notes?: string;
}
