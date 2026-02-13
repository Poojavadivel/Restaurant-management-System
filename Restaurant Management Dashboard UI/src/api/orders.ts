import { apiRequest } from "@/api/client";
import type { Order } from "@/app/App";

export async function createOrder(order: Order, userId?: string): Promise<Order> {
  return apiRequest<Order>("/api/orders", {
    method: "POST",
    body: {
      ...order,
      userId,
    },
  });
}

export async function fetchOrders(userId?: string): Promise<Order[]> {
  const sp = new URLSearchParams();
  if (userId) sp.set("userId", userId);
  const res = await apiRequest<{ orders: Order[] }>(`/api/orders${sp.toString() ? `?${sp.toString()}` : ""}`);
  return res.orders;
}
