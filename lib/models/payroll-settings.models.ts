import { Schema, models, model, Model, type Document } from "mongoose"

export interface IPayrollSettings extends Document {
  payrollType: "monthly_salary" | "daily_rate"
  defaultWorkingDays: number
  defaultDailyRate: number
  createdAt: Date
  updatedAt: Date
}

const payrollSettingsSchema = new Schema(
  {
    payrollType: { 
      type: String, 
      enum: ["monthly_salary", "daily_rate"], 
      default: "monthly_salary" 
    },
    defaultWorkingDays: { type: Number, default: 20 },
    defaultDailyRate: { type: Number, default: 100 },
  },
  { timestamps: true }
)

const PayrollSettings = models.PayrollSettings as Model<IPayrollSettings> ?? model<IPayrollSettings>("PayrollSettings", payrollSettingsSchema)

export default PayrollSettings