"use client"

import { useEffect, useState } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Savings {
  _id: string
  month: string
  totalRevenue: number
  savingsPercentage: number
  savingsAmount: number
  notes?: string
}

interface Analytics {
  summary: {
    profit: number
  }
}

export default function SavingsPage() {
  const [savings, setSavings] = useState<Savings | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split("T")[0].slice(0, 7))
  const [isLoading, setIsLoading] = useState(false)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [formData, setFormData] = useState({
    savingsPercentage: "10",
    notes: "",
  })

  const fetchSavings = async (month: string) => {
    setIsLoading(true)
    try {
      // Fetch savings data
      const savingsResponse = await fetch(`/api/savings?month=${month}`)
      if (savingsResponse.ok) {
        const savingsData = await savingsResponse.json()
        setSavings(savingsData.savings)
        if (savingsData.savings) {
          setFormData({
            savingsPercentage: savingsData.savings.savingsPercentage.toString(),
            notes: savingsData.savings.notes || "",
          })
        } else {
          setFormData({
            savingsPercentage: "10",
            notes: "",
          })
        }
      }

      // Fetch analytics data for the month
      const startDate = new Date(month + "-01")
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      const analyticsResponse = await fetch(`/api/analytics?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`)
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData)
      }
    } catch (error) {
      console.error("Failed to fetch data", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: selectedMonth,
          totalRevenue: analytics?.summary?.profit || 0,
          savingsPercentage: parseFloat(formData.savingsPercentage),
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        fetchSavings(selectedMonth)
        alert("Savings updated successfully!")
      } else {
        alert("Failed to update savings")
      }
    } catch (error) {
      console.error("Failed to save", error)
      alert("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSavings(selectedMonth)
  }, [selectedMonth])

  const currentProfit = analytics?.summary?.profit || 0
  const savingsAmount = currentProfit * (parseFloat(formData.savingsPercentage) || 0) / 100

  return (
    <div className="flex">
      <SidebarNav />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-4 lg:p-6 space-y-4 lg:space-y-6 pt-20 lg:pt-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold">Company Savings</h2>
              <p className="text-muted-foreground text-sm lg:text-base">Manage monthly savings and reserves</p>
            </div>
            <div>
              <Label htmlFor="month-select" className="text-sm">Month</Label>
              <Input
                id="month-select"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Revenue</span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Net Profit</h3>
              <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                GHS {currentProfit.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-2">Available for savings</p>
            </div>

            <div className="stat-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {savings?.savingsPercentage || 0}%
                </span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Savings Amount</h3>
              <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                GHS {savings?.savingsAmount.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-slate-500 mt-2">Reserved funds</p>
            </div>

            <div className="stat-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Target</span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Savings Rate</h3>
              <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                {savings?.savingsPercentage || 0}%
              </div>
              <p className="text-xs text-slate-500 mt-2">Of total revenue</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="gradient-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Update Savings</h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-800">Net Profit Available:</span>
                    <span className="text-lg font-bold text-blue-800">
                      GHS {currentProfit.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">After deducting expenses and payroll</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="percentage">Savings Percentage (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.savingsPercentage}
                    onChange={(e) => setFormData({ ...formData, savingsPercentage: e.target.value })}
                    placeholder="Enter savings percentage"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any notes about this month's savings"
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Calculated Savings:</span>
                      <span className="text-lg font-bold text-green-600">
                        GHS {savingsAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-yellow-800">Remaining for Other Uses:</span>
                      <span className="text-lg font-bold text-yellow-800">
                        GHS {(currentProfit - savingsAmount).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-yellow-600 mt-1">Available for business support, investments, etc.</p>
                  </div>
                </div>

                <Button type="submit" className="w-full modern-button" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Update Savings"}
                </Button>
                
                <div className="pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/profit-allocation'}
                  >
                    Track Profit Usage
                  </Button>
                </div>
              </form>
            </div>

            <div className="gradient-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Savings Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Month:</span>
                  <span className="font-medium">
                    {new Date(selectedMonth).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Net Profit:</span>
                  <span className="font-medium text-blue-600">
                    GHS {currentProfit.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Savings Rate:</span>
                  <span className="font-medium text-purple-600">
                    {savings?.savingsPercentage || 0}%
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm text-green-700 font-medium">Amount Saved:</span>
                  <span className="font-bold text-green-700">
                    GHS {savings?.savingsAmount.toLocaleString() || "0"}
                  </span>
                </div>

                {savings?.notes && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600 block mb-1">Notes:</span>
                    <p className="text-sm text-slate-800">{savings.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}