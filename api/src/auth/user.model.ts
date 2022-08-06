import { Document, Schema } from 'mongoose';

export const UserSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export interface User extends Document {
  id: string;
  username: string;
  passwordHash: string;
}
