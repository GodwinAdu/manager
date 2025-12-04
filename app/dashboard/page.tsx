"use client"

import { useEffect, useState } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

interface DashboardStats {
  totalSales: number
  totalExpenses: number
  employees: number
  presentToday: number
  profit: number
  currentSavings: number
  savingsPercentage: number
}

interface ChartData {
  day: string
  sales: number
  expenses: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalExpenses: 0,
    employees: 0,
    presentToday: 0,
    profit: 0,
    currentSavings: 0,
    savingsPercentage: 10,
  })
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        const endDate = new Date()

        const [analyticsResponse, usersResponse, savingsResponse] = await Promise.all([
          fetch(
            `/api/analytics?startDate=${startDate.toISOString().split("T")[0]}&endDate=${endDate.toISOString().split("T")[0]}`,
          ),
          fetch("/api/users?role=worker&status=active"),
          fetch(`/api/savings?month=${startDate.toISOString()}`),
        ])

        let employeeCount = 0
        if (usersResponse.ok) {
          const users = await usersResponse.json()
          employeeCount = users.length
        }

        let savingsPercentage = 10
        if (savingsResponse.ok) {
          const savingsData = await savingsResponse.json()
          if (savingsData.savings) {
            savingsPercentage = savingsData.savings.savingsPercentage
          }
        }

        if (analyticsResponse.ok) {
          const analytics = await analyticsResponse.json()

          const profit = analytics.summary.totalSales - analytics.summary.totalExpenses - analytics.summary.totalPayroll
          const currentSavings = profit > 0 ? (profit * savingsPercentage) / 100 : 0

          setStats({
            totalSales: Math.round(analytics.summary.totalSales),
            totalExpenses: Math.round(analytics.summary.totalExpenses),
            employees: employeeCount,
            presentToday: analytics.summary.presentCount,
            profit: Math.round(profit),
            currentSavings: Math.round(currentSavings),
            savingsPercentage,
          })

          // Combine sales and expenses data for chart
          const salesData = analytics.salesByDay || []
          const expensesData = analytics.expensesByDay || []
          
          // Create a map of all unique days
          const dayMap = new Map()
          
          salesData.forEach((item: any) => {
            const day = new Date(item.day).toLocaleDateString("en-US", { weekday: "short" })
            dayMap.set(item.day, { day, sales: item.amount, expenses: 0 })
          })
          
          expensesData.forEach((item: any) => {
            const day = new Date(item.day).toLocaleDateString("en-US", { weekday: "short" })
            if (dayMap.has(item.day)) {
              dayMap.get(item.day).expenses = item.amount
            } else {
              dayMap.set(item.day, { day, sales: 0, expenses: item.amount })
            }
          })
          
          const chartFromData = Array.from(dayMap.values())
            .sort((a, b) => new Date(Object.keys(dayMap).find(key => dayMap.get(key) === a) || '').getTime() - 
                           new Date(Object.keys(dayMap).find(key => dayMap.get(key) === b) || '').getTime())
            .slice(-7)
          
          setChartData(chartFromData)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="flex">
      <SidebarNav />
      <div className="flex-1 lg:ml-0">
        <DashboardHeader />
        <main className="p-4 lg:p-6 space-y-4 lg:space-y-6 pt-20 lg:pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stat-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Revenue</span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Total Sales</h3>
              <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                GHS {stats.totalSales.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-2">This month</p>
            </div>

            <div className="stat-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">Costs</span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Total Expenses</h3>
              <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                GHS {stats.totalExpenses.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-2">This month</p>
            </div>

            <div className="stat-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Active</span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Employees</h3>
              <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {stats.employees}
              </div>
              <p className="text-xs text-slate-500 mt-2">Total active workers</p>
            </div>

            <div className="stat-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Today</span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Present Today</h3>
              <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                {stats.presentToday}/{stats.employees || 0}
              </div>
              <p className="text-xs text-slate-500 mt-2">Attendance rate</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl lg:text-3xl font-bold ${stats.profit >= 0 ? "text-primary" : "text-destructive"}`}>
                  GHS {stats.profit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.profit >= 0 ? "+" : ""}
                  {stats.totalSales > 0 ? Math.round((stats.profit / stats.totalSales) * 100) : 0}% margin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Company Savings ({stats.savingsPercentage}%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">GHS {stats.currentSavings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-2">Reserved from revenue</p>
              </CardContent>
            </Card>
          </div>

          <div className="gradient-card rounded-xl">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Sales vs Expenses</h3>
              <p className="text-sm text-slate-600">Weekly comparison</p>
            </div>
            <div className="p-6">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#4CAF50" name="Sales" />
                    <Bar dataKey="expenses" fill="#FF6B6B" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500">
                  {isLoading ? "Loading chart..." : "No data available yet. Add some sales to see the chart."}
                </div>
              )}
            </div>
          </div>

          <div className="gradient-card rounded-xl">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Revenue Trend</h3>
              <p className="text-sm text-slate-600">Recent sales activity</p>
            </div>
            <div className="p-6">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#4CAF50" strokeWidth={2} name="Sales" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-500">
                  {isLoading ? "Loading chart..." : "No data available yet."}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
