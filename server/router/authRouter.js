import { Router } from "express";
import {
  isAuthenticated,
  login,
  logout,
  register,
  sendOtpForVerification,
  sendResetOtp,
  checkResetOtp,
  verifyOtpForVerification,
  verifyResetOtp,
} from "../controller/authController.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-otp-for-verification", userAuth, sendOtpForVerification);
authRouter.post(
  "/verify-otp-for-verification",
  userAuth,
  verifyOtpForVerification,
);
authRouter.post("/is-authenticated", userAuth, isAuthenticated);
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/check-reset-otp", checkResetOtp);
authRouter.post("/verify-reset-otp", verifyResetOtp);

export default authRouter;
