import { type NextRequest, NextResponse } from "next/server"
import { connectToDB } from "@/lib/mongoose"
import { requireAuth } from "@/lib/auth-middleware"
import User from "@/lib/models/user.models"
import { hashPassword, verifyPassword } from "@/lib/auth"

export const GET = requireAuth(async (request: NextRequest, user: any) => {
  try {
    await connectToDB()
    
    const userProfile = await User.findById(user._id).select("-password")
    
    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(userProfile)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
})

export const PUT = requireAuth(async (request: NextRequest, user: any) => {
  try {
    await connectToDB()

    const { name, email, phone, currentPassword, newPassword } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const userProfile = await User.findById(user._id)
    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if email is already taken by another user
    if (email !== userProfile.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } })
      if (existingUser) {
        return NextResponse.json({ error: "Email already taken" }, { status: 400 })
      }
    }

    const updateData: any = {
      name,
      email: email.toLowerCase(),
      phone,
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to change password" }, { status: 400 })
      }

      if (!verifyPassword(currentPassword, userProfile.password)) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 })
      }

      updateData.password = hashPassword(newPassword)
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updateData, { new: true }).select("-password")

    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
})

export const DELETE = requireAuth(async (request: NextRequest, user: any) => {
  try {
    await connectToDB()

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "Password is required to delete account" }, { status: 400 })
    }

    const userProfile = await User.findById(user._id)
    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!verifyPassword(password, userProfile.password)) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 400 })
    }

    await User.findByIdAndDelete(user._id)

    return NextResponse.json({ message: "Account deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
})