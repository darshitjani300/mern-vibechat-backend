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
    },
    name: {
      type: String,
    },
    about: {
      type: String,
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
