import ErrorHandler from "../middlewares/error.js";
export const register = (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("No files were uploaded.", 400));
  }
  const { profilePicture } = req.files;
  const allowedTypes = [".png", ".jpg", ".jpeg"];
};
