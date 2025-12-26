import mongoose, { Document, Types } from "mongoose";

export interface IPasswordReset extends Document {
  user?: Types.ObjectId;
  resetPasswordToken: string;
  resetPasswordExpire: Date;
  used: boolean;
}

const PasswordResetSchema = new mongoose.Schema<IPasswordReset>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const PasswordReset = mongoose.model<IPasswordReset>(
  "PasswordReset",
  PasswordResetSchema
);

export default PasswordReset;
