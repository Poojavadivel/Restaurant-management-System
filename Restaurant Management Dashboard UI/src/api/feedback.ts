import { apiRequest } from "@/api/client";

export interface FeedbackPayload {
  userId: string;
  orderId: string;
  foodRatings: Record<string, number>;
  likedAspects: string[];
  comment?: string;
}

export interface FeedbackEntry {
  id: string;
  userId: string;
  orderId: string;
  foodRatings: Record<string, number>;
  likedAspects: string[];
  comment?: string;
  createdAt: string;
}

export async function submitFeedback(payload: FeedbackPayload): Promise<FeedbackEntry> {
  const res = await apiRequest<{ feedback: FeedbackEntry }>("/api/feedback", {
    method: "POST",
    body: payload,
  });
  return res.feedback;
}

export async function fetchFeedback(userId?: string): Promise<FeedbackEntry[]> {
  const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const res = await apiRequest<{ items: FeedbackEntry[] }>(`/api/feedback${qs}`);
  return res.items;
}
