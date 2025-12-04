import { type NextRequest, NextResponse } from "next/server"
import { connectToDB } from "@/lib/mongoose"
import { requireRole } from "@/lib/auth-middleware"
import ProfitAllocation from "@/lib/models/profit-allocation.models"

export const GET = requireRole(["admin"])(async (request: NextRequest, user: any) => {
  try {
    await connectToDB()

    const month = request.nextUrl.searchParams.get("month")
    const query = month ? { month: new Date(month) } : {}

    const allocation = await ProfitAllocation.findOne(query).sort({ month: -1 })

    return NextResponse.json({ allocation })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch allocation" }, { status: 500 })
  }
})

export const POST = requireRole(["admin"])(async (request: NextRequest, user: any) => {
  try {
    await connectToDB()

    const { month, totalProfit, savingsAmount, savingsPercentage, allocations } = await request.json()

    if (!month || totalProfit === undefined || savingsAmount === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const totalAllocated = allocations.reduce((sum: number, a: any) => sum + a.amount, 0)
    const remainingAmount = totalProfit - savingsAmount - totalAllocated

    const monthDate = new Date(month)
    monthDate.setDate(1)

    const allocation = await ProfitAllocation.findOneAndUpdate(
      { month: monthDate },
      {
        totalProfit,
        savingsAmount,
        savingsPercentage,
        allocations,
        remainingAmount,
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({ allocation }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save allocation" }, { status: 500 })
  }
})