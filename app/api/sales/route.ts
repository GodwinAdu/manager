import { type NextRequest, NextResponse } from "next/server"
import { connectToDB } from "@/lib/mongoose"
import { requireRole } from "@/lib/auth-middleware"
import Sales from "@/lib/models/sales.models"
import { type IUser } from "@/lib/models/user.models"

export const GET = requireRole(["admin"])(async (request: NextRequest, _user: IUser) => {
  try {
    await connectToDB()

    const startDate = request.nextUrl.searchParams.get("startDate")
    const endDate = request.nextUrl.searchParams.get("endDate")
    const userId = request.nextUrl.searchParams.get("userId")

    const query: Record<string, unknown> = {}
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }
    if (userId) query.userId = userId

    const sales = await Sales.find(query).populate("userId", "name email").sort({ date: -1 })

    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
})

export const POST = requireRole(["admin"])(async (request: NextRequest, user: IUser) => {
  try {
    await connectToDB()

    const { amount, clientName, description } = await request.json()
    
    const parsedAmount = Number.parseFloat(amount)

    if (!user || !amount || !clientName || isNaN(parsedAmount)) {
      return NextResponse.json({ error: "Missing required fields or invalid amount" }, { status: 400 })
    }

    const sale = new Sales({
      userId: user._id,
      date: new Date(),
      amount: parsedAmount,
      clientName,
      description,
    })

    await sale.save()

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 })
  }
})

export const PUT = requireRole(["admin"])(async (request: NextRequest, _user: IUser) => {
  try {
    await connectToDB()

    const { id, amount, clientName, description } = await request.json()
    
    const parsedAmount = Number.parseFloat(amount)

    if (!id || !amount || !clientName || isNaN(parsedAmount)) {
      return NextResponse.json({ error: "Missing required fields or invalid amount" }, { status: 400 })
    }

    const sale = await Sales.findByIdAndUpdate(
      id,
      { amount: parsedAmount, clientName, description },
      { new: true }
    )

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    return NextResponse.json(sale)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update sale" }, { status: 500 })
  }
})

export const DELETE = requireRole(["admin"])(async (request: NextRequest, _user: IUser) => {
  try {
    await connectToDB()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Sale ID is required" }, { status: 400 })
    }

    const sale = await Sales.findByIdAndDelete(id)

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Sale deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete sale" }, { status: 500 })
  }
})
