import { Schema, models, model, Model, type Document } from "mongoose"

export interface IProfitAllocation extends Document {
  month: Date
  totalProfit: number
  savingsAmount: number
  savingsPercentage: number
  allocations: Array<{
    category: string
    amount: number
    description?: string
  }>
  remainingAmount: number
  createdAt: Date
  updatedAt: Date
}

const profitAllocationSchema = new Schema(
  {
    month: { type: Date, required: true, unique: true },
    totalProfit: { type: Number, required: true },
    savingsAmount: { type: Number, required: true },
    savingsPercentage: { type: Number, required: true },
    allocations: [{
      category: { type: String, required: true },
      amount: { type: Number, required: true },
      description: String
    }],
    remainingAmount: { type: Number, required: true }
  },
  { timestamps: true }
)

const ProfitAllocation = models.ProfitAllocation as Model<IProfitAllocation> ?? model<IProfitAllocation>("ProfitAllocation", profitAllocationSchema)

export default ProfitAllocation