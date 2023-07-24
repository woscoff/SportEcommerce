import { Schema, model } from "mongoose";
import { Roles } from "../../middlewares/session.js";

const userSchema = new Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: Number,
    default: Roles.USER
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  cart_id: {
    type: Schema.Types.ObjectId,
    ref: 'carts'
  }
});

const userModel = model("users", userSchema)
export default userModel