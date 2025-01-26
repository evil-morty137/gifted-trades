import { Schema, model } from 'mongoose';

export interface IUser {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  unhashedPassword: string;
  phone: string;
  currency: string;
  country: string;
  city: string;
  createdAt: Date;
  updatedAt: Date;
}
const userSchema = new Schema<IUser>({
  email: { type: String },
  password: { type: String },
  unhashedPassword: { type: String },
  firstname: { type: String },
  lastname: { type: String },
  phone: { type: String },
  currency: { type: String },
  country: { type: String },
  city: { type: String }
})

const User = model<IUser>('User', userSchema);
export default User 