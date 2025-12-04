import Attendance from "@/lib/models/attendance.models"
import { connectToDB } from "@/lib/mongoose"
import { requireAuth } from "@/lib/auth-middleware"
import { type NextRequest, NextResponse } from "next/server"
import { type IUser } from "@/lib/models/user.models"

export const GET = requireAuth(async (request: NextRequest, user: IUser) => {
  try {
    await connectToDB()

    const date = request.nextUrl.searchParams.get("date")
    const userId = request.nextUrl.searchParams.get("userId")

    const query: Record<string, unknown> = {}
    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      query.date = { $gte: startDate, $lte: endDate }
    }
    // Workers can only see their own attendance, admins can see all or specific user
    if (user.role === "worker") {
      query.userId = user._id
    } else if (user.role === "admin" && userId) {
      query.userId = userId
    } else if (user.role === "admin" && !userId) {
      // Admin can see all attendance if no specific userId is provided
    }

    const attendance = await Attendance.find(query).populate("userId", "name email").sort({ date: -1 })

    return NextResponse.json(attendance)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
})

export const POST = requireAuth(async (request: NextRequest, user: IUser) => {
  try {
    await connectToDB()

    const { userId, action, date } = await request.json()
    const targetUserId = user.role === "worker" ? user._id : (userId || user._id)

    if (!action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Use provided date or default to today
    const targetDate = date ? new Date(date) : new Date()
    const dayStart = new Date(targetDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(targetDate)
    dayEnd.setHours(23, 59, 59, 999)

    let attendance = await Attendance.findOne({
      userId: targetUserId,
      date: { $gte: dayStart, $lte: dayEnd },
    })

    if (!attendance) {
      attendance = new Attendance({
        userId: targetUserId,
        date: targetDate,
        status: "absent",
        workingHours: 0,
      })
    }

    if (action === "check-in") {
      attendance.checkInTime = new Date()
      attendance.status = "present"
    } else if (action === "check-out") {
      attendance.checkOutTime = new Date()
      if (attendance.checkInTime) {
        const hours =
          (attendance.checkOutTime.getTime() - new Date(attendance.checkInTime).getTime()) / (1000 * 60 * 60)
        attendance.workingHours = Math.round(hours * 100) / 100
      }
    } else if (action === "mark-absent") {
      attendance.status = "absent"
      attendance.checkInTime = undefined
      attendance.checkOutTime = undefined
      attendance.workingHours = 0
    }

    await attendance.save()

    // Populate and return
    const populatedAttendance = await Attendance.findById(attendance._id).populate("userId", "name email")

    return NextResponse.json(populatedAttendance)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 })
  }
})
