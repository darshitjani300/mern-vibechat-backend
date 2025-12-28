import mongoose, { Types } from "mongoose";

export interface IProfilePicture {
  url: string;
  public_id: string;
}

export interface IProfile {
  userId: Types.ObjectId;
  name: string;
  about: string;
  picture: IProfilePicture;
}

export const profileImageSchema = new mongoose.Schema<IProfilePicture>({
  url: {
    type: String,
    required: true,
  },
  public_id: {
    type: String,
    required: true,
  },
});

const profileModel = new mongoose.Schema<IProfile>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 30,
    },
    about: {
      type: String,
      minLength: 1,
      maxLength: 120,
    },
    picture: {
      type: profileImageSchema,
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model("profile", profileModel);
export default Profile;
