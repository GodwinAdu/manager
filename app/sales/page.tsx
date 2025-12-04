"use client"

import { useEffect, useState } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SalesForm } from "@/components/sales-form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Edit, Trash2 } from "lucide-react"

interface Sale {
  _id: string
  userId: any
  date: string
  amount: number
  clientName: string
  description: string
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalSales, setTotalSales] = useState(0)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])

  const fetchSales = async () => {
    setIsLoading(true)
    try {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)

      const response = await fetch(`/api/sales?startDate=${start.toISOString()}&endDate=${end.toISOString()}`)
      if (response.ok) {
        const data = await response.json()
        setSales(data)
        setTotalSales(data.reduce((sum: number, s: Sale) => sum + s.amount, 0))
      }
    } catch (error) {
      console.error("Failed to fetch sales", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale)
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingSale) return

    const formData = new FormData(e.currentTarget)
    const amount = formData.get("amount") as string
    const clientName = formData.get("clientName") as string
    const description = formData.get("description") as string

    try {
      const response = await fetch("/api/sales", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSale._id,
          amount: parseFloat(amount),
          clientName,
          description,
        }),
      })

      if (response.ok) {
        setIsEditDialogOpen(false)
        setEditingSale(null)
        fetchSales()
      }
    } catch (error) {
      console.error("Failed to update sale", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sale?")) return

    try {
      const response = await fetch(`/api/sales?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchSales()
      }
    } catch (error) {
      console.error("Failed to delete sale", error)
    }
  }

  useEffect(() => {
    fetchSales()
  }, [startDate, endDate])

  return (
    <div className="flex">
      <SidebarNav />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-4 lg:p-6 space-y-4 lg:space-y-6 pt-20 lg:pt-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold">Sales Management</h2>
              <p className="text-muted-foreground text-sm lg:text-base">Track all sales transactions</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <Label htmlFor="start-date" className="text-sm">From</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="text-sm">To</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                GHS {totalSales.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-2">{new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</p>
            </div>

            <div className="stat-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">{sales.length}</span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Transactions</h3>
              <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {sales.length}
              </div>
              <p className="text-xs text-slate-500 mt-2">Total records</p>
            </div>

            <div className="stat-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Avg</span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Average Sale</h3>
              <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                GHS {(totalSales / (sales.length || 1)).toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-slate-500 mt-2">Per transaction</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <SalesForm onSuccess={fetchSales} />

            <div className="lg:col-span-2">
              <div className="gradient-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Recent Sales</h3>
                    <p className="text-sm text-slate-600">Latest sales transactions</p>
                  </div>
                </div>
                {isLoading ? (
                  <div className="text-center py-8 text-slate-600">Loading...</div>
                ) : sales.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">No sales records yet</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200">
                          <TableHead className="min-w-[100px] text-slate-700 font-semibold">Client</TableHead>
                          <TableHead className="min-w-[80px] text-slate-700 font-semibold">Amount</TableHead>
                          <TableHead className="min-w-[80px] text-slate-700 font-semibold">Date</TableHead>
                          <TableHead className="min-w-[120px] text-slate-700 font-semibold">Description</TableHead>
                          <TableHead className="min-w-[100px] text-slate-700 font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sales.slice(0, 10).map((sale) => (
                          <TableRow key={sale._id} className="border-slate-100 hover:bg-slate-50">
                            <TableCell className="font-medium text-sm text-slate-800">{sale.clientName}</TableCell>
                            <TableCell className="font-bold text-sm text-green-600">
                              GHS {sale.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">{new Date(sale.date).toLocaleDateString()}</TableCell>
                            <TableCell className="text-slate-500 text-sm">{sale.description || "-"}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(sale)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(sale._id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Sale</DialogTitle>
              </DialogHeader>
              {editingSale && (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="edit-client">Client Name</Label>
                    <Input
                      id="edit-client"
                      name="clientName"
                      defaultValue={editingSale.clientName}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-amount">Amount (GHS)</Label>
                    <Input
                      id="edit-amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      defaultValue={editingSale.amount}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Input
                      id="edit-description"
                      name="description"
                      defaultValue={editingSale.description}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Update Sale</Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
