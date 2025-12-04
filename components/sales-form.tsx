"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SalesFormProps {
  onSuccess: () => void
}

export function SalesForm({ onSuccess }: SalesFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const session = localStorage.getItem("userSession")
    const user = session ? JSON.parse(session) : null

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: formData.get("amount"),
          clientName: formData.get("clientName"),
          description: formData.get("description"),
        }),
      })

      if (response.ok) {
        e.currentTarget.reset()
        onSuccess()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to add sale")
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
        <CardTitle>Add Sale</CardTitle>
        <CardDescription>Record a new sales transaction</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input id="clientName" name="clientName" placeholder="e.g., ABC Corporation" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (GHS)</Label>
              <Input id="amount" name="amount" type="number" placeholder="0.00" step="0.01" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input id="description" name="description" placeholder="Add notes about this sale" />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Sale"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
