from __future__ import annotations

import os

try:
    from .app import create_app
    from .db import db
    from .models import MenuItem, Offer, Table, Notification
    from .mongo import get_menu_collection
except ImportError:  # pragma: no cover
    from backend.app import create_app
    from backend.db import db
    from backend.models import MenuItem, Offer, Table, Notification
    from backend.mongo import get_menu_collection


def _menu_item_doc(item: MenuItem) -> dict:
    return {
        "id": item.id,
        "name": item.name,
        "description": item.description,
        "price": item.price,
        "image": item.image,
        "isVeg": bool(item.is_veg),
        "category": item.category,
        "available": bool(item.available),
        "popular": bool(item.popular),
        "todaysSpecial": bool(item.todays_special),
        "calories": item.calories,
        "prepTime": item.prep_time,
        "offer": item.offer,
    }


def seed_menu_items(session):
    # Mirrored from src/app/data/menuData.ts
    items = [
        # Veg Starters
        MenuItem(
            id="v1",
            name="Paneer Tikka",
            description="Grilled cottage cheese marinated in spices",
            price=250,
            image="https://images.unsplash.com/photo-1690401769082-5f475f87fb22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYW5lZXIlMjB0aWtrYSUyMGluZGlhbiUyMGFwcGV0aXplcnxlbnwxfHx8fDE3NzAwMzI4OTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
            is_veg=True,
            category="Starters",
            available=True,
            popular=True,
            calories=280,
            prep_time="15-20 mins",
        ),
        MenuItem(
            id="v2",
            name="Vegetable Spring Rolls",
            description="Crispy rolls filled with fresh vegetables",
            price=180,
            image="https://images.unsplash.com/photo-1761315413785-0bf98364ceab?crop=entropy&cs=tinysrgb&fit=max&q=80&w=1080",
            is_veg=True,
            category="Starters",
            available=True,
            calories=210,
            prep_time="12-15 mins",
            offer="15% OFF",
        ),
        MenuItem(
            id="v3",
            name="Hara Bhara Kabab",
            description="Green vegetable patties with spices",
            price=200,
            image="https://images.unsplash.com/photo-1599307767316-776533bb941c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHZlZ2V0YWJsZSUyMGtlYmFiJTIwaW5kaWFufGVufDF8fHx8MTc3MDA2NDQwMXww&ixlib=rb-4.1.0&q=80&w=1080",
            is_veg=True,
            category="Starters",
            available=True,
            calories=240,
            prep_time="18-22 mins",
        ),

        # Veg Main Course
        MenuItem(
            id="v4",
            name="Dal Makhani",
            description="Creamy black lentils cooked overnight",
            price=280,
            image="https://images.unsplash.com/photo-1642821373475-cfd6c7301b18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYWwlMjBtYWtoYW5pJTIwYmxhY2slMjBsZW50aWxzJTIwY3Vycnl8ZW58MXx8fHwxNzcwMDY0Mzg0fDA&ixlib=rb-4.1.0&q=80&w=1080",
            is_veg=True,
            category="Main Course",
            available=True,
            popular=True,
            todays_special=True,
            calories=385,
            prep_time="25-30 mins",
        ),
        MenuItem(
            id="v5",
            name="Paneer Butter Masala",
            description="Cottage cheese in rich tomato gravy",
            price=320,
            image="https://images.unsplash.com/photo-1708793873401-e8c6c153b76a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYW5lZXIlMjBidXR0ZXIlMjBtYXNhbGElMjBpbmRpYW4lMjBjdXJyeXxlbnwxfHx8fDE3NzAwNjQzODR8MA&ixlib=rb-4.1.0&q=80&w=1080",
            is_veg=True,
            category="Main Course",
            available=True,
            popular=True,
            calories=420,
            prep_time="20-25 mins",
        ),
        MenuItem(
            id="v6",
            name="Veg Biryani",
            description="Aromatic rice with mixed vegetables",
            price=280,
            image="https://images.unsplash.com/photo-1630409346824-4f0e7b080087?q=80&w=2146&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            is_veg=True,
            category="Main Course",
            available=True,
            calories=450,
            prep_time="30-35 mins",
            offer="10% OFF",
        ),
        MenuItem(
            id="v7",
            name="Malai Kofta",
            description="Cottage cheese dumplings in creamy sauce",
            price=300,
            image="https://images.unsplash.com/photo-1567337710282-00832b415979?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdldGFyaWFuJTIwZHVtcGxpbmdzJTIwaW5kaWFuJTIwY3Vycnl8ZW58MXx8fHwxNzcwMDY0NDAyfDA&ixlib=rb-4.1.0&q=80&w=1080",
            is_veg=True,
            category="Main Course",
            available=True,
            calories=395,
            prep_time="22-28 mins",
        ),
        MenuItem(
            id="v8",
            name="Chole Bhature",
            description="Spicy chickpeas with fluffy fried bread",
            price=220,
            image="https://images.unsplash.com/photo-1760047550367-3d72fa3053c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBjaGlja3BlYXMlMjBicmVhZCUyMGZyaWVkfGVufDF8fHx8MTc3MDA2NDQxMnww&ixlib=rb-4.1.0&q=80&w=1080",
            is_veg=True,
            category="Main Course",
            available=True,
            calories=520,
            prep_time="25-30 mins",
        ),

        # Non-Veg Starters
        MenuItem(
            id="nv1",
            name="Chicken Tikka",
            description="Grilled chicken pieces marinated in yogurt",
            price=320,
            image="https://images.unsplash.com/photo-1627799370307-9b2a689bb94f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwdGlra2ElMjB0YW5kb29yaSUyMGdyaWxsZWR8ZW58MXx8fHwxNzcwMDY0Mzg2fDA&ixlib=rb-4.1.0&q=80&w=1080",
            is_veg=False,
            category="Starters",
            available=True,
            popular=True,
            calories=310,
            prep_time="18-22 mins",
        ),
        MenuItem(
            id="nv2",
            name="Fish Amritsari",
            description="Crispy fried fish with spices",
            price=380,
            image="https://images.unsplash.com/photo-1673432512498-9e1aed6cbd29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXNoJTIwYW1yaXRzYXJpJTIwZnJpZWQlMjBjcmlzcHl8ZW58MXx8fHwxNzcwMDY0Mzg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
            is_veg=False,
            category="Starters",
            available=True,
            calories=340,
            prep_time="15-18 mins",
            offer="20% OFF",
        ),
        MenuItem(
            id="nv3",
            name="Mutton Seekh Kabab",
            description="Minced mutton on skewers",
            price=400,
            image="https://images.unsplash.com/photo-1749802585605-a459271b4358?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXR0b24lMjBzZWVraCUyMGthYmFiJTIwc2tld2Vyc3xlbnwxfHx8fDE3NzAwNDc5MzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
            is_veg=False,
            category="Starters",
            available=True,
            calories=380,
            prep_time="20-25 mins",
        ),

        # Non-Veg Main Course
        MenuItem(
            id="nv4",
            name="Butter Chicken",
            description="Tender chicken in creamy tomato sauce",
            price=380,
            image="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXR0ZXIlMjBjaGlja2VuJTIwaW5kaWFuJTIwY3Vycnl8ZW58MXx8fHwxNzcwMDQ3OTM0fDA&ixlib=rb-4.1.0&q=80&w=1080",
            is_veg=False,
            category="Main Course",
            available=True,
            popular=True,
            todays_special=True,
            calories=490,
            prep_time="25-30 mins",
        ),
        MenuItem(
            id="nv5",
            name="Chicken Biryani",
            description="Aromatic basmati rice with chicken",
            price=350,
            image="https://images.unsplash.com/photo-1589302168068-964664d93dc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwYmlyeWFuaSUyMHJpY2UlMjBpbmRpYW58ZW58MXx8fHwxNzcwMDY0Mzg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
            is_veg=False,
            category="Main Course",
            available=True,
            popular=True,
            calories=550,
            prep_time="30-35 mins",
        ),
        MenuItem(
            id="nv6",
            name="Mutton Rogan Josh",
            description="Slow-cooked mutton in aromatic gravy",
            price=450,
            image="https://images.unsplash.com/photo-1640542509430-f529fdfce835?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXR0b24lMjByb2dhbiUyMGpvc2glMjBjdXJyeXxlbnwxfHx8fDE3NzAwNDc5MzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
            is_veg=False,
            category="Main Course",
            available=True,
            calories=520,
            prep_time="35-40 mins",
            offer="Free Dessert",
        ),
        MenuItem(
            id="nv7",
            name="Fish Curry",
            description="Fresh fish in spicy coconut curry",
            price=420,
            image="https://images.unsplash.com/photo-1626508035297-0cd27c397d67?crop=entropy&cs=tinysrgb&fit=max&q=80&w=1080",
            is_veg=False,
            category="Main Course",
            available=True,
            calories=360,
            prep_time="20-25 mins",
        ),
        MenuItem(
            id="nv8",
            name="Chicken Korma",
            description="Chicken in mild creamy sauce with nuts",
            price=360,
            image="https://images.unsplash.com/photo-1728542575492-47e02eb3305c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwa29ybWElMjBjcmVhbXklMjBjdXJyeXxlbnwxfHx8fDE3NzAwNDc5MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
            is_veg=False,
            category="Main Course",
            available=True,
            calories=440,
            prep_time="22-28 mins",
        ),

        # Breads
        MenuItem(
            id="b1",
            name="Butter Naan",
            description="Soft leavened bread with butter",
            price=50,
            image="https://images.unsplash.com/photo-1655979284091-eea0e93405ee?crop=entropy&cs=tinysrgb&fit=max&q=80&w=1080",
            is_veg=True,
            category="Breads",
            available=True,
            calories=280,
            prep_time="8-10 mins",
        ),
        MenuItem(
            id="b2",
            name="Garlic Naan",
            description="Naan bread topped with garlic",
            price=60,
            image="https://images.unsplash.com/photo-1640625314547-aee9a7696589?crop=entropy&cs=tinysrgb&fit=max&q=80&w=1080",
            is_veg=True,
            category="Breads",
            available=True,
            calories=290,
            prep_time="8-10 mins",
        ),
        MenuItem(
            id="b3",
            name="Tandoori Roti",
            description="Whole wheat flatbread",
            price=30,
            image="https://images.unsplash.com/photo-1718874560784-d4164371eb38?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            is_veg=True,
            category="Breads",
            available=True,
            calories=120,
            prep_time="6-8 mins",
        ),

        # Desserts
        MenuItem(
            id="d1",
            name="Gulab Jamun",
            description="Soft milk dumplings in sugar syrup",
            price=120,
            image="https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWxhYiUyMGphbXVuJTIwaW5kaWFuJTIwc3dlZXQlMjBkZXNzZXJ0fGVufDF8fHx8MTc3MDA2NDM5MXww&ixlib=rb-4.1.0&q=80&w=1080",
            is_veg=True,
            category="Desserts",
            available=True,
            popular=True,
            todays_special=True,
            calories=375,
            prep_time="12-15 mins",
        ),
        MenuItem(
            id="d2",
            name="Rasmalai",
            description="Cottage cheese discs in sweet milk",
            price=140,
            image="https://images.unsplash.com/photo-1596450514735-111a2fe02935?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYXNtYWxhaSUyMGluZGlhbiUyMGRlc3NlcnQlMjBzd2VldHxlbnwxfHx8fDE3NzAwNDc5Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
            is_veg=True,
            category="Desserts",
            available=True,
            calories=285,
            prep_time="10-12 mins",
        ),
        MenuItem(
            id="d3",
            name="Kulfi",
            description="Traditional Indian ice cream",
            price=100,
            image="https://images.unsplash.com/photo-1610507039576-2e4d2ea93f9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBpY2UlMjBjcmVhbSUyMGZyb3plbiUyMGRlc3NlcnR8ZW58MXx8fHwxNzcwMDYyODA4fDA&ixlib=rb-4.1.0&q=80&w=1080",
            is_veg=True,
            category="Desserts",
            available=True,
            calories=220,
            prep_time="5-8 mins",
        ),

        # Beverages
        MenuItem(
            id="bv1",
            name="Mango Lassi",
            description="Sweet yogurt drink with mango",
            price=80,
            image="https://images.unsplash.com/photo-1639771884984-88fa62ac7e19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5nbyUyMGxhc3NpJTIweW9ndXJ0JTIwZHJpbmt8ZW58MXx8fHwxNzcwMDQ3OTM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
            is_veg=True,
            category="Beverages",
            available=True,
            calories=180,
            prep_time="3-5 mins",
        ),
        MenuItem(
            id="bv2",
            name="Masala Chai",
            description="Spiced Indian tea",
            price=40,
            image="https://images.unsplash.com/photo-1628702774354-f09e4a167a8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXNhbGElMjBjaGFpJTIwaW5kaWFuJTIwdGVhfGVufDF8fHx8MTc3MDA2NDM5Mnww&ixlib=rb-4.1.0&q=80&w=1080",
            is_veg=True,
            category="Beverages",
            available=True,
            calories=90,
            prep_time="5-7 mins",
        ),
        MenuItem(
            id="bv3",
            name="Fresh Lime Soda",
            description="Refreshing lime and soda water",
            price=60,
            image="https://images.unsplash.com/photo-1716925948926-4fb5eaf198d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaW1lJTIwc29kYSUyMGRyaW5rJTIwcmVmcmVzaGluZ3xlbnwxfHx8fDE3NzAwNjQzOTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
            is_veg=True,
            category="Beverages",
            available=True,
            calories=45,
            prep_time="2-3 mins",
        ),
    ]

    for item in items:
        session.merge(item)

    menu = get_menu_collection()
    for item in items:
        doc = _menu_item_doc(item)
        menu.update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)


