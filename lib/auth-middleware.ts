import { NextRequest, NextResponse } from "next/server"
import { connectToDB } from "@/lib/mongoose"
import { verifyToken } from "@/lib/jwt"
import User, { type IUser } from "@/lib/models/user.models"

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const token = request.cookies.get("session")?.value

    if (!token) {
      return null
    }

    const sessionData = verifyToken(token)
    if (!sessionData) {
      return null
    }

    await connectToDB()
    
    const user = await User.findById(sessionData.userId).select("-password")
    return user
  } catch (error) {
    return null
  }
}

type AuthHandler = (request: NextRequest, user: IUser) => Promise<NextResponse>

export function requireAuth(handler: AuthHandler) {
  return async (request: NextRequest) => {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    
    return handler(request, user)
  }
}

export function requireRole(roles: string[]) {
  return function(handler: AuthHandler) {
    return async (request: NextRequest) => {
      const user = await getAuthenticatedUser(request)
      
      if (!user) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }
      
      if (!roles.includes(user.role)) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }
      
      return handler(request, user)
    }
  }
}