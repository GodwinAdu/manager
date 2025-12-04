"use client"

import { useEffect, useState } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PayrollRecord {
    _id: string
    userId: any
    month: string
    baseSalary: number
    daysWorked: number
    workingDays: number
    serviceCharge: number
    totalPayable: number
    status: "pending" | "processed" | "paid"
}

export default function PayrollPage() {
    const [payroll, setPayroll] = useState<PayrollRecord[]>([])
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split("T")[0].slice(0, 7))
    const [isLoading, setIsLoading] = useState(false)
    const [totalPayable, setTotalPayable] = useState(0)

    const fetchPayroll = async (month: string) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/payroll?month=${month}`)
            if (response.ok) {
                const data = await response.json()
                setPayroll(data)
                setTotalPayable(data.reduce((sum: number, p: PayrollRecord) => sum + p.totalPayable, 0))
            }
        } catch (error) {
            console.error("Failed to fetch payroll", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleBulkProcess = async () => {
        if (!confirm("Are you sure you want to process payroll for all workers?")) return

        setIsLoading(true)
        try {
            const response = await fetch("/api/payroll/bulk-process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            })
            if (response.ok) {
                const data = await response.json()
                alert(data.message)
                fetchPayroll(selectedMonth)
            }
        } catch (error) {
            console.error("Bulk process failed", error)
            alert("Failed to process payroll")
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateStatus = async (payrollId: string, newStatus: string) => {
        try {
            const response = await fetch("/api/payroll", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payrollId, status: newStatus }),
            })
            if (response.ok) {
                fetchPayroll(selectedMonth)
            }
        } catch (error) {
            console.error("Update failed", error)
        }
    }

    const handleDeletePayroll = async (payrollId: string) => {
        if (!confirm("Are you sure you want to delete this payroll record?")) return
        
        try {
            const response = await fetch(`/api/payroll?id=${payrollId}`, {
                method: "DELETE",
            })
            if (response.ok) {
                fetchPayroll(selectedMonth)
            }
        } catch (error) {
            console.error("Delete failed", error)
        }
    }

    useEffect(() => {
        fetchPayroll(selectedMonth)
    }, [selectedMonth])

    return (
        <div className="flex">
            <SidebarNav />
            <div className="flex-1">
                <DashboardHeader />
                <main className="p-4 lg:p-6 space-y-4 lg:space-y-6 pt-20 lg:pt-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                        <div>
                            <h2 className="text-xl lg:text-2xl font-bold">Payroll Management</h2>
                            <p className="text-muted-foreground text-sm lg:text-base">Process and track employee salaries</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
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
                            <div className="flex items-end">
                                <Button onClick={handleBulkProcess} disabled={isLoading} className="w-full sm:w-auto">
                                    {isLoading ? "Processing..." : "Process All"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Total Payable</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl lg:text-3xl font-bold text-primary">GHS {totalPayable.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mt-2">This month</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Processed</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl lg:text-3xl font-bold">{payroll.filter((p) => p.status === "processed").length}</div>
                                <p className="text-xs text-muted-foreground mt-2">Employees</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl lg:text-3xl font-bold text-accent">
                                    {payroll.filter((p) => p.status === "paid").length}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">Employees</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payroll Records</CardTitle>
                            <CardDescription>
                                {new Date(selectedMonth).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : payroll.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No payroll records for this month</div>
                            ) : (
                                <>
                                    <div className="lg:hidden space-y-3">
                                        {payroll.map((record) => (
                                            <div key={record._id} className="bg-card border rounded-lg p-3">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-sm">{record.userId?.name || "Unknown"}</h3>
                                                        <p className="text-xs text-muted-foreground">Base: GHS {record.baseSalary.toLocaleString()}</p>
                                                    </div>
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-medium ${record.status === "paid"
                                                                ? "bg-green-100 text-green-800"
                                                                : record.status === "processed"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : "bg-yellow-100 text-yellow-800"
                                                            }`}
                                                    >
                                                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                    </span>
                                                </div>
                                                
                                                <div className="text-xs mb-2">
                                                    <span className="text-muted-foreground">Charge: </span>
                                                    <span>GHS {record.serviceCharge.toLocaleString()}</span>
                                                </div>
                                                
                                                <div className="flex justify-between items-center">
                                                    <div className="text-sm font-semibold text-primary">
                                                        Total: GHS {record.totalPayable.toLocaleString()}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <select
                                                            value={record.status}
                                                            onChange={(e) => handleUpdateStatus(record._id, e.target.value)}
                                                            className="text-xs border border-border rounded px-2 py-1 bg-background"
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="processed">Processed</option>
                                                            <option value="paid">Paid</option>
                                                        </select>
                                                        <button
                                                            onClick={() => handleDeletePayroll(record._id)}
                                                            className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                                        >
                                                            Del
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="hidden lg:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Employee</TableHead>
                                                    <TableHead>Base Salary</TableHead>
                                                    <TableHead>Charge</TableHead>
                                                    <TableHead>Total</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {payroll.map((record) => (
                                                    <TableRow key={record._id}>
                                                        <TableCell className="font-medium">{record.userId?.name || "Unknown"}</TableCell>
                                                        <TableCell>GHS {record.baseSalary.toLocaleString()}</TableCell>
                                                        <TableCell>GHS {record.serviceCharge.toLocaleString()}</TableCell>
                                                        <TableCell className="font-semibold text-primary">
                                                            GHS {record.totalPayable.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-xs font-medium ${record.status === "paid"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : record.status === "processed"
                                                                            ? "bg-blue-100 text-blue-800"
                                                                            : "bg-yellow-100 text-yellow-800"
                                                                    }`}
                                                            >
                                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <select
                                                                    value={record.status}
                                                                    onChange={(e) => handleUpdateStatus(record._id, e.target.value)}
                                                                    className="text-sm border border-border rounded px-2 py-1 bg-background"
                                                                >
                                                                    <option value="pending">Pending</option>
                                                                    <option value="processed">Processed</option>
                                                                    <option value="paid">Paid</option>
                                                                </select>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => handleDeletePayroll(record._id)}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {payroll.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Export Payroll</CardTitle>
                                <CardDescription>Download payroll data for records</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const csv =
                                            "Employee,Base Salary,Service Charge,Total Payable,Status\n" +
                                            payroll
                                                .map(
                                                    (p) =>
                                                        `${p.userId?.name},${p.baseSalary},${p.serviceCharge},${p.totalPayable},${p.status}`,
                                                )
                                                .join("\n")

                                        const blob = new Blob([csv], { type: "text/csv" })
                                        const url = URL.createObjectURL(blob)
                                        const a = document.createElement("a")
                                        a.href = url
                                        a.download = `payroll-${selectedMonth}.csv`
                                        a.click()
                                    }}
                                >
                                    Export as CSV
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>
        </div>
    )
}
