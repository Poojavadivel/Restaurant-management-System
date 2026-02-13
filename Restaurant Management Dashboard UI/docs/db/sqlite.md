# SQLite: SQLAlchemy tables

These tables are stored in the local SQLite database used by the Flask API.

Table: offers
- id, title, type, value, min_order_value, requires_loyalty

Table: tables
- table_id, table_name, location, segment, capacity

Table: queue_entries
- id, name, guests, notification_method, contact, hall, segment, position, estimated_wait_minutes, joined_at, queue_date, notified_at_5_min

Table: notifications
- id, user_id, type, title, message, reference_id, created_at, is_read
