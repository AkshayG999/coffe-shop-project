import { NextRequest, NextResponse } from "next/server"

// Shared in-memory store (persists across requests during server lifetime)
const authStore = {
  users: new Map<string, any>(),
  tokens: new Map<string, any>(),
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)

    // Remove token from store
    authStore.tokens.delete(token)

    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
