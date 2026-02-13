# MongoDB: menu_items collection

Used for menu catalog.

Collection: menu_items

Fields
- id: string
- name: string
- description: string
- price: number
- image: string (URL)
- isVeg: boolean
- category: string
- available: boolean
- popular: boolean
- todaysSpecial: boolean
- calories: number
- prepTime: string
- offer: string | null

Notes
- Seeded from backend/seed.py to match src/app/data/menuData.ts.
