import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loyaltyConfig, type LoyaltyConfig } from "@/app/config/loyaltyConfig";

export type LoyaltyTransactionType = "EARN" | "REDEEM" | "EXPIRE";
export type LoyaltyHistoryTab = "all" | "earned" | "redeemed" | "expired";

export type LoyaltyTransactionSource = "ORDER" | "ORDER_PAYMENT" | "CART" | "FEEDBACK" | "SYSTEM";

export type LoyaltyTransaction = {
  id: string;
  type: LoyaltyTransactionType;
  source?: LoyaltyTransactionSource;
  points: number;
  date: string; // ISO
  orderId?: string;
  expiryDate?: string; // ISO (only for EARN)
  description: string;
  status: "Earned" | "Redeemed" | "Expired";
};

export type FeedbackEntry = {
  id: string;
  orderId: string;
  foodRatings: Record<string, number>;
  likedAspects: string[];
  comment?: string;
  date: string; // ISO
};

type EarnBucket = {
  id: string;
  orderId?: string;
  earnedAt: string; // ISO
  expiryAt?: string; // ISO
  points: number;
  remaining: number;
};

type LoyaltyState = {
  buckets: EarnBucket[];
  history: LoyaltyTransaction[];
  reviewedOrders: string[];
  rewardedOrderIds: string[];
  feedbackHistory: FeedbackEntry[];
};

type EarnInput = {
  orderId: string;
  subtotal: number; // subtotal BEFORE GST, after loyalty discount
  date?: string; // ISO
};

type RedeemInput = {
  orderId?: string;
  points: number;
  date?: string; // ISO
};

type LoyaltyContextValue = {
  config: LoyaltyConfig;
  balancePoints: number;
  history: LoyaltyTransaction[];
  reviewedOrders: string[];
  rewardedOrderIds: string[];
  feedbackHistory: FeedbackEntry[];
  expiringSoonPoints: number;
  canRedeem: boolean;
  maxRedeemablePoints: number;
  pointsToRupeeDiscount: (points: number) => number;
  earnForOrder: (input: EarnInput) => void;
  earnForPayment: (input: { orderId: string; subtotal: number; date?: string }) => { ok: boolean; pointsAwarded: number };
  redeemPoints: (input: RedeemInput) => void;
  submitFeedback: (input: {
    orderId: string;
    foodRatings: Record<string, number>;
    likedAspects: string[];
    comment?: string;
    date?: string;
  }) => { ok: boolean; pointsAwarded: number };
  getTierByPoints: (points: number) => "Basic" | "Silver" | "Gold" | "Platinum";
};

const STORAGE_KEY = "loyaltyState.v1";

