import mongoose, { Schema, type Document } from "mongoose"

export interface ICompanySavings extends Document {
  month: Date
  totalRevenue: number
  savingsPercentage: number
  savingsAmount: number
  notes: string
  createdAt: Date
  updatedAt: Date
}

const companySavingsSchema = new Schema(
  {
    month: { type: Date, required: true, unique: true },
    totalRevenue: { type: Number, required: true },
    savingsPercentage: { type: Number, required: true, default: 10 },
    savingsAmount: { type: Number, required: true },
    notes: String,
  },
  { timestamps: true },
)

const CompanySaving = mongoose.models.CompanySaving || mongoose.model("CompanySaving", companySavingsSchema)

export default CompanySaving