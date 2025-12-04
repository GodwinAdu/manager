"use client"

import { useEffect, useState } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface User {
  _id: string
  id?: string
  name: string
  email: string
  role: string
  status: string
}

interface AttendanceRecord {
  _id: string
  odbc_id?: string
  userId: User | string
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: "present" | "absent" | "late"
  workingHours: number
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [workers, setWorkers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(false)

  const fetchCurrentUser = async () => {
    try {
      const session = localStorage.getItem("userSession")
      if (session) {
        const user = JSON.parse(session)
        setCurrentUser(user)
      }
    } catch (error) {
      console.error("Failed to get current user", error)
    }
  }

  const fetchWorkers = async () => {
    try {
      const response = await fetch("/api/users?status=active")
      if (response.ok) {
        const data = await response.json()
        setWorkers(data)
      }
    } catch (error) {
      console.error("Failed to fetch workers", error)
    }
  }

  const fetchAttendance = async (date: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/attendance?date=${date}`)
      if (response.ok) {
        const data = await response.json()
        setAttendance(data)
      }
    } catch (error) {
      console.error("Failed to fetch attendance", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
    fetchWorkers()
    fetchAttendance(selectedDate)
  }, [selectedDate])

  const handleCheckIn = async (userId?: string) => {
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "check-in", date: selectedDate }),
      })
      if (response.ok) {
        fetchAttendance(selectedDate)
      }
    } catch (error) {
      console.error("Check-in failed", error)
    }
  }

  const handleCheckOut = async (userId?: string) => {
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "check-out", date: selectedDate }),
      })
      if (response.ok) {
        fetchAttendance(selectedDate)
      }
    } catch (error) {
      console.error("Check-out failed", error)
    }
  }

  const handleMarkAbsent = async (userId: string) => {
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "mark-absent", date: selectedDate }),
      })
      if (response.ok) {
        fetchAttendance(selectedDate)
      }
    } catch (error) {
      console.error("Mark absent failed", error)
    }
  }

  const getAttendanceList = () => {
    if (currentUser?.role === "worker") {
      // For workers, show only their own attendance
      const userAttendance = attendance.find(a => {
        const userId = typeof a.userId === "object" ? a.userId._id : a.userId
        return userId === (currentUser.id || currentUser._id)
      })
      if (userAttendance) {
        return [userAttendance]
      }
      // Return placeholder if no attendance record
      return [{
        _id: `temp-${currentUser.id || currentUser._id}`,
        userId: currentUser,
        date: selectedDate,
        status: "absent" as const,
        workingHours: 0,
      }]
    }
    
    // For admins, show all workers
    const attendanceMap = new Map(attendance.map((a) => {
      const userId = typeof a.userId === "object" ? a.userId._id : a.userId
      return [userId, a]
    }))
    return workers.map((worker) => {
      const record = attendanceMap.get(worker._id)
      if (record) {
        return record
      }
      return {
        _id: `temp-${worker._id}`,
        userId: worker,
        date: selectedDate,
        status: "absent" as const,
        workingHours: 0,
      }
    })
  }

  const attendanceList = getAttendanceList()
  const presentCount = attendance.filter((a) => a.status === "present" || a.status === "late").length
  const absentCount = currentUser?.role === "worker" ? (presentCount > 0 ? 0 : 1) : workers.length - presentCount

  return (
    <div className="flex">
      <SidebarNav />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-4 lg:p-6 space-y-4 lg:space-y-6 pt-20 lg:pt-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold">
                {currentUser?.role === "worker" ? "My Attendance" : "Attendance Management"}
              </h2>
              <p className="text-muted-foreground text-sm lg:text-base">
                {currentUser?.role === "worker" ? "Track your check-ins and check-outs" : "Track employee check-ins and check-outs"}
              </p>
            </div>
            <div className="flex gap-4">
              <div>
                <Label htmlFor="date-filter" className="text-sm">Select Date</Label>
                <Input
                  id="date-filter"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  {currentUser?.role === "worker" ? "My Status" : "Total Users"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold">
                  {currentUser?.role === "worker" ? (presentCount > 0 ? "Present" : "Absent") : workers.length}
                </div>
              </CardContent>
            </Card>

            {currentUser?.role === "admin" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl lg:text-3xl font-bold text-primary">{presentCount}</div>
                </CardContent>
              </Card>
            )}

            {currentUser?.role === "admin" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Absent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl lg:text-3xl font-bold text-destructive">{absentCount}</div>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (currentUser?.role === "admin" && workers.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active users found. Add users from the Users page first.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Employee</TableHead>
                        <TableHead className="min-w-[80px]">Status</TableHead>
                        <TableHead className="min-w-[100px]">Check-In</TableHead>
                        <TableHead className="min-w-[100px]">Check-Out</TableHead>
                        <TableHead className="min-w-[100px]">Hours</TableHead>
                        <TableHead className="min-w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {attendanceList.map((record) => {
                      const hasCheckIn = !!record.checkInTime
                      const hasCheckOut = !!record.checkOutTime
                      const userId = typeof record.userId === "object" ? record.userId._id : record.userId

                      return (
                        <TableRow key={record._id}>
                          <TableCell className="font-medium">
                            {typeof record.userId === "object" ? record.userId?.name : "Unknown"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                record.status === "present"
                                  ? "bg-green-100 text-green-800"
                                  : record.status === "late"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : "-"}
                          </TableCell>
                          <TableCell>
                            {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : "-"}
                          </TableCell>
                          <TableCell>{record.workingHours?.toFixed(2) || "0.00"} hrs</TableCell>
                          <TableCell>
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                              {!hasCheckIn && (
                                <>
                                  <Button size="sm" onClick={() => handleCheckIn(currentUser?.role === "worker" ? undefined : typeof userId === "string" ? userId : undefined)} className="text-xs">
                                    Check In
                                  </Button>
                                  {currentUser?.role === "admin" && (
                                    <Button size="sm" variant="outline" onClick={() => handleMarkAbsent(typeof userId === "string" ? userId : "")} className="text-xs">
                                      Absent
                                    </Button>
                                  )}
                                </>
                              )}
                              {hasCheckIn && !hasCheckOut && (
                                <Button size="sm" variant="outline" onClick={() => handleCheckOut(currentUser?.role === "worker" ? undefined : typeof userId === "string" ? userId : undefined)} className="text-xs">
                                  Check Out
                                </Button>
                              )}
                              {hasCheckIn && hasCheckOut && (
                                <span className="text-xs text-muted-foreground">Completed</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
