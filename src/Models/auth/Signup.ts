import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IUser {
  username: string;
  email: string;
  password: string;
  refreshToken?: string;
}

const Signup = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 3,
      maxLength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxLength: 254,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 60,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", Signup);
export default User;
