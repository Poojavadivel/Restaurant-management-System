# MongoDB: feedback collection

Used for customer feedback submissions.

Collection: feedback

Fields
- id: string
- userId: string (email)
- orderId: string
- foodRatings: object (itemId -> 1..5)
- likedAspects: string[]
- comment: string | null
- createdAt: string (UTC ISO)
