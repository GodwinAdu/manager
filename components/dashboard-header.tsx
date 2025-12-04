"use client"

import { useEffect, useState } from "react"

export function DashboardHeader() {
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const session = typeof window !== "undefined" ? localStorage.getItem("userSession") : null

    if (session) {
      try {
        const user = JSON.parse(session)
        setUserName(user.name)
      } catch (e) {
        setUserName("User")
      }
    }
  }, [])

  return (
    <header className="glass-card border-b border-white/20 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <div className="w-8 h-8" /> {/* Spacer for mobile menu button */}
          </div>
          <div>
            <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Welcome, {userName}
            </h1>
            <div className="text-xs text-slate-500 lg:hidden">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
          </div>
        </div>
        <div className="text-xs lg:text-sm text-slate-500 hidden lg:block">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>
    </header>
  )
}
