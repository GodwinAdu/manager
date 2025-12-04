import Attendance from "@/lib/models/attendance.models"
import Expense from "@/lib/models/expense.models"
import Payroll from "@/lib/models/payroll.models"
import Sale from "@/lib/models/sales.models"
import { connectToDB } from "@/lib/mongoose"
import { requireRole } from "@/lib/auth-middleware"
import { type NextRequest, NextResponse } from "next/server"

export const GET = requireRole(["admin"])(async (request: NextRequest, user: any) => {
    try {
        await connectToDB()

        const startDate = request.nextUrl.searchParams.get("startDate")
        const endDate = request.nextUrl.searchParams.get("endDate")

        let dateQuery = {}
        if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)
            dateQuery = {
                date: {
                    $gte: start,
                    $lte: end,
                }
            }
        }

        // Sales data
        const sales = await Sale.find(dateQuery)
        const totalSales = sales.reduce((sum: number, s: any) => sum + s.amount, 0)
        const salesByDay: Record<string, number> = {}
        sales.forEach((s: any) => {
            const day = s.date.toLocaleDateString()
            salesByDay[day] = (salesByDay[day] || 0) + s.amount
        })

        // Expenses data
        const expenses = await Expense.find(dateQuery)
        const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0)
        const expensesByCategory: Record<string, number> = {}
        const expensesByDay: Record<string, number> = {}
        expenses.forEach((e: any) => {
            expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount
            const day = e.date.toLocaleDateString()
            expensesByDay[day] = (expensesByDay[day] || 0) + e.amount
        })

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayEnd = new Date()
        todayEnd.setHours(23, 59, 59, 999)

        const todayAttendance = await Attendance.find({
            date: { $gte: today, $lte: todayEnd },
        })

        // All attendance records in date range
        const attendanceRecords = await Attendance.find(dateQuery)
        const presentCount = todayAttendance.filter((a: any) => a.status === "present" || a.status === "late").length
        const absentCount = todayAttendance.filter((a: any) => a.status === "absent").length
        const lateCount = todayAttendance.filter((a: any) => a.status === "late").length

        // Payroll data - use month field for payroll
        let payrollQuery = {}
        if (startDate && endDate) {
            payrollQuery = {
                month: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }
        }
        const payrollRecords = await Payroll.find(payrollQuery)
        const totalPayroll = payrollRecords.reduce((sum: number, p: any) => sum + p.totalPayable, 0)

        // Calculate profit (Sales - Expenses - Payroll)
        const profit = totalSales - totalExpenses - totalPayroll

        return NextResponse.json({
            summary: {
                totalSales,
                totalExpenses,
                profit,
                profitMargin: totalSales > 0 ? ((profit / totalSales) * 100).toFixed(2) : "0",
                totalPayroll,
                presentCount,
                absentCount,
                lateCount,
            },
            salesByDay: Object.entries(salesByDay)
                .map(([day, amount]) => ({ day, amount }))
                .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()),
            expensesByCategory: Object.entries(expensesByCategory).map(([category, amount]) => ({
                category,
                amount,
            })),
            expensesByDay: Object.entries(expensesByDay)
                .map(([day, amount]) => ({ day, amount }))
                .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()),
        })
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }
})
