export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type OrderType = "dine-in" | "takeaway" | "delivery";

export type PaymentMethod = "cash" | "card" | "online";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type OrderItem = {
  productId: string;
  /** Product name at the time of the order, so old orders never change. */
  name: string;
  /** Price per unit at the time of the order. */
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: string;
  /** Short readable number shown to staff, e.g. "ITH-1001". */
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  type: OrderType;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  subtotal: number;
  total: number;
  isComplimentary: boolean;
  notes?: string;
  /** ISO date string, e.g. "2026-10-15T14:30:00.000Z". */
  createdAt: string;
};