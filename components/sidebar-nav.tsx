"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { BarChart3, Users, Clock, ShoppingCart, DollarSign, FileText, LogOut, Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/attendance", label: "Attendance", icon: Clock },
    { href: "/sales", label: "Sales", icon: ShoppingCart },
    { href: "/expenses", label: "Expenses", icon: DollarSign },
    { href: "/payroll", label: "Payroll", icon: FileText },
    { href: "/savings", label: "Savings", icon: DollarSign },
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/users", label: "Users", icon: Users },
    { href: "/profile", label: "Profile", icon: User },
]

interface NavContentProps {
    pathname: string
    setIsMobileMenuOpen: (open: boolean) => void
    handleLogout: () => void
}

function NavContent({ pathname, setIsMobileMenuOpen, handleLogout }: NavContentProps) {
    return (
        <>
            <div className="px-6 py-8 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">BizTracker Pro</h1>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden text-white hover:bg-white/10"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                                isActive
                                    ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border-r-2 border-blue-400"
                                    : "text-white/80 hover:bg-white/10 hover:text-white",
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </div>

            <div className="px-4 py-6 border-t border-white/10">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-all duration-300"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </>
    )
}

export function SidebarNav() {
    const pathname = usePathname()
    const router = useRouter()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            localStorage.removeItem('userSession')
            router.push('/')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <>
            {/* Mobile Menu Button */}
            {!isMobileMenuOpen && (
                <div className="lg:hidden fixed top-4 left-4 z-50">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm hover:bg-card"
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>
            )}

            {/* Desktop Sidebar */}
            <nav className="hidden lg:flex w-64 sidebar-modern text-white min-h-screen flex-col">
                <NavContent pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen} handleLogout={handleLogout} />
            </nav>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <nav className="absolute left-0 top-0 w-72 sidebar-modern text-white min-h-screen flex flex-col shadow-2xl">
                        <NavContent pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen} handleLogout={handleLogout} />
                    </nav>
                </div>
            )}
        </>
    )
}
