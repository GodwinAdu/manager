"use client"

import { useEffect, useState, useCallback } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts"

interface Analytics {
    summary: {
        totalSales: number
        totalExpenses: number
        profit: number
        profitMargin: string
        totalPayroll: number
        presentCount: number
        absentCount: number
        lateCount: number
    }
    salesByDay: Array<{ day: string; amount: number }>
    expensesByCategory: Array<{ category: string; amount: number }>
}



export default function ReportsPage() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [startDate, setStartDate] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    )
    const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])



    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/analytics?startDate=${startDate}&endDate=${endDate}`)
            if (response.ok) {
                const data = await response.json()
                setAnalytics(data)
            }
        } catch (error) {
            console.error("Failed to fetch analytics", error)
        } finally {
            setIsLoading(false)
        }
    }, [startDate, endDate])

    useEffect(() => {
        fetchAnalytics()
    }, [fetchAnalytics])

    const COLORS = ["#4CAF50", "#FF6B6B", "#FFC107", "#2196F3", "#9C27B0"]

    return (
        <div className="flex">
            <SidebarNav />
            <div className="flex-1">
                <DashboardHeader />
                <main className="p-4 lg:p-6 space-y-4 lg:space-y-6 pt-20 lg:pt-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                        <div>
                            <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Financial Reports</h2>
                            <p className="text-slate-600 text-sm lg:text-base">Comprehensive profit/loss analysis and business insights</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div>
                                <Label htmlFor="start-date">From</Label>
                                <Input
                                    id="start-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="end-date">To</Label>
                                <Input
                                    id="end-date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={fetchAnalytics} disabled={isLoading} className="modern-button w-full sm:w-auto">
                                    {isLoading ? "Loading..." : "Generate Report"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {analytics && (
                        <>
                            {/* Profit/Loss Alert */}
                            <div className={`p-4 rounded-xl border-2 ${analytics?.summary.profit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${analytics?.summary.profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={analytics?.summary.profit >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-bold ${analytics?.summary.profit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                                            {analytics?.summary.profit >= 0 ? '🎉 Making Profit!' : '⚠️ Running at Loss!'}
                                        </h3>
                                        <p className={`text-sm ${analytics?.summary.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                            {analytics?.summary.profit >= 0 
                                                ? `Your business is profitable with GHS ${analytics.summary.profit.toLocaleString()} net profit`
                                                : `Your business is losing GHS ${Math.abs(analytics.summary.profit).toLocaleString()}. Review expenses immediately.`
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                        GHS {analytics.summary.totalSales.toLocaleString()}
                                    </div>
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
                                        GHS {analytics.summary.totalExpenses.toLocaleString()}
                                    </div>
                                </div>

                                <div className="stat-card rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-2 rounded-lg ${analytics.summary.profit >= 0 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={analytics.summary.profit >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                                            </svg>
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${analytics.summary.profit >= 0 ? 'text-blue-600 bg-blue-100' : 'text-red-600 bg-red-100'}`}>
                                            {analytics.summary.profitMargin}%
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium text-slate-600 mb-2">Net Profit</h3>
                                    <div className={`text-2xl lg:text-3xl font-bold ${analytics.summary.profit >= 0 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent' : 'bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent'}`}>
                                        GHS {analytics.summary.profit.toLocaleString()}
                                    </div>
                                </div>

                                <div className="stat-card rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Payroll</span>
                                    </div>
                                    <h3 className="text-sm font-medium text-slate-600 mb-2">Total Payroll</h3>
                                    <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                                        GHS {analytics.summary.totalPayroll.toLocaleString()}
                                    </div>
                                </div>
                            </div>



                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="gradient-card rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800">Sales Trend</h3>
                                            <p className="text-sm text-slate-600">Daily sales over selected period</p>
                                        </div>
                                    </div>
                                    {analytics.salesByDay.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={analytics.salesByDay}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                                                <YAxis stroke="#64748b" fontSize={12} />
                                                <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[300px] flex items-center justify-center text-slate-500">
                                            No sales data available for this period
                                        </div>
                                    )}
                                </div>

                                <div className="gradient-card rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800">Expenses by Category</h3>
                                            <p className="text-sm text-slate-600">Distribution of expenses</p>
                                        </div>
                                    </div>
                                    {analytics.expensesByCategory.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={analytics.expensesByCategory}
                                                    dataKey="amount"
                                                    nameKey="category"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {analytics.expensesByCategory.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value: any) => [`GHS ${value.toLocaleString()}`, 'Amount']} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[300px] flex items-center justify-center text-slate-500">
                                            No expense data available for this period
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Present</span>
                                                <span className="font-semibold text-primary">{analytics.summary.presentCount}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Absent</span>
                                                <span className="font-semibold text-destructive">{analytics.summary.absentCount}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Late</span>
                                                <span className="font-semibold text-yellow-600">{analytics.summary.lateCount}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Financial Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Operating Expense Ratio</p>
                                                <p className="text-lg font-semibold">
                                                    {analytics.summary.totalSales > 0
                                                        ? ((analytics.summary.totalExpenses / analytics.summary.totalSales) * 100).toFixed(1)
                                                        : 0}
                                                    %
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Payroll as % of Sales</p>
                                                <p className="text-lg font-semibold">
                                                    {analytics.summary.totalSales > 0
                                                        ? ((analytics.summary.totalPayroll / analytics.summary.totalSales) * 100).toFixed(1)
                                                        : 0}
                                                    %
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Key Metrics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Profit Margin</p>
                                                <p className="text-lg font-semibold">{analytics.summary.profitMargin}%</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Net Result</p>
                                                <p
                                                    className={`text-lg font-semibold ${analytics.summary.profit >= 0 ? "text-primary" : "text-destructive"
                                                        }`}
                                                >
                                                    {analytics.summary.profit >= 0 ? "+" : "-"}GHS
                                                    {Math.abs(analytics.summary.profit).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}
