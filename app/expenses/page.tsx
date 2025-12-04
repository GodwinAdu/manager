"use client"

import { useEffect, useState } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpenseForm } from "@/components/expense-form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2 } from "lucide-react"

interface User {
    _id: string
    name: string
    email: string
}

interface Expense {
    _id: string
    userId: User
    date: string
    amount: number
    category: string
    description: string
}

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [totalExpenses, setTotalExpenses] = useState(0)
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editCategory, setEditCategory] = useState("")

    const fetchExpenses = async () => {
        setIsLoading(true)
        try {
            const today = new Date()
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

            const response = await fetch(`/api/expenses?startDate=${firstDay.toISOString()}&endDate=${lastDay.toISOString()}`)
            if (response.ok) {
                const data = await response.json()
                setExpenses(data)
                setTotalExpenses(data.reduce((sum: number, e: Expense) => sum + e.amount, 0))
            }
        } catch (error) {
            console.error("Failed to fetch expenses", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense)
        setEditCategory(expense.category)
        setIsEditDialogOpen(true)
    }

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editingExpense) return

        const formData = new FormData(e.currentTarget)
        const amount = formData.get("amount") as string
        const description = formData.get("description") as string

        try {
            const response = await fetch("/api/expenses", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingExpense._id,
                    amount: parseFloat(amount),
                    category: editCategory,
                    description,
                }),
            })

            if (response.ok) {
                setIsEditDialogOpen(false)
                setEditingExpense(null)
                fetchExpenses()
            }
        } catch (error) {
            console.error("Failed to update expense", error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this expense?")) return

        try {
            const response = await fetch(`/api/expenses?id=${id}`, {
                method: "DELETE",
            })

            if (response.ok) {
                fetchExpenses()
            }
        } catch (error) {
            console.error("Failed to delete expense", error)
        }
    }

    useEffect(() => {
        fetchExpenses()
    }, [])

    return (
        <div className="flex">
            <SidebarNav />
            <div className="flex-1">
                <DashboardHeader />
                <main className="p-4 lg:p-6 space-y-4 lg:space-y-6 pt-20 lg:pt-6">
                    <div>
                        <h2 className="text-xl lg:text-2xl font-bold">Expense Management</h2>
                        <p className="text-muted-foreground text-sm lg:text-base">Track all business expenses this month</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl lg:text-3xl font-bold text-destructive">GHS {totalExpenses.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mt-2">This month</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Records</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl lg:text-3xl font-bold">{expenses.length}</div>
                                <p className="text-xs text-muted-foreground mt-2">Total expenses</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl lg:text-3xl font-bold">
                                    GHS {(totalExpenses / (expenses.length || 1)).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">Per transaction</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                        <ExpenseForm onSuccess={fetchExpenses} />

                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Expenses</CardTitle>
                                    <CardDescription>Latest expense transactions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="text-center py-8">Loading...</div>
                                    ) : expenses.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">No expense records yet</div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="min-w-[100px]">Category</TableHead>
                                                        <TableHead className="min-w-[80px]">Amount</TableHead>
                                                        <TableHead className="min-w-[80px]">Date</TableHead>
                                                        <TableHead className="min-w-[120px]">Description</TableHead>
                                                        <TableHead className="min-w-[100px]">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {expenses.slice(0, 10).map((expense) => (
                                                        <TableRow key={expense._id}>
                                                            <TableCell className="font-medium text-sm">{expense.category}</TableCell>
                                                            <TableCell className="text-destructive font-semibold text-sm">
                                                                GHS {expense.amount.toLocaleString()}
                                                            </TableCell>
                                                            <TableCell className="text-sm">{new Date(expense.date).toLocaleDateString()}</TableCell>
                                                            <TableCell className="text-muted-foreground text-sm">{expense.description || "-"}</TableCell>
                                                            <TableCell>
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleEdit(expense)}
                                                                        className="h-8 w-8 p-0"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleDelete(expense._id)}
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
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Expense</DialogTitle>
                            </DialogHeader>
                            {editingExpense && (
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <div>
                                        <Label htmlFor="edit-category">Category</Label>
                                        <Select value={editCategory} onValueChange={setEditCategory}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                                                <SelectItem value="Marketing">Marketing</SelectItem>
                                                <SelectItem value="Travel">Travel</SelectItem>
                                                <SelectItem value="Utilities">Utilities</SelectItem>
                                                <SelectItem value="Equipment">Equipment</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-amount">Amount (GHS)</Label>
                                        <Input
                                            id="edit-amount"
                                            name="amount"
                                            type="number"
                                            step="0.01"
                                            defaultValue={editingExpense.amount}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-description">Description</Label>
                                        <Input
                                            id="edit-description"
                                            name="description"
                                            defaultValue={editingExpense.description}
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">Update Expense</Button>
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
