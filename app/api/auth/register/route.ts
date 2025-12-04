import { type NextRequest, NextResponse } from "next/server"
import { connectToDB } from "@/lib/mongoose"
import User from "@/lib/models/user.models"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
    try {
        await connectToDB()

        const { name, email, password, phone } = await request.json()

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
        }

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 })
        }

        // Create new user
        const user = new User({
            name,
            email: email.toLowerCase(),
            password: hashPassword(password),
            phone,
            role: "worker",
        })

        await user.save()

        return NextResponse.json(
            {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 201 },
        )
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
