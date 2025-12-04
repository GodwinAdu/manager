import mongoose, { Schema, type Document } from "mongoose"

export interface IExpense extends Document {
  userId: mongoose.Schema.Types.ObjectId
  date: Date
  amount: number
  category: string
  description: string
  createdAt: Date
}

const expenseSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true, default: () => new Date() },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    description: String,
  },
  { timestamps: true },
)

const Expense = mongoose.models.Expense || mongoose.model("Expense", expenseSchema)

export default Expense