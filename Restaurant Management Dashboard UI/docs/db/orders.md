# MongoDB: orders collection

Used for order history.

Collection: orders

Fields
- id: string
- userId: string (email)
- items: array (full order items)
- subtotal: number
- tax: number
- loyaltyDiscount: number
- loyaltyPointsRedeemed: number
- total: number
- status: string
- type: string (dine-in|takeaway)
- date: string (ISO)
- deliveryAddress: string | null
- invoiceUrl: string | null
- createdAt: string (UTC ISO)
- updatedAt: string (UTC ISO)
