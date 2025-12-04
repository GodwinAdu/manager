import User from "@/lib/models/user.models"
import { connectToDB } from "@/lib/mongoose"
import { verifyPassword } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"


export async function POST(request: NextRequest) {
  try {
    await connectToDB()
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    if (!verifyPassword(password, user.password)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const response = NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    response.cookies.set(
      "session",
      JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    )

    return response
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
