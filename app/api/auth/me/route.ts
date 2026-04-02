import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Shared in-memory store (persists across requests during server lifetime)
const authStore = {
  users: new Map<string, any>(),
  tokens: new Map<string, any>(),
}

// Initialize with demo users if empty
if (authStore.users.size === 0) {
  const hashPassword = (password: string) =>
    crypto.createHash("sha256").update(password).digest("hex")

  authStore.users.set("user@gmail.com", {
    id: "user-1",
    email: "user@gmail.com",
    name: "John Doe",
    passwordHash: hashPassword("password123"),
  })

  authStore.users.set("demo@example.com", {
    id: "user-2",
    email: "demo@example.com",
    name: "Demo User",
    passwordHash: hashPassword("demo123"),
  })
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    const tokenData = authStore.tokens.get(token)

    if (!tokenData) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      )
    }

    // Find user by id
    let user = null
    for (const [, userData] of authStore.users) {
      if (userData.id === tokenData.userId) {
        user = userData
        break
      }
    }

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    })
  } catch (error) {
    console.error("Me endpoint error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
