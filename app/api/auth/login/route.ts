import { NextRequest, NextResponse } from "next/server"
import { findUserByEmail, verifyPassword } from "@/lib/db"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 400 }
      )
    }

    try {
      // Find user by email
      const user = findUserByEmail(email)
      if (!user) {
        return NextResponse.json(
          { message: "Invalid email or password" },
          { status: 401 }
        )
      }

      // Verify password
      if (!verifyPassword(user.password_hash, password)) {
        return NextResponse.json(
          { message: "Invalid email or password" },
          { status: 401 }
        )
      }

      // Generate token
      const token = crypto.randomBytes(32).toString("hex")

      return NextResponse.json({
        user: {
          id: String(user.id),
          email: user.email,
          name: user.name,
          isAdmin: user.is_admin === 1,
        },
        token,
      })
    } catch (dbError) {
      console.error("Database error during login:", dbError)
      return NextResponse.json(
        { message: `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
