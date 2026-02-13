import { apiRequest } from "@/api/client";
import type { Offer } from "@/app/data/offersData";

export async function fetchEligibleOffers(input: {
  subtotal: number;
  loyaltyPoints: number;
}): Promise<Offer[]> {
  const sp = new URLSearchParams();
  sp.set("subtotal", String(input.subtotal ?? 0));
  sp.set("loyaltyPoints", String(input.loyaltyPoints ?? 0));
  const res = await apiRequest<{ offers: Offer[] }>(`/api/offers/eligible?${sp.toString()}`);
  return res.offers;
}

export async function fetchOffers(): Promise<Offer[]> {
  const res = await apiRequest<{ offers: Offer[] }>("/api/offers");
  return res.offers;
}
