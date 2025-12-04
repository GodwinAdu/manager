import  { Schema,models,model,Model, type Document } from "mongoose"

export interface IPayroll extends Document {
    userId: Schema.Types.ObjectId
    month: Date
    baseSalary: number
    workingDays: number
    daysWorked: number
    serviceCharge: number
    totalPayable: number
    status: "pending" | "processed" | "paid"
    createdAt: Date
}

const payrollSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        month: { type: Date, required: true },
        baseSalary: { type: Number, required: true },
        workingDays: { type: Number, default: 20 },
        daysWorked: { type: Number, required: true },
        serviceCharge: { type: Number, default: 0 },
        totalPayable: { type: Number, required: true },
        status: { type: String, enum: ["pending", "processed", "paid"], default: "pending" },
    },
    { timestamps: true },
)

payrollSchema.index({ userId: 1, month: 1 }, { unique: true })

const Payroll = models.Payroll as Model<IPayroll> ?? model<IPayroll>("Payroll", payrollSchema);

export default Payroll;
