import { OrdersTable } from "@/components/orders/orders-table";

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Orders</h2>
        <p className="mt-1 text-sm text-neutral-500">
          All orders, newest first.
        </p>
      </div>

      <OrdersTable />
    </div>
  );
}
