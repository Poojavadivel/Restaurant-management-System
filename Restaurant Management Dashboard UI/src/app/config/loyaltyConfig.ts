export type LoyaltyConfig = {
  pointsPer100: number;
  maxPointsPerOrder: number;
  pointsPerRupeeDiscount: number;
  minRedeemablePoints: number;
  pointsExpiryMonths: number;
  loyaltyEnabled: boolean;
  autoExpiryEnabled: boolean;
};

// ADMIN CONFIG (MOCK) — single source of truth
export const loyaltyConfig: LoyaltyConfig = {
  pointsPer100: 10,
  maxPointsPerOrder: 500,
  pointsPerRupeeDiscount: 10,
  minRedeemablePoints: 100,
  pointsExpiryMonths: 12,
  loyaltyEnabled: true,
  autoExpiryEnabled: true,
};
