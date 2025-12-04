import { type NextRequest, NextResponse } from "next/server"
import { connectToDB } from "@/lib/mongoose"
import { requireRole } from "@/lib/auth-middleware"
import CompanySaving from "@/lib/models/company-saving.models"

export const GET = requireRole(["admin"])(async (request: NextRequest, user: any) => {
  try {
    await connectToDB()

    const month = request.nextUrl.searchParams.get("month")
    const query = month ? { month: new Date(month) } : {}

    const savings = await CompanySaving.findOne(query).sort({ month: -1 })

    return NextResponse.json({ savings: savings || null })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch savings" }, { status: 500 })
  }
})

export const POST = requireRole(["admin"])(async (request: NextRequest, user: any) => {
  try {
    await connectToDB()

    const { month, totalRevenue, savingsPercentage, notes } = await request.json()

    if (!month || totalRevenue === undefined || savingsPercentage === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const savingsAmount = (totalRevenue * savingsPercentage) / 100

    const monthDate = new Date(month)
    monthDate.setDate(1)

    const savings = await CompanySaving.findOneAndUpdate(
      { month: monthDate },
      {
        totalRevenue,
        savingsPercentage,
        savingsAmount,
        notes,
      },
      { upsert: true, new: true },
    )

    return NextResponse.json({ savings }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save savings" }, { status: 500 })
  }
})
