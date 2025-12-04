import { type NextRequest, NextResponse } from "next/server"
import { connectToDB } from "@/lib/mongoose"
import { requireRole } from "@/lib/auth-middleware"
import Payroll from "@/lib/models/payroll.models"
import Attendance from "@/lib/models/attendance.models"
import User from "@/lib/models/user.models"
import PayrollSettings from "@/lib/models/payroll-settings.models"

export const POST = requireRole(["admin"])(async (request: NextRequest, user: any) => {
  try {
    await connectToDB()

    const now = new Date()
    const month = new Date(now.getFullYear(), now.getMonth(), 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    // Get payroll settings
    let settings = await PayrollSettings.findOne()
    if (!settings) {
      settings = await PayrollSettings.create({
        payrollType: "monthly_salary",
        defaultWorkingDays: 20,
        defaultDailyRate: 100,
      })
    }

    // Get all active workers
    const workers = await User.find({  status: "active" })

    const payrolls = []

    for (const worker of workers) {
      // Check if payroll already exists
      const existing = await Payroll.findOne({ userId: worker._id, month })
      if (existing) continue

      // Count days worked this month
      const attendanceRecords = await Attendance.find({
        userId: worker._id,
        date: { $gte: month, $lt: nextMonth },
        status: "present",
      })

      const daysWorked = attendanceRecords.length
      const workerPayrollType = worker.payrollType || settings.payrollType
      let baseSalary = 0
      let totalPayable = 0

      if (workerPayrollType === "daily_rate") {
        const dailyRate = worker.dailyRate || settings.defaultDailyRate
        baseSalary = dailyRate
        totalPayable = dailyRate * daysWorked
      } else {
        baseSalary = worker.salary || 0
        totalPayable = baseSalary
      }

      const payroll = new Payroll({
        userId: worker._id,
        month,
        baseSalary,
        workingDays: settings.defaultWorkingDays,
        daysWorked,
        serviceCharge: 0,
        totalPayable,
        status: "processed",
      })

      await payroll.save()
      payrolls.push(payroll)
    }

    return NextResponse.json({
      message: `Processed payroll for ${payrolls.length} workers`,
      count: payrolls.length,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process bulk payroll" }, { status: 500 })
  }
})
