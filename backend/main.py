from __future__ import annotations

import hashlib
import secrets
import sqlite3
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Header, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel


ROOT_DIR = Path(__file__).resolve().parent.parent
DATABASE_PATH = ROOT_DIR / "database" / "coffee_shop.db"
SCHEMA_PATH = ROOT_DIR / "database" / "schema.sql"
MENU_CATEGORIES = {"Espresso", "Brewed", "Specialty", "Cold"}
PAYMENT_METHODS = {"cod", "upi", "netbanking", "card"}
ORDER_TYPES = {"pickup", "delivery"}

tokens: dict[str, dict[str, Any]] = {}

app = FastAPI(title="Coffee Shop API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AuthRequest(BaseModel):
    email: str | None = None
    password: str | None = None


class SignupRequest(AuthRequest):
    name: str | None = None


class Customer(BaseModel):
    firstName: str | None = None
    lastName: str | None = None
    email: str | None = None
    phone: str | None = None


class OrderItem(BaseModel):
    id: int
    quantity: int
    price: float


class DeliveryAddress(BaseModel):
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pinCode: str | None = None


class OrderRequest(BaseModel):
    customer: Customer | None = None
    orderType: str | None = None
    paymentMethod: str | None = None
    items: list[OrderItem] | None = None
    subtotal: float | None = None
    tax: float | None = None
    deliveryFee: float = 0
    total: float | None = None
    specialInstructions: str = ""
    deliveryAddress: DeliveryAddress | None = None


class ContactRequest(BaseModel):
    name: str | None = None
    email: str | None = None
    subject: str = ""
    message: str | None = None


class MenuItemRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    category: str | None = None
    imageUrl: str | None = None
    image: str | None = None
    isAvailable: bool | None = None


def json_response(payload: dict[str, Any], http_status: int = status.HTTP_200_OK) -> JSONResponse:
    return JSONResponse(payload, status_code=http_status)


def success(payload: dict[str, Any] | None = None, message: str = "", http_status: int = status.HTTP_200_OK) -> JSONResponse:
    body = {"success": True, "message": message}
    if payload:
        body.update(payload)
    return json_response(body, http_status)


def failure(message: str, http_status: int = status.HTTP_400_BAD_REQUEST, payload: dict[str, Any] | None = None) -> JSONResponse:
    body = {"success": False, "message": message}
    if payload:
        body.update(payload)
    return json_response(body, http_status)


def get_db() -> sqlite3.Connection:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def initialize_database() -> None:
    if not SCHEMA_PATH.exists():
        raise RuntimeError(f"Schema file not found at {SCHEMA_PATH}")

    with get_db() as conn:
        conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def is_valid_email(email: str) -> bool:
    return "@" in email and "." in email.rsplit("@", 1)[-1]


def bearer_token(authorization: str | None) -> str | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    return authorization[7:]


def user_payload(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": str(row["id"]),
        "email": row["email"],
        "name": row["name"],
        "isAdmin": row["is_admin"] == 1,
    }


def menu_payload(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "name": row["name"],
        "description": row["description"],
        "price": row["price"],
        "category": row["category"],
        "image": row["image_url"],
        "isAvailable": row["is_available"] == 1,
        "createdAt": row["created_at"] if "created_at" in row.keys() else None,
    }


def validate_menu_item(data: dict[str, Any]) -> dict[str, list[str]]:
    errors: dict[str, list[str]] = {}
    name = data.get("name")
    description = data.get("description")
    price = data.get("price")
    category = data.get("category")
    image_url = data.get("imageUrl") or data.get("image")

    if not isinstance(name, str) or len(name.strip()) < 2:
        errors["name"] = ["Name must be at least 2 characters"]
    elif len(name) > 100:
        errors["name"] = ["Name must not exceed 100 characters"]

    if not isinstance(description, str) or len(description.strip()) < 10:
        errors["description"] = ["Description must be at least 10 characters"]
    elif len(description) > 500:
        errors["description"] = ["Description must not exceed 500 characters"]

    if not isinstance(price, (int, float)):
        errors["price"] = ["Price is required and must be a number"]
    elif price < 1:
        errors["price"] = ["Price must be at least ₹1"]
    elif price > 10000:
        errors["price"] = ["Price must not exceed ₹10,000"]

    if category not in MENU_CATEGORIES:
        errors["category"] = [f"Category must be one of: {', '.join(sorted(MENU_CATEGORIES))}"]

    if not isinstance(image_url, str) or not image_url.strip():
        errors["imageUrl"] = ["Image URL is required"]
    elif len(image_url) > 2048:
        errors["imageUrl"] = ["Image URL is too long"]
    elif not (image_url.startswith("http://") or image_url.startswith("https://")):
        errors["imageUrl"] = ["Image URL must be a valid URL"]

    return errors


@app.on_event("startup")
def startup() -> None:
    initialize_database()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.api_route("/api/init-db", methods=["GET", "POST"])
def init_db() -> JSONResponse:
    initialize_database()
    return success(
        {"database_path": str(DATABASE_PATH)},
        "Database initialized successfully!",
    )


@app.post("/api/auth/signup")
def signup(body: SignupRequest) -> JSONResponse:
    if not body.name or not body.email or not body.password:
        return failure("Name, email, and password are required")
    email = body.email.strip().lower()
    if not is_valid_email(email):
        return failure("Invalid email address")
    if len(body.password) < 6:
        return failure("Password must be at least 6 characters long")

    try:
        with get_db() as conn:
            existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
            if existing:
                return failure("User already exists with this email")

            cursor = conn.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
                (body.name.strip(), email, hash_password(body.password)),
            )
            user = conn.execute("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
    except sqlite3.Error as exc:
        return failure(f"Database error: {exc}", status.HTTP_500_INTERNAL_SERVER_ERROR)

    token = secrets.token_hex(32)
    tokens[token] = {"user_id": user["id"]}
    return json_response({"user": user_payload(user), "token": token})


@app.post("/api/auth/login")
def login(body: AuthRequest) -> JSONResponse:
    if not body.email or not body.password:
        return failure("Email and password are required")
    email = body.email.strip().lower()
    if not is_valid_email(email):
        return failure("Invalid email address")

    try:
        with get_db() as conn:
            user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    except sqlite3.Error as exc:
        return failure(f"Database error: {exc}", status.HTTP_500_INTERNAL_SERVER_ERROR)

    if not user or user["password_hash"] != hash_password(body.password):
        return failure("Invalid email or password", status.HTTP_401_UNAUTHORIZED)

    token = secrets.token_hex(32)
    tokens[token] = {"user_id": user["id"]}
    return json_response({"user": user_payload(user), "token": token})


@app.get("/api/auth/me")
def me(authorization: str | None = Header(default=None)) -> JSONResponse:
    token = bearer_token(authorization)
    token_data = tokens.get(token or "")
    if not token_data:
        return json_response({"message": "Unauthorized"}, status.HTTP_401_UNAUTHORIZED)

    with get_db() as conn:
        user = conn.execute("SELECT * FROM users WHERE id = ?", (token_data["user_id"],)).fetchone()
    if not user:
        return json_response({"message": "User not found"}, status.HTTP_404_NOT_FOUND)

    return json_response(user_payload(user))


@app.post("/api/auth/logout")
def logout(authorization: str | None = Header(default=None)) -> JSONResponse:
    token = bearer_token(authorization)
    if not token:
        return json_response({"message": "Unauthorized"}, status.HTTP_401_UNAUTHORIZED)
    tokens.pop(token, None)
    return json_response({"message": "Logged out successfully"})


@app.get("/api/menu")
def get_menu(category: str | None = None, includeUnavailable: bool = False) -> JSONResponse:
    where = []
    params: list[Any] = []
    if category and category != "all":
        where.append("category = ?")
        params.append(category)
    if not includeUnavailable:
        where.append("is_available = 1")

    query = "SELECT id, name, description, price, category, image_url, is_available, created_at FROM menu_items"
    if where:
        query += " WHERE " + " AND ".join(where)

    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()

    return success(
        {"items": [menu_payload(row) for row in rows]},
        "Menu items retrieved successfully",
    )


@app.post("/api/menu")
async def create_menu_item(request: Request) -> JSONResponse:
    body = await request.json()
    errors = validate_menu_item(body)
    if errors:
        return failure("Validation failed", payload={"errors": errors})

    image_url = body.get("imageUrl") or body.get("image")
    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO menu_items (name, description, price, category, image_url, is_available, created_at)
            VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
            """,
            (body["name"], body["description"], body["price"], body["category"], image_url),
        )
        item = conn.execute("SELECT * FROM menu_items WHERE id = ?", (cursor.lastrowid,)).fetchone()

    return success({"data": menu_payload(item)}, "Menu item created successfully", status.HTTP_201_CREATED)


@app.put("/api/menu/{item_id}")
async def update_menu_item(item_id: int, request: Request) -> JSONResponse:
    if item_id <= 0:
        return failure("Invalid menu item ID")

    body = await request.json()
    with get_db() as conn:
        existing = conn.execute("SELECT * FROM menu_items WHERE id = ?", (item_id,)).fetchone()
        if not existing:
            return failure("Menu item not found", status.HTTP_404_NOT_FOUND)

        if set(body.keys()) == {"isAvailable"}:
            conn.execute(
                "UPDATE menu_items SET is_available = ? WHERE id = ?",
                (1 if body["isAvailable"] else 0, item_id),
            )
            item = conn.execute("SELECT * FROM menu_items WHERE id = ?", (item_id,)).fetchone()
            return success({"data": menu_payload(item)}, "Menu item availability updated successfully")

        candidate = {
            "name": body.get("name", existing["name"]),
            "description": body.get("description", existing["description"]),
            "price": body.get("price", existing["price"]),
            "category": body.get("category", existing["category"]),
            "imageUrl": body.get("imageUrl") or body.get("image") or existing["image_url"],
        }
        errors = validate_menu_item(candidate)
        if errors:
            return failure("Validation failed", payload={"errors": errors})

        is_available = body.get("isAvailable")
        conn.execute(
            """
            UPDATE menu_items
            SET name = ?, description = ?, price = ?, category = ?, image_url = ?, is_available = ?
            WHERE id = ?
            """,
            (
                candidate["name"],
                candidate["description"],
                candidate["price"],
                candidate["category"],
                candidate["imageUrl"],
                1 if (existing["is_available"] == 1 if is_available is None else is_available) else 0,
                item_id,
            ),
        )
        item = conn.execute("SELECT * FROM menu_items WHERE id = ?", (item_id,)).fetchone()

    return success({"data": menu_payload(item)}, "Menu item updated successfully")


@app.delete("/api/menu/{item_id}")
def delete_menu_item(item_id: int) -> JSONResponse:
    if item_id <= 0:
        return failure("Invalid menu item ID")

    with get_db() as conn:
        result = conn.execute("DELETE FROM menu_items WHERE id = ?", (item_id,))
        if result.rowcount == 0:
            return failure("Menu item not found", status.HTTP_404_NOT_FOUND)

    return success(message="Menu item deleted successfully")


@app.post("/api/orders")
def create_order(body: OrderRequest) -> JSONResponse:
    required_amounts = [body.subtotal, body.tax, body.total]
    if not body.customer or not body.orderType or not body.paymentMethod or not body.items or any(value is None for value in required_amounts):
        return failure("Invalid order data")
    if body.orderType not in ORDER_TYPES:
        return failure("Invalid order type")
    if body.paymentMethod not in PAYMENT_METHODS:
        return failure("Invalid payment method")
    if body.orderType == "delivery" and not body.deliveryAddress:
        return failure("Delivery address required for delivery orders")

    customer = body.customer
    if not customer.firstName or not customer.lastName or not customer.email or not customer.phone:
        return failure("Missing customer information")

    try:
        with get_db() as conn:
            existing = conn.execute("SELECT id FROM customers WHERE email = ?", (customer.email,)).fetchone()
            if existing:
                customer_id = existing["id"]
                conn.execute(
                    "UPDATE customers SET first_name = ?, last_name = ?, phone = ? WHERE id = ?",
                    (customer.firstName, customer.lastName, customer.phone, customer_id),
                )
            else:
                cursor = conn.execute(
                    "INSERT INTO customers (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)",
                    (customer.firstName, customer.lastName, customer.email, customer.phone),
                )
                customer_id = cursor.lastrowid

            cursor = conn.execute(
                """
                INSERT INTO orders (customer_id, order_type, payment_method, subtotal, tax, delivery_fee, total, special_instructions, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
                """,
                (
                    customer_id,
                    body.orderType,
                    body.paymentMethod,
                    body.subtotal,
                    body.tax,
                    body.deliveryFee,
                    body.total,
                    body.specialInstructions,
                ),
            )
            order_id = cursor.lastrowid

            for item in body.items:
                conn.execute(
                    "INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)",
                    (order_id, item.id, item.quantity, item.price),
                )

            if body.orderType == "delivery" and body.deliveryAddress:
                address = body.deliveryAddress
                conn.execute(
                    "INSERT INTO delivery_addresses (order_id, address, city, state, pin_code) VALUES (?, ?, ?, ?, ?)",
                    (order_id, address.address, address.city, address.state, address.pinCode),
                )
    except sqlite3.Error as exc:
        return failure(f"Database error: {exc}", status.HTTP_500_INTERNAL_SERVER_ERROR)

    display_order_id = f"BRW{secrets.token_hex(3).upper()}"
    return success(
        {"orderId": display_order_id, "orderDbId": order_id},
        "Order placed successfully",
        status.HTTP_201_CREATED,
    )


@app.post("/api/contact")
def contact(body: ContactRequest) -> JSONResponse:
    if not body.name or not body.email or not body.message:
        return failure("Missing required fields")
    email = body.email.strip().lower()
    if not is_valid_email(email):
        return failure("Invalid email address")

    with get_db() as conn:
        cursor = conn.execute(
            "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
            (body.name.strip(), email, body.subject.strip(), body.message.strip()),
        )

    return success({"messageId": cursor.lastrowid}, "Message sent successfully")
