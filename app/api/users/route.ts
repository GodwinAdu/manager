import { type NextRequest, NextResponse } from "next/server"
import { connectToDB } from "@/lib/mongoose"
import { requireRole } from "@/lib/auth-middleware"
import User from "@/lib/models/user.models"
import { hashPassword } from "@/lib/auth"

export const GET = requireRole(["admin"])(async (request: NextRequest, user: any) => {
  try {
    await connectToDB()

    const role = request.nextUrl.searchParams.get("role")
    const status = request.nextUrl.searchParams.get("status")

    const query: any = {}
    if (role) query.role = role
    if (status) query.status = status

    const users = await User.find(query).select("-password").sort({ createdAt: -1 })

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
})

export const POST = requireRole(["admin"])(async (request: NextRequest, user: any) => {
  try {
    await connectToDB()

    const { name, email, password, phone, role, salary, payrollType, dailyRate } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashPassword(password),
      phone,
      role: role || "worker",
      salary,
      payrollType: payrollType || "monthly_salary",
      dailyRate,
      status: "active",
    })

    return NextResponse.json(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
})

export const PATCH = requireRole(["admin"])(async (request: NextRequest, user: any) => {
  try {
    await connectToDB()

    const { userId, status, salary, role, name, email, phone, password, payrollType, dailyRate } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (salary !== undefined) updateData.salary = salary
    if (role) updateData.role = role
    if (name) updateData.name = name
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } })
      if (existingUser) {
        return NextResponse.json({ error: "Email already taken by another user" }, { status: 400 })
      }
      updateData.email = email.toLowerCase()
    }
    if (phone !== undefined) updateData.phone = phone
    if (password) updateData.password = hashPassword(password)
    if (payrollType) updateData.payrollType = payrollType
    if (dailyRate !== undefined) updateData.dailyRate = dailyRate

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password")

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
})

export const DELETE = requireRole(["admin"])(async (request: NextRequest, _user: any) => {
  try {
    await connectToDB()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const user = await User.findByIdAndDelete(id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
})