const LoyaltyContext = createContext<LoyaltyContextValue | null>(null);

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function safeParseState(raw: string | null): LoyaltyState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<LoyaltyState>;
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.buckets) || !Array.isArray(parsed.history)) return null;

    const reviewedOrders = Array.isArray(parsed.reviewedOrders)
      ? parsed.reviewedOrders.filter((x): x is string => typeof x === "string")
      : [];

    const rewardedOrderIds = Array.isArray(parsed.rewardedOrderIds)
      ? parsed.rewardedOrderIds.filter((x): x is string => typeof x === "string")
      : [];

    const feedbackHistory = Array.isArray(parsed.feedbackHistory)
      ? (parsed.feedbackHistory as FeedbackEntry[]).filter(
          (x) =>
            !!x &&
            typeof x === "object" &&
            typeof (x as FeedbackEntry).id === "string" &&
            typeof (x as FeedbackEntry).orderId === "string"
        )
      : [];

    return {
      buckets: parsed.buckets,
      history: parsed.history,
      reviewedOrders,
      rewardedOrderIds,
      feedbackHistory,
    };
  } catch {
    return null;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function sumRemaining(buckets: EarnBucket[]) {
  return buckets.reduce((sum, b) => sum + (b.remaining || 0), 0);
}

export function LoyaltyProvider({ children }: { children: React.ReactNode }) {
  const didInitRef = useRef(false);

  const [state, setState] = useState<LoyaltyState>(() => {
    const saved = safeParseState(localStorage.getItem(STORAGE_KEY));
    if (saved) return saved;
    return { buckets: [], history: [], reviewedOrders: [], rewardedOrderIds: [], feedbackHistory: [] };
  });

  const expireIfNeeded = useCallback((current: LoyaltyState) => {
    if (!loyaltyConfig.autoExpiryEnabled) return current;

    const now = new Date();
    const expiredTransactions: LoyaltyTransaction[] = [];
    const nextBuckets = current.buckets.map((bucket) => {
      if (!bucket.expiryAt || bucket.remaining <= 0) return bucket;
      const expiry = new Date(bucket.expiryAt);
      if (expiry > now) return bucket;

      const pointsToExpire = bucket.remaining;
      if (pointsToExpire <= 0) return { ...bucket, remaining: 0 };

      expiredTransactions.push({
        id: `lx-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: "EXPIRE",
        points: pointsToExpire,
        date: now.toISOString(),
        orderId: bucket.orderId,
        description: bucket.orderId ? `Expired points from Order #${bucket.orderId}` : "Expired loyalty points",
        status: "Expired",
      });

      return { ...bucket, remaining: 0 };
    });

    if (expiredTransactions.length === 0) return current;

    return {
      ...current,
      buckets: nextBuckets,
      history: [...expiredTransactions, ...current.history],
    };
  }, []);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    setState((prev) => expireIfNeeded(prev));
  }, [expireIfNeeded]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const balancePoints = useMemo(() => sumRemaining(state.buckets), [state.buckets]);

  const expiringSoonPoints = useMemo(() => {
    if (!loyaltyConfig.autoExpiryEnabled) return 0;
    const withinMs = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    return state.buckets.reduce((sum, bucket) => {
      if (!bucket.expiryAt || bucket.remaining <= 0) return sum;
      const expiry = new Date(bucket.expiryAt).getTime();
      if (expiry < now) return sum;
      if (expiry - now <= withinMs) return sum + bucket.remaining;
      return sum;
    }, 0);
  }, [state.buckets]);

  const canRedeem = loyaltyConfig.loyaltyEnabled && balancePoints >= loyaltyConfig.minRedeemablePoints;

  const maxRedeemablePoints = useMemo(() => {
    if (!canRedeem) return 0;
    return balancePoints;
  }, [balancePoints, canRedeem]);

  const pointsToRupeeDiscount = useCallback((points: number) => {
    if (!loyaltyConfig.loyaltyEnabled) return 0;
    if (points <= 0) return 0;
    return Math.floor(points / loyaltyConfig.pointsPerRupeeDiscount);
  }, []);

  const earnForOrder = useCallback((input: EarnInput) => {
    if (!loyaltyConfig.loyaltyEnabled) return;
    const date = input.date ?? nowIso();

    setState((prev) => {
      const expiredApplied = expireIfNeeded(prev);

      const alreadyEarned = expiredApplied.history.some(
        (h) =>
          h.type === "EARN" &&
          h.orderId === input.orderId &&
          (!h.source || h.source === "ORDER" || h.source === "ORDER_PAYMENT")
      );
      if (alreadyEarned) return expiredApplied;

      const computed = Math.floor(input.subtotal / 100) * loyaltyConfig.pointsPer100;
      const pointsEarned = Math.min(loyaltyConfig.maxPointsPerOrder, Math.max(0, computed));
      if (pointsEarned <= 0) return expiredApplied;

      const expiryDate = loyaltyConfig.autoExpiryEnabled
        ? addMonths(new Date(date), loyaltyConfig.pointsExpiryMonths).toISOString()
        : undefined;

      const bucket: EarnBucket = {
        id: `eb-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        orderId: input.orderId,
        earnedAt: date,
        expiryAt: expiryDate,
        points: pointsEarned,
        remaining: pointsEarned,
      };

      const transaction: LoyaltyTransaction = {
        id: `le-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: "EARN",
        source: "ORDER",
        points: pointsEarned,
        date,
        orderId: input.orderId,
        expiryDate,
        description: `+${pointsEarned} points – Order #${input.orderId}`,
        status: "Earned",
      };

      return {
        ...expiredApplied,
        buckets: [bucket, ...expiredApplied.buckets],
        history: [transaction, ...expiredApplied.history],
      };
    });
  }, [expireIfNeeded]);

  const earnForPayment = useCallback(
    (input: { orderId: string; subtotal: number; date?: string }) => {
      if (!loyaltyConfig.loyaltyEnabled) return { ok: true, pointsAwarded: 0 };
      const date = input.date ?? nowIso();
      let pointsAwarded = 0;

      setState((prev) => {
        const expiredApplied = expireIfNeeded(prev);

        // Prevent duplicates across refresh/revisits.
        if (expiredApplied.rewardedOrderIds.includes(input.orderId)) return expiredApplied;

        // Also guard against legacy entries without source field.
        const alreadyEarned = expiredApplied.history.some(
          (h) =>
            h.type === "EARN" &&
            h.orderId === input.orderId &&
            (!h.source || h.source === "ORDER" || h.source === "ORDER_PAYMENT")
        );
        if (alreadyEarned) {
          return {
            ...expiredApplied,
            rewardedOrderIds: [input.orderId, ...expiredApplied.rewardedOrderIds],
          };
        }

        const computed = Math.floor(input.subtotal / 100) * loyaltyConfig.pointsPer100;
        const capped = Math.min(loyaltyConfig.maxPointsPerOrder, Math.max(0, computed));
        pointsAwarded = capped;
        if (pointsAwarded <= 0) {
          return {
            ...expiredApplied,
            rewardedOrderIds: [input.orderId, ...expiredApplied.rewardedOrderIds],
          };
        }

        const expiryDate = loyaltyConfig.autoExpiryEnabled
          ? addMonths(new Date(date), loyaltyConfig.pointsExpiryMonths).toISOString()
          : undefined;

        const bucket: EarnBucket = {
          id: `ebp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          orderId: input.orderId,
          earnedAt: date,
          expiryAt: expiryDate,
          points: pointsAwarded,
          remaining: pointsAwarded,
        };

        const transaction: LoyaltyTransaction = {
          id: `lp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type: "EARN",
          source: "ORDER_PAYMENT",
          points: pointsAwarded,
          date,
          orderId: input.orderId,
          expiryDate,
          description: `+${pointsAwarded} points – Payment for Order #${input.orderId}`,
          status: "Earned",
        };

        return {
          ...expiredApplied,
          buckets: [bucket, ...expiredApplied.buckets],
          history: [transaction, ...expiredApplied.history],
          rewardedOrderIds: [input.orderId, ...expiredApplied.rewardedOrderIds],
        };
      });

      return { ok: true, pointsAwarded };
    },
    [expireIfNeeded]
  );

  const redeemPoints = useCallback((input: RedeemInput) => {
    if (!loyaltyConfig.loyaltyEnabled) return;

    setState((prev) => {
      const expiredApplied = expireIfNeeded(prev);
      const date = input.date ?? nowIso();

      const available = sumRemaining(expiredApplied.buckets);
      const can = available >= loyaltyConfig.minRedeemablePoints;
      if (!can) return expiredApplied;

      const points = Math.floor(input.points);
      if (points < loyaltyConfig.minRedeemablePoints) return expiredApplied;
      if (points > available) return expiredApplied;

      // Deduct FIFO from oldest buckets
      const bucketsAsc = [...expiredApplied.buckets].slice().reverse();
      let remainingToSpend = points;
      const updatedAsc = bucketsAsc.map((bucket) => {
        if (remainingToSpend <= 0) return bucket;
        if (bucket.remaining <= 0) return bucket;

        const spend = Math.min(bucket.remaining, remainingToSpend);
        remainingToSpend -= spend;
        return { ...bucket, remaining: bucket.remaining - spend };
      });

      const nextBuckets = updatedAsc.reverse();

      const transaction: LoyaltyTransaction = {
        id: `lr-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: "REDEEM",
        source: "CART",
        points,
        date,
        orderId: input.orderId,
        description: input.orderId
          ? `-${points} points – Redeemed in Cart (Order #${input.orderId})`
          : `-${points} points – Redeemed in Cart`,
        status: "Redeemed",
      };

      return {
        ...expiredApplied,
        buckets: nextBuckets,
        history: [transaction, ...expiredApplied.history],
      };
    });
  }, [expireIfNeeded]);

  const submitFeedback = useCallback(
    (input: {
      orderId: string;
      foodRatings: Record<string, number>;
      likedAspects: string[];
      comment?: string;
      date?: string;
    }) => {
      const date = input.date ?? nowIso();

      let pointsAwarded = 0;

      setState((prev) => {
        const expiredApplied = expireIfNeeded(prev);

        if (expiredApplied.reviewedOrders.includes(input.orderId)) {
          return expiredApplied;
        }

        const feedbackEntry: FeedbackEntry = {
          id: `fb-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          orderId: input.orderId,
          foodRatings: input.foodRatings,
          likedAspects: input.likedAspects,
          comment: input.comment,
          date,
        };

        const nextReviewedOrders = [input.orderId, ...expiredApplied.reviewedOrders];
        const nextFeedbackHistory = [feedbackEntry, ...expiredApplied.feedbackHistory];

        if (!loyaltyConfig.loyaltyEnabled) {
          return {
            ...expiredApplied,
            reviewedOrders: nextReviewedOrders,
            feedbackHistory: nextFeedbackHistory,
          };
        }

        // Award EXACTLY 10 points once per order.
        pointsAwarded = 10;

        const expiryDate = loyaltyConfig.autoExpiryEnabled
          ? addMonths(new Date(date), loyaltyConfig.pointsExpiryMonths).toISOString()
          : undefined;

        const bucket: EarnBucket = {
          id: `ebf-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          orderId: input.orderId,
          earnedAt: date,
          expiryAt: expiryDate,
          points: pointsAwarded,
          remaining: pointsAwarded,
        };

        const transaction: LoyaltyTransaction = {
          id: `lf-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type: "EARN",
          source: "FEEDBACK",
          points: pointsAwarded,
          date,
          orderId: input.orderId,
          expiryDate,
          description: `+${pointsAwarded} points – Feedback for Order #${input.orderId}`,
          status: "Earned",
        };

        return {
          ...expiredApplied,
          buckets: [bucket, ...expiredApplied.buckets],
          history: [transaction, ...expiredApplied.history],
          reviewedOrders: nextReviewedOrders,
          feedbackHistory: nextFeedbackHistory,
        };
      });

      return { ok: true, pointsAwarded };
    },
    [expireIfNeeded]
  );

  const getTierByPoints = useCallback((points: number) => {
    if (points >= 2000) return "Platinum";
    if (points >= 1000) return "Gold";
    if (points >= 500) return "Silver";
    return "Basic";
  }, []);

  const value: LoyaltyContextValue = {
    config: loyaltyConfig,
    balancePoints,
    history: state.history,
    reviewedOrders: state.reviewedOrders,
    rewardedOrderIds: state.rewardedOrderIds,
    feedbackHistory: state.feedbackHistory,
    expiringSoonPoints,
    canRedeem,
    maxRedeemablePoints,
    pointsToRupeeDiscount,
    earnForOrder,
    earnForPayment,
    redeemPoints,
    submitFeedback,
    getTierByPoints,
  };

  return <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>;
}

export function useLoyalty() {
  const ctx = useContext(LoyaltyContext);
  if (!ctx) throw new Error("useLoyalty must be used within a LoyaltyProvider");
  return ctx;
}
