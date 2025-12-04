"use client"

import { useEffect, useState } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Analytics {
  summary: {
    profit: number
  }
}

interface Allocation {
  allocations: AllocationItem[]
}

interface AllocationItem {
  category: string
  amount: number
  description: string
}

export default function ProfitAllocationPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split("T")[0].slice(0, 7))
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [allocation, setAllocation] = useState<Allocation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [allocations, setAllocations] = useState<AllocationItem[]>([
    { category: "", amount: 0, description: "" }
  ])

  const fetchData = async (month: string) => {
    setIsLoading(true)
    try {
      // Fetch analytics
      const startDate = new Date(month + "-01")
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      const analyticsResponse = await fetch(`/api/analytics?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`)
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData)
      }

      // Fetch existing allocation
      const allocationResponse = await fetch(`/api/profit-allocation?month=${month}`)
      if (allocationResponse.ok) {
        const allocationData = await allocationResponse.json()
        if (allocationData.allocation) {
          setAllocation(allocationData.allocation)
          setAllocations(allocationData.allocation.allocations || [{ category: "", amount: 0, description: "" }])
        }
      }
    } catch (error) {
      console.error("Failed to fetch data", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addAllocation = () => {
    setAllocations([...allocations, { category: "", amount: 0, description: "" }])
  }

  const updateAllocation = (index: number, field: keyof AllocationItem, value: string | number) => {
    const updated = [...allocations]
    updated[index] = { ...updated[index], [field]: value }
    setAllocations(updated)
  }

  const removeAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!analytics) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/profit-allocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: selectedMonth,
          totalProfit: analytics.summary.profit,
          savingsAmount: 0, // Will be updated from savings page
          savingsPercentage: 0,
          allocations: allocations.filter(a => a.category && a.amount > 0),
        }),
      })

      if (response.ok) {
        fetchData(selectedMonth)
        alert("Allocation saved successfully!")
      }
    } catch (error) {
      console.error("Failed to save", error)
      alert("Failed to save allocation")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData(selectedMonth)
  }, [selectedMonth])

  const totalAllocated = allocations.reduce((sum, a) => sum + (a.amount || 0), 0)
  const currentProfit = analytics?.summary?.profit || 0
  const remaining = currentProfit - totalAllocated

  return (
    <div className="flex">
      <SidebarNav />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-4 lg:p-6 space-y-4 lg:space-y-6 pt-20 lg:pt-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold">Profit Allocation</h2>
              <p className="text-muted-foreground text-sm lg:text-base">Track how net profit is used</p>
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
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-blue-600">
                  GHS {currentProfit.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-orange-600">
                  GHS {totalAllocated.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl lg:text-3xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  GHS {remaining.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profit Allocations</CardTitle>
              <CardDescription>Track how profit is distributed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {allocations.map((allocation, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={allocation.category}
                      onValueChange={(value) => updateAllocation(index, 'category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equipment">Equipment & Machinery</SelectItem>
                        <SelectItem value="inventory">Inventory & Stock</SelectItem>
                        <SelectItem value="marketing">Marketing & Advertising</SelectItem>
                        <SelectItem value="training">Staff Training & Development</SelectItem>
                        <SelectItem value="maintenance">Maintenance & Repairs</SelectItem>
                        <SelectItem value="technology">Technology & Software</SelectItem>
                        <SelectItem value="expansion">Business Expansion</SelectItem>
                        <SelectItem value="emergency">Emergency Reserve Fund</SelectItem>
                        <SelectItem value="debt">Debt Repayment</SelectItem>
                        <SelectItem value="taxes">Tax Provisions</SelectItem>
                        <SelectItem value="insurance">Insurance & Legal</SelectItem>
                        <SelectItem value="research">Research & Development</SelectItem>
                        <SelectItem value="facility">Facility Improvements</SelectItem>
                        <SelectItem value="bonus">Employee Bonuses</SelectItem>
                        <SelectItem value="dividend">Owner Dividend</SelectItem>
                        <SelectItem value="investment">External Investments</SelectItem>
                        <SelectItem value="charity">Charity & CSR</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Amount (GHS)</Label>
                    <Input
                      type="number"
                      value={allocation.amount}
                      onChange={(e) => updateAllocation(index, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Input
                      value={allocation.description}
                      onChange={(e) => updateAllocation(index, 'description', e.target.value)}
                      placeholder="Optional description"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeAllocation(index)}
                      disabled={allocations.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex gap-4">
                <Button variant="outline" onClick={addAllocation}>
                  Add Allocation
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Allocations"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}