# MongoDB: reservations and waiting queue

Collection: reservations

Fields
- reservationId: string
- userId: string (email)
- tableNumber: number
- date: string (YYYY-MM-DD)
- timeSlot: string
- guests: number
- location: string
- segment: string
- userName: string
- userPhone: string
- status: string
- createdAt: string (UTC ISO)
- updatedAt: string (UTC ISO)

Collection: reservation_waiting_queue

Fields
- queueId: string
- userId: string (email)
- date: string (YYYY-MM-DD)
- timeSlot: string
- guests: number
- position: number
- estimatedWait: string
- createdAt: string (UTC ISO)
- updatedAt: string (UTC ISO)
