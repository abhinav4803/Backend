import ErrorHandler from "../middlewares/error.js";
import User from "../models/userSchema.js";

export const register = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new ErrorHandler("No files were uploaded.", 400));
    }

    const { profilePicture } = req.files;
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

    if (!allowedTypes.includes(profilePicture.mimetype)) {
      return next(
        new ErrorHandler(
          "Invalid file type. Only PNG, JPG, and JPEG are allowed.",
          400
        )
      );
    }

    const { userName, email, password, phone, address, role } = req.body;

    if (!userName || !email || !password || !phone) {
      return next(new ErrorHandler("Please provide all required fields.", 400));
    }

    if (password.length < 6 || password.length > 20) {
      return next(
        new ErrorHandler("Password must be between 6 and 20 characters.", 400)
      );
    }

    if (!/^\d{10}$/.test(phone)) {
      return next(
        new ErrorHandler("Phone number must be a valid 10-digit number.", 400)
      );
    }

    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
      return next(
        new ErrorHandler("User already exists with this email.", 400)
      );
    }

    const user = new User({
      userName,
      email,
      password, // 🔴 Ideally hash password using bcrypt before saving
      phone,
      address,
      // profilePicture: {
      //   public_id: profilePicture.name,
      //   url: profilePicture.tempFilePath, // You might want to upload this to cloud storage (e.g. Cloudinary)
      // },
      role: role || "buyer",
    });

    await user.save();

    // ✅ Finally send response
    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user,
    });
  } catch (error) {
    next(error);
  }
};
