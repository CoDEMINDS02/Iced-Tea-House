"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { createDemoOrders } from "@/data/orders";
import { canMove } from "@/lib/order-workflow";
import { canMarkPaid, needsRefund } from "@/lib/payment-workflow";
import type { Order, OrderStatus } from "@/types/order";

/** Change the version suffix if the Order type changes, so old saves are ignored. */
const STORAGE_KEY = "iced-tea-house:orders:v1";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];

/** Basic shape check so broken or outdated saved data never reaches the UI. */
function isOrder(value: unknown): value is Order {
  if (typeof value !== "object" || value === null) return false;

  const order = value as Partial<Order>;

  return (
    typeof order.id === "string" &&
    typeof order.orderNumber === "string" &&
    typeof order.customerName === "string" &&
    typeof order.total === "number" &&
    typeof order.createdAt === "string" &&
    Array.isArray(order.items) &&
    typeof order.status === "string" &&
    ORDER_STATUSES.includes(order.status)
  );
}

/** Saved orders if they look valid, otherwise fresh demo orders. */
function loadOrders(): Order[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (raw) {
      const parsed: unknown = JSON.parse(raw);

      if (Array.isArray(parsed) && parsed.every(isOrder)) {
        return parsed;
      }
    }
  } catch {
    // Storage blocked or data corrupted: fall back to demo orders.
  }

  return createDemoOrders();
}

type OrdersContextValue = {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  markOrderPaid: (orderId: string) => void;
  refundOrder: (orderId: string) => void;
  /** Throws away all changes and restores the original demo orders. */
  resetDemoData: () => void;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

type OrdersProviderProps = {
  children: ReactNode;
};

export function OrdersProvider({ children }: OrdersProviderProps) {
  // null until the browser has loaded saved orders (or built demo orders).
  const [orders, setOrders] = useState<Order[] | null>(null);

  // Load once after the first render, so server and browser HTML match.
  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  // Save every change. Skipped until the first load has finished.
  useEffect(() => {
    if (!orders) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Storage full or blocked: the app keeps working, just without saving.
    }
  }, [orders]);

  const addOrder = useCallback((order: Order) => {
    setOrders((current) => (current ? [order, ...current] : current));
  }, []);

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      setOrders((current) =>
        current
          ? current.map((order) =>
              order.id === orderId && canMove(order.status, status)
                ? { ...order, status }
                : order,
            )
          : current,
      );
    },
    [],
  );

  const markOrderPaid = useCallback((orderId: string) => {
    setOrders((current) =>
      current
        ? current.map((order) =>
            order.id === orderId && canMarkPaid(order)
              ? { ...order, paymentStatus: "paid" as const }
              : order,
          )
        : current,
    );
  }, []);

  const refundOrder = useCallback((orderId: string) => {
    setOrders((current) =>
      current
        ? current.map((order) =>
            order.id === orderId && needsRefund(order)
              ? { ...order, paymentStatus: "refunded" as const }
              : order,
          )
        : current,
    );
  }, []);

  const resetDemoData = useCallback(() => {
    setOrders(createDemoOrders());
  }, []);

  const value = useMemo(
    () =>
      orders
        ? {
            orders,
            addOrder,
            updateOrderStatus,
            markOrderPaid,
            refundOrder,
            resetDemoData,
          }
        : null,
    [
      orders,
      addOrder,
      updateOrderStatus,
      markOrderPaid,
      refundOrder,
      resetDemoData,
    ],
  );

  if (!value) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
        Loading...
      </div>
    );
  }

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
}

export function useOrders(): OrdersContextValue {
  const context = useContext(OrdersContext);

  if (!context) {
    throw new Error("useOrders must be used inside an OrdersProvider");
  }

  return context;
}