def seed_offers(session):
    offers = [
        Offer(id="OFF10", title="10% OFF on orders above ₹500", type="PERCENT", value=10, min_order_value=500),
        Offer(id="FLAT50", title="Flat ₹50 OFF on orders above ₹700", type="FLAT", value=50, min_order_value=700),
        Offer(id="LOYAL20", title="Extra ₹20 OFF for loyalty members", type="FLAT", value=20, requires_loyalty=True),
    ]
    for offer in offers:
        session.merge(offer)


def seed_tables(session):
    tables = [
        Table(table_id="T001", table_name="VIP Table 1", location="VIP Hall", segment="Front", capacity=4),
        Table(table_id="T002", table_name="VIP Table 2", location="VIP Hall", segment="Middle", capacity=6),
        Table(table_id="T003", table_name="VIP Table 3", location="VIP Hall", segment="Back", capacity=8),
        Table(table_id="T004", table_name="AC Table 1", location="AC Hall", segment="Front", capacity=4),
        Table(table_id="T005", table_name="AC Table 2", location="AC Hall", segment="Middle", capacity=4),
        Table(table_id="T006", table_name="AC Table 3", location="AC Hall", segment="Middle", capacity=6),
        Table(table_id="T007", table_name="AC Table 4", location="AC Hall", segment="Back", capacity=2),
        Table(table_id="T008", table_name="Main Table 1", location="Main Hall", segment="Front", capacity=4),
        Table(table_id="T009", table_name="Main Table 2", location="Main Hall", segment="Front", capacity=6),
        Table(table_id="T010", table_name="Main Table 3", location="Main Hall", segment="Middle", capacity=8),
        Table(table_id="T011", table_name="Main Table 4", location="Main Hall", segment="Back", capacity=2),
        Table(table_id="T012", table_name="Main Table 5", location="Main Hall", segment="Back", capacity=4),
    ]
    for t in tables:
        session.merge(t)


def seed_notifications(session):
    seeds = [
        Notification(
            id="n-001",
            user_id=None,
            type="pending",
            title="Order Placed",
            message="Your order has been placed and is awaiting confirmation.",
            reference_id="ORD-1042",
            is_read=False,
        ),
        Notification(
            id="n-002",
            user_id=None,
            type="pending",
            title="Order Being Prepared",
            message="The kitchen has started preparing your order.",
            reference_id="ORD-1042",
            is_read=False,
        ),
    ]
    for n in seeds:
        session.merge(n)


def main():
    app = create_app()

    with app.app_context():
        db.create_all()
        seed_menu_items(db.session)
        seed_offers(db.session)
        seed_tables(db.session)
        seed_notifications(db.session)
        db.session.commit()

    print("Seed complete.")


if __name__ == "__main__":
    main()
