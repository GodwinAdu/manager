import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDB } from "@/lib/mongoose"
import User from "@/lib/models/user.models"



export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("session")?.value

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    await connectToDB()

    const user = await User.findById(session).select("-password")

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({ authenticated: true, user })
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
