"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ExpenseFormProps {
    onSuccess: () => void
}

const categories = [
    "Rent",
    "Utilities",
    "Equipment",
    "Office Supplies",
    "Transportation",
    "Meals",
    "Marketing",
    "Maintenance",
    "Other",
]

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [category, setCategory] = useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const formData = new FormData(e.currentTarget)
        const session = localStorage.getItem("userSession")
        const user = session ? JSON.parse(session) : null

        try {
            const response = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: formData.get("amount"),
                    category: category || formData.get("category"),
                    description: formData.get("description"),
                }),
            })

            if (response.ok) {
                e.currentTarget.reset()
                setCategory("")
                onSuccess()
            } else {
                const data = await response.json()
                setError(data.error || "Failed to add expense")
            }
        } catch (err) {
            setError("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add Expense</CardTitle>
                <CardDescription>Record a new business expense</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (GHS)</Label>
                            <Input id="amount" name="amount" type="number" placeholder="0.00" step="0.01" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input id="description" name="description" placeholder="Add notes about this expense" />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Adding..." : "Add Expense"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
