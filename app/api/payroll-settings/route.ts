import { type NextRequest, NextResponse } from "next/server"
import { connectToDB } from "@/lib/mongoose"
import { requireRole } from "@/lib/auth-middleware"
import PayrollSettings from "@/lib/models/payroll-settings.models"

export const GET = requireRole(["admin"])(async (request: NextRequest, user: any) => {
  try {
    await connectToDB()

    let settings = await PayrollSettings.findOne()
    if (!settings) {
      settings = await PayrollSettings.create({
        payrollType: "monthly_salary",
        defaultWorkingDays: 20,
        defaultDailyRate: 100,
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
})

export const POST = requireRole(["admin"])(async (request: NextRequest, user: any) => {
  try {
    await connectToDB()

    const { payrollType, defaultWorkingDays, defaultDailyRate } = await request.json()

    let settings = await PayrollSettings.findOne()
    if (settings) {
      settings.payrollType = payrollType
      settings.defaultWorkingDays = defaultWorkingDays
      settings.defaultDailyRate = defaultDailyRate
      await settings.save()
    } else {
      settings = await PayrollSettings.create({
        payrollType,
        defaultWorkingDays,
        defaultDailyRate,
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
})