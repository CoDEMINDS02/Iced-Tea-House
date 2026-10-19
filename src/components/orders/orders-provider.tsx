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

type OrdersContextValue = {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  markOrderPaid: (orderId: string) => void;
  refundOrder: (orderId: string) => void;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

type OrdersProviderProps = {
  children: ReactNode;
};

export function OrdersProvider({ children }: OrdersProviderProps) {
  // null until the browser has built the demo orders from the current time.
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    setOrders(createDemoOrders());
  }, []);

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

  const value = useMemo(
    () =>
      orders
        ? {
            orders,
            addOrder,
            updateOrderStatus,
            markOrderPaid,
            refundOrder,
          }
        : null,
    [orders, addOrder, updateOrderStatus, markOrderPaid, refundOrder],
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