import  { Schema,models,model,Model, type Document } from "mongoose"

export interface IUser extends Document {
    _id:string
    name: string
    email: string
    password: string
    phone?: string
    role: "admin" | "worker"
    salary?: number
    payrollType?: "monthly_salary" | "daily_rate"
    dailyRate?: number
    status: "active" | "inactive"
    createdAt: Date
    updatedAt: Date
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        phone: String,
        role: { type: String, enum: ["admin", "worker"], default: "worker" },
        salary: Number,
        payrollType: { type: String, enum: ["monthly_salary", "daily_rate"], default: "monthly_salary" },
        dailyRate: Number,
        status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true },
)

const User = models.User as Model<IUser> ?? model<IUser>("User", userSchema);
export default User;
