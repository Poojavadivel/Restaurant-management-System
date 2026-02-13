export type OfferType = "PERCENT" | "FLAT";

export type Offer = {
  id: string;
  title: string;
  type: OfferType;
  value: number;
  minOrderValue?: number;
  requiresLoyalty?: boolean;
};

export const offersData: Offer[] = [
  {
    id: "OFF10",
    title: "10% OFF on orders above ₹500",
    type: "PERCENT",
    value: 10,
    minOrderValue: 500,
  },
  {
    id: "FLAT50",
    title: "Flat ₹50 OFF on orders above ₹700",
    type: "FLAT",
    value: 50,
    minOrderValue: 700,
  },
  {
    id: "LOYAL20",
    title: "Extra ₹20 OFF for loyalty members",
    type: "FLAT",
    value: 20,
    requiresLoyalty: true,
  },
];

export function getEligibleOffers(subtotal: number, loyaltyPoints: number): Offer[] {
  const orderValue = Math.max(0, subtotal);
  const points = Math.max(0, loyaltyPoints);

  return offersData.filter((offer) => {
    const min = offer.minOrderValue ?? 0;
    if (orderValue < min) return false;
    if (offer.requiresLoyalty && points <= 0) return false;
    return true;
  });
}
