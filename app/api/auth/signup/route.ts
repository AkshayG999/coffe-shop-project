import { NextRequest, NextResponse } from "next/server"
import { createUser, findUserByEmail } from "@/lib/db"
import { PasswordService } from "@/lib/services/password-service"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
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

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    try {
      // Check if user already exists
      const existingUser = findUserByEmail(email)
      if (existingUser) {
        return NextResponse.json(
          { message: "User already exists with this email" },
          { status: 400 }
        )
      }

      // Hash password using PasswordService
      const passwordHash = PasswordService.hashPassword(password)

      // Create user
      const user = createUser(name, email, passwordHash)

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
      console.error("Database error during signup:", dbError)
      return NextResponse.json(
        { message: `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

