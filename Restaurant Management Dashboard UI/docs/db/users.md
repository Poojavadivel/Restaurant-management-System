# MongoDB: users collection

Used for login, registration, and profile updates.

Collection: users

Fields
- name: string
- email: string (unique)
- phone: string
- address: string
- passwordHash: string (bcrypt hash)
- loyaltyPoints: number
- favorites: string[] (menu item ids)
- membership: object
  - plan: string (none|silver|gold|platinum)
  - status: string (active|inactive|expired)
  - monthlyPrice: number
  - pointsBoost: number
  - benefits: string[]
  - expiryDate: string (ISO date)
- createdAt: string (UTC ISO)
- updatedAt: string (UTC ISO)

Notes
- Plain passwords are never stored.
- Profile edits update name, email, phone, address, favorites, membership, loyaltyPoints.
