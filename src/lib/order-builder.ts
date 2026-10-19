import type {
  Order,
  OrderItem,
  OrderType,
  PaymentMethod,
} from "@/types/order";

export type NewOrderInput = {
  customerName: string;
  customerPhone: string;
  type: OrderType;
  paymentMethod: PaymentMethod;
  isComplimentary: boolean;
  notes: string;
  items: OrderItem[];
};

export type NewOrderField =
  | "customerName"
  | "customerPhone"
  | "notes"
  | "items";

export type NewOrderErrors = Partial<Record<NewOrderField, string>>;

const MAX_NAME_LENGTH = 60;
const MAX_NOTES_LENGTH = 200;

export function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce(
    (sum, orderItem) => sum + orderItem.unitPrice * orderItem.quantity,
    0,
  );
}

/** Total number of pieces in the cart, e.g. 2 lemon teas + 1 fries = 3. */
export function countPieces(items: OrderItem[]): number {
  return items.reduce((sum, orderItem) => sum + orderItem.quantity, 0);
}

function countDigits(value: string): number {
  return value.replace(/\D/g, "").length;
}

export function validateNewOrder(input: NewOrderInput): NewOrderErrors {
  const errors: NewOrderErrors = {};
  const name = input.customerName.trim();
  const phone = input.customerPhone.trim();
  const notes = input.notes.trim();

  if (!name) {
    errors.customerName = "Customer name is required.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.customerName = `Name must be ${MAX_NAME_LENGTH} characters or less.`;
  }

  if (input.type === "delivery" && !phone) {
    errors.customerPhone = "Phone number is required for delivery orders.";
  } else if (phone) {
    const digits = countDigits(phone);
    const onlyAllowedChars = /^[0-9+\-\s()]+$/.test(phone);

    if (!onlyAllowedChars || digits < 7 || digits > 15) {
      errors.customerPhone = "Enter a valid phone number (7 to 15 digits).";
    }
  }

  if (input.isComplimentary && !notes) {
    errors.notes = "Please write the reason for a complimentary order.";
  } else if (notes.length > MAX_NOTES_LENGTH) {
    errors.notes = `Notes must be ${MAX_NOTES_LENGTH} characters or less.`;
  }

  if (input.items.length === 0) {
    errors.items = "Add at least one product to the order.";
  }

  return errors;
}

/** Finds the highest number in "ITH-1012" style order numbers. */
function highestOrderNumber(orders: Order[]): number {
  return orders.reduce((highest, order) => {
    const match = /^ITH-(\d+)$/.exec(order.orderNumber);
    const value = match ? Number(match[1]) : 0;

    return value > highest ? value : highest;
  }, 1000);
}

/**
 * Builds a full Order from the form data.
 * Call validateNewOrder first. This function does not validate.
 */
export function buildNewOrder(
  input: NewOrderInput,
  existingOrders: Order[],
  now: Date = new Date(),
): Order {
  const nextNumber = highestOrderNumber(existingOrders) + 1;
  const subtotal = calculateSubtotal(input.items);
  const phone = input.customerPhone.trim();
  const notes = input.notes.trim();

  return {
    id: `ord-${nextNumber}`,
    orderNumber: `ITH-${nextNumber}`,
    customerName: input.customerName.trim(),
    ...(phone ? { customerPhone: phone } : {}),
    type: input.type,
    status: "pending",
    paymentMethod: input.paymentMethod,
    paymentStatus: input.isComplimentary ? "paid" : "unpaid",
    items: input.items,
    subtotal,
    total: input.isComplimentary ? 0 : subtotal,
    isComplimentary: input.isComplimentary,
    ...(notes ? { notes } : {}),
    createdAt: now.toISOString(),
  };
}