import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const paymentMethodSchema = new mongoose.Schema({
  methodType: {
    type: String,
    enum: ["Credit Card", "Debit Card", "UPI", "Net Banking", "Wallet", "Cash"],
    required: true,
  },
  provider: {
    type: String,
    required: true, // e.g., Visa, MasterCard, Google Pay
  },
  accountNumber: {
    type: String,
    select: false, // Hide by default
  },
  expiryDate: {
    type: String, // MM/YY format
    select: false,
  },
  upiId: {
    type: String,
    match: [/^[\w.-]+@[\w.-]+$/, "Please enter a valid UPI ID"],
    select: false,
  },
});

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      minLength: [4, "UserName must contain at least 4 characters"],
      maxLength: [40, "UserName cannot exceed 40 character"], // Ensure
    },
    password: {
      type: String,
      required: true,
      minLength: [6, "Password must contain at least 6 characters"],
      maxLength: [20, "Password cannot exceed 20 characters"],
      selected: false, // Exclude password from queries by default
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{10}$/, "Please enter a valid phone number"],
    },
    address: {
      type: String,
    },
    profilePicture: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    paymentMethods: [paymentMethodSchema],
    role: {
      type: String,
      enum: ["buyer", "admin", "seller"],
      default: "user",
    },
    comission: {
      type: String,
      default: 0,
    },
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
export default mongoose.model("User", userSchema);
