import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import transporter from "../db/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../db/emailTemplates.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res
        .status(500)
        .json({ message: "User created but could not be loaded" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to our app",
      text: `Welcome to our app ${name}. Your account has been created successfully with this email: ${email}`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error("Email send error:", mailError);
      const { password: _, ...safeUser } = user;
      return res.status(201).json({
        message:
          "User created successfully, but welcome email failed to send. Authorize your IP in Brevo (Settings → Security → Authorized IPs), or deactivate SMTP IP blocking.",
        emailError: mailError.message,
        user: safeUser,
        token,
      });
    }

    const { password: _, ...safeUser } = user;

    return res.status(201).json({
      message: "User created successfully",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const result = await db.select().from(users).where(eq(users.email, email));
    const user = result[0];

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      message: "Login successful",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendOtpForVerification = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await db.select().from(users).where(eq(users.id, userId));

    const user = result[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db
      .update(users)
      .set({ verifyOtp: otp, verifyOtpExpireAt: expireAt })
      .where(eq(users.id, userId));

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verify your account",
      // text: `Your verification code is ${otp}. It will expire in 24 hours.`,
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email),
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      return res.status(500).json({ message: mailError.message });
    }

    return res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyOtpForVerification = async (req, res) => {
  const userId = req.userId;
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: "OTP is required" });
  }

  try {
    const result = await db.select().from(users).where(eq(users.id, userId));
    const user = result[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.verifyOtp || user.verifyOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (
      user.verifyOtpExpireAt &&
      new Date(user.verifyOtpExpireAt).getTime() < Date.now()
    ) {
      return res.status(400).json({ message: "OTP expired" });
    }
    await db
      .update(users)
      .set({ isAccountVerified: true, verifyOtp: "", verifyOtpExpireAt: null })
      .where(eq(users.id, userId));
    return res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const isAuthenticated = async (req, res) => {
  try {
    return res.status(200).json({ message: "User is authenticated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const result = await db.select().from(users).where(eq(users.email, email));
    const user = result[0];
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db
      .update(users)
      .set({ resetOtp: otp, resetOtpExpireAt: expireAt })
      .where(eq(users.id, user.id));

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset your password",
      // text: `Your reset password code is ${otp}. It will expire in 24 hours.`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email),
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      return res.status(500).json({ message: mailError.message });
    }

    return res.status(200).json({ message: "Reset password email sent" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const checkResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const result = await db.select().from(users).where(eq(users.email, email));
    const user = result[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (
      !user.resetOtpExpireAt ||
      new Date(user.resetOtpExpireAt).getTime() < Date.now()
    ) {
      return res.status(400).json({ message: "OTP expired" });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyResetOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const result = await db.select().from(users).where(eq(users.email, email));
    const user = result[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (
      !user.resetOtpExpireAt ||
      new Date(user.resetOtpExpireAt).getTime() < Date.now()
    ) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetOtp: "",
        resetOtpExpireAt: null,
      })
      .where(eq(users.id, user.id));

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
