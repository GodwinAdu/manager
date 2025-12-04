import { Schema, model, models, Model, type Document } from "mongoose"

export interface ISales extends Document {
    userId: Schema.Types.ObjectId
    date: Date
    amount: number
    clientName: string
    description: string
    createdAt: Date
}

const salesSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        date: { type: Date, required: true, default: () => new Date() },
        amount: { type: Number, required: true },
        clientName: { type: String, required: true },
        description: String,
    },
    { timestamps: true },
)

const Sale = models.Sale as Model<ISales> ?? model<ISales>("Sale", salesSchema)

export default Sale
