import mongoose, { Schema, type Document } from "mongoose"

export interface IAttendance extends Document {
  userId: mongoose.Schema.Types.ObjectId
  date: Date
  checkInTime?: Date
  checkOutTime?: Date
  status: "present" | "absent" | "late"
  workingHours: number
  createdAt: Date
}

const attendanceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    checkInTime: Date,
    checkOutTime: Date,
    status: { type: String, enum: ["present", "absent", "late"], default: "absent" },
    workingHours: { type: Number, default: 0 },
  },
  { timestamps: true },
)

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true })

const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema)

export default Attendance