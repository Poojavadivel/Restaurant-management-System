import { apiRequest } from "@/api/client";
import type { MenuItem } from "@/app/data/menuData";

export async function fetchMenuItems(params?: {
  category?: string;
  veg?: boolean;
  q?: string;
}): Promise<MenuItem[]> {
  const sp = new URLSearchParams();
  if (params?.category) sp.set("category", params.category);
  if (typeof params?.veg === "boolean") sp.set("veg", params.veg ? "true" : "false");
  if (params?.q) sp.set("q", params.q);

  const qs = sp.toString();
  const res = await apiRequest<{ items: MenuItem[] }>(`/api/menu-items${qs ? `?${qs}` : ""}`);
  return res.items;
}

export async function fetchMenuCategories(): Promise<string[]> {
  const res = await apiRequest<{ categories: string[] }>("/api/menu/categories");
  return res.categories;
}
