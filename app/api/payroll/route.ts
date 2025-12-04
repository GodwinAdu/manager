import { type NextRequest, NextResponse } from "next/server"
import { connectToDB } from "@/lib/mongoose"
import { requireAuth, requireRole } from "@/lib/auth-middleware"
import Payroll from "@/lib/models/payroll.models"
import User, { IUser } from "@/lib/models/user.models"

export const GET = requireAuth(async (request: NextRequest, user: IUser) => {
  try {
    await connectToDB()

    const month = request.nextUrl.searchParams.get("month")
    const status = request.nextUrl.searchParams.get("status")

    const query: Record<string, unknown> = {}
    if (month) {
      const date = new Date(month)
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      query.month = { $gte: startOfMonth, $lte: endOfMonth }
    }
    if (status) query.status = status
    
    // Workers can only see their own payroll
    if (user.role === "worker") {
      query.userId = user._id
    }

    const payroll = await Payroll.find(query).populate("userId", "name email salary").sort({ month: -1 })

    return NextResponse.json(payroll)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payroll" }, { status: 500 })
  }
})

export const POST = requireRole(["admin"])(async (request: NextRequest, user: IUser) => {
  try {
    await connectToDB()

    const { userId, daysWorked, serviceCharge } = await request.json()

    if (!userId || !daysWorked) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const now = new Date()
    const month = new Date(now.getFullYear(), now.getMonth(), 1)

    // Check if payroll already exists
    let payroll = await Payroll.findOne({ userId, month })
    if (payroll) {
      return NextResponse.json({ error: "Payroll already processed for this month" }, { status: 409 })
    }

    const workerPayrollType = user.payrollType || "monthly_salary"
    let baseSalary = 0
    let earnedSalary = 0
    
    if (workerPayrollType === "daily_rate") {
      baseSalary = user.dailyRate || 0
      earnedSalary = baseSalary * daysWorked
    } else {
      baseSalary = user.salary || 0
      earnedSalary = baseSalary
    }
    
    const charge = serviceCharge || 0
    const totalPayable = earnedSalary + charge

    payroll = new Payroll({
      userId,
      month,
      baseSalary,
      workingDays: 20,
      daysWorked,
      serviceCharge: charge,
      totalPayable,
      status: "processed",
    })

    await payroll.save()

    return NextResponse.json(payroll, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process payroll" }, { status: 500 })
  }
})

export const PATCH = requireRole(["admin"])(async (request: NextRequest, user:IUser) => {
  try {
    await connectToDB()

    const { payrollId, status } = await request.json()

    if (!payrollId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const payroll = await Payroll.findByIdAndUpdate(payrollId, { status }, { new: true })

    if (!payroll) {
      return NextResponse.json({ error: "Payroll not found" }, { status: 404 })
    }

    return NextResponse.json(payroll)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update payroll" }, { status: 500 })
  }
})

export const DELETE = requireRole(["admin"])(async (request: NextRequest, user: IUser) => {
  try {
    await connectToDB()

    const payrollId = request.nextUrl.searchParams.get("id")

    if (!payrollId) {
      return NextResponse.json({ error: "Payroll ID is required" }, { status: 400 })
    }

    const payroll = await Payroll.findByIdAndDelete(payrollId)

    if (!payroll) {
      return NextResponse.json({ error: "Payroll not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Payroll deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete payroll" }, { status: 500 })
  }
})
