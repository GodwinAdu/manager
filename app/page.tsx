"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Building2, TrendingUp, Users, BarChart3 } from "lucide-react"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("userSession", JSON.stringify(data.user))
        router.push("/dashboard")
      } else {
        const data = await response.json()
        setError(data.error || "Invalid credentials. Please try again.")
      }
    } catch (err) {
      setError("Connection error. Please check your internet connection.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      if (response.ok) {
        setSuccess("Account created successfully! Please sign in to continue.")
        setError("")
        setTimeout(() => {
          const loginTab = document.querySelector('[value="login"]') as HTMLElement
          loginTab?.click()
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || "Registration failed. Please try again.")
      }
    } catch (err) {
      setError("Connection error. Please check your internet connection.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">BizTracker Pro</h1>
              <p className="text-blue-100">Business Management Platform</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Streamline Your Business Operations
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Comprehensive business management solution for sales tracking, expense management, payroll processing, and analytics.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-200" />
            <p className="text-sm text-blue-100">Sales Analytics</p>
          </div>
          <div className="text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-200" />
            <p className="text-sm text-blue-100">Team Management</p>
          </div>
          <div className="text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-200" />
            <p className="text-sm text-blue-100">Financial Reports</p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-8">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <Building2 className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">BizTracker Pro</span>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sign in to access your business dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Create Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Email Address
                    </Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="Enter your email" 
                      className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        name="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter your password" 
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10" 
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg">
                      {success}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      Full Name
                    </Label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="Enter your full name" 
                      className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-gray-700 font-medium">
                      Email Address
                    </Label>
                    <Input 
                      id="reg-email" 
                      name="email" 
                      type="email" 
                      placeholder="Enter your email" 
                      className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input 
                        id="reg-password" 
                        name="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Create a password (min. 6 characters)" 
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10" 
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
