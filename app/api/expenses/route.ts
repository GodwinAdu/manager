import { type NextRequest, NextResponse } from "next/server"
import { connectToDB } from "@/lib/mongoose"
import { requireRole } from "@/lib/auth-middleware"
import Expense from "@/lib/models/expense.models"
import { type IUser } from "@/lib/models/user.models"

export const GET = requireRole(["admin"])(async (request: NextRequest, user: IUser) => {
    try {
        await connectToDB()

        const startDate = request.nextUrl.searchParams.get("startDate")
        const endDate = request.nextUrl.searchParams.get("endDate")
        const category = request.nextUrl.searchParams.get("category")

        const query: Record<string, unknown> = {}
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            }
        }
        if (category) query.category = category

        const expenses = await Expense.find(query).populate("userId", "name email").sort({ date: -1 })

        return NextResponse.json(expenses)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
    }
})

export const POST = requireRole(["admin"])(async (request: NextRequest, user: IUser) => {
    try {
        await connectToDB()

        const { amount, category, description } = await request.json()

        if (!amount || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const expense = new Expense({
            userId: user._id,
            date: new Date(),
            amount: Number.parseFloat(amount),
            category,
            description,
        })

        await expense.save()

        return NextResponse.json(expense, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
    }
})

export const PUT = requireRole(["admin"])(async (request: NextRequest, _user: IUser) => {
    try {
        await connectToDB()

        const { id, amount, category, description } = await request.json()
        
        const parsedAmount = Number.parseFloat(amount)

        if (!id || !amount || !category || isNaN(parsedAmount)) {
            return NextResponse.json({ error: "Missing required fields or invalid amount" }, { status: 400 })
        }

        const expense = await Expense.findByIdAndUpdate(
            id,
            { amount: parsedAmount, category, description },
            { new: true }
        )

        if (!expense) {
            return NextResponse.json({ error: "Expense not found" }, { status: 404 })
        }

        return NextResponse.json(expense)
    } catch (error) {
        return NextResponse.json({ error: "Failed to update expense" }, { status: 500 })
    }
})

export const DELETE = requireRole(["admin"])(async (request: NextRequest, _user: IUser) => {
    try {
        await connectToDB()

        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Expense ID is required" }, { status: 400 })
        }

        const expense = await Expense.findByIdAndDelete(id)

        if (!expense) {
            return NextResponse.json({ error: "Expense not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "Expense deleted successfully" })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 })
    }
})
