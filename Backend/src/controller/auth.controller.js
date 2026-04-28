import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { sendEmail } from "../config/sendEmail.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function getCookieOptions(maxAge) {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    path: "/",
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    ...(maxAge ? { maxAge, expires: new Date(Date.now() + maxAge) } : {}),
  };
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/** Sign a short-lived access token (15 min) */
function signAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
}

/** Sign a long-lived refresh token (7 days) */
function signRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

/** Basic email format check */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClientUrl() {
  // Use FRONTEND_URL if available, otherwise fall back to CLIENT_URL
  const url = process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";
  return url.replace(/\/+$/, "");
}

async function issueAuthSession(user, res) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();

  const baseCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  };

  res.cookie("token", accessToken, baseCookieOptions);
  res.cookie("refreshToken", refreshToken, {
    ...baseCookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
    expires: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE),
  });
}

// ─── REGISTER ─────────────────────────────────────────────────────────────────

export async function UserRegister(req, res) {
  try {
    const { name, email, password } = req.body ?? {};

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    const alreadyUser = await userModel.findOne({ email: email.toLowerCase() });
    if (alreadyUser) {
      if (alreadyUser.isVerified) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }
      // If user exists but is not verified, we allow them to re-register
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 5 * 60 * 1000);

    if (alreadyUser && !alreadyUser.isVerified) {
      alreadyUser.name = name.trim();
      alreadyUser.password = hashPassword;
      alreadyUser.verificationToken = verificationToken;
      alreadyUser.verificationTokenExpiry = verificationTokenExpiry;
      await alreadyUser.save();
    } else {
      await userModel.create({
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashPassword,
        verificationToken,
        verificationTokenExpiry,
        isVerified: false,
      });
    }
    const verifyLink = `${getClientUrl()}/verify-email/${verificationToken}`;

    await sendEmail(
      email,
      "Verify your email",
      `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2>Welcome, ${name.trim()}!</h2>
          <p>Click the button below to verify your email. This link expires in <strong>5 minutes</strong>.</p>
          <a href="${verifyLink}"
             style="display:inline-block;padding:12px 24px;background:#A4873E;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
            Verify Email
          </a>
          <p style="color:#888;font-size:12px;margin-top:24px">If you didn't create an account, ignore this email.</p>
        </div>
      `
    );

    return res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
    });

  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Failed to register user" });
  }
}

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────

export async function verifyEmail(req, res) {
  try {
    const { token } = req.params;

    const user = await userModel.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification link" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;

    // ✅ Issue tokens and log user in automatically
    await issueAuthSession(user, res);

    return res.status(200).json({
      message: "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ message: "Verification failed" });
  }
}

export function verifyEmailRedirect(req, res) {
  const { token } = req.params;
  return res.redirect(`${getClientUrl()}/verify-email/${token}`);
}

// ─── RESEND VERIFICATION EMAIL ────────────────────────────────────────────────

export async function resendVerification(req, res) {
  try {
    const { email } = req.body ?? {};

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await userModel.findOne({ email: email.toLowerCase() });

    // Always return success to avoid email enumeration
    if (!user || user.isVerified) {
      return res.status(200).json({ message: "If that email exists and is unverified, a new link has been sent." });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    const verifyLink = `${getClientUrl()}/verify-email/${verificationToken}`;
    await sendEmail(
      email,
      "Verify your email (resent)",
      `<p>Your new verification link: <a href="${verifyLink}">Verify Email</a> (expires in 5 minutes)</p>`
    );

    return res.status(200).json({ message: "If that email exists and is unverified, a new link has been sent." });

  } catch (error) {
    console.error("Resend verification error:", error);
    return res.status(500).json({ message: "Failed to resend verification email" });
  }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

export async function UserLogin(req, res) {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });

    // Use constant-time comparison path even when user not found
    if (!user) {
      await bcrypt.compare(password, "$2b$12$invalidhashtopreventtiming00000000000"); // dummy compare
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google sign-in. Continue with Google instead." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Issue tokens
    await issueAuthSession(user, res);

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function googleAuth(req, res) {
  try {
    const { credential } = req.body ?? {};

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Google OAuth is not configured on the server" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email?.toLowerCase();
    const googleId = payload?.sub;
    const name = payload?.name?.trim();
    const avatar = payload?.picture || "";

    if (!payload?.email_verified || !email || !googleId || !name) {
      return res.status(400).json({ message: "Invalid Google account data" });
    }

    let user = await userModel.findOne({
      $or: [{ email }, { googleId }],
    });

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 12);

      user = await userModel.create({
        name,
        email,
        password: hashedPassword,
        googleId,
        avatar,
        authProvider: "google",
        isVerified: true,
      });
    } else {
      user.name = user.name || name;
      user.googleId = googleId;
      user.avatar = avatar || user.avatar;
      user.authProvider = "google";
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpiry = undefined;
      await user.save();
    }

    await issueAuthSession(user, res);

    return res.status(200).json({
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(500).json({
      message: process.env.NODE_ENV === "production"
        ? "Google authentication failed"
        : error?.message || "Google authentication failed"
    });
  }
}

// ─── REFRESH ACCESS TOKEN ─────────────────────────────────────────────────────

export async function refreshAccessToken(req, res) {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    let payload;
    try {
      payload = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const user = await userModel.findById(payload.id);
    if (!user || !user.refreshToken) {
      return res.status(401).json({ message: "Session expired, please log in again" });
    }

    const isValid = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
    if (!isValid) {
      return res.status(401).json({ message: "Refresh token mismatch" });
    }

    // Rotate tokens
    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await user.save();

    res.cookie("token", newAccessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE));
    res.cookie("refreshToken", newRefreshToken, getCookieOptions(REFRESH_TOKEN_MAX_AGE));

    return res.status(200).json({ message: "Token refreshed" });

  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

export async function UserLogout(req, res) {
  try {
    // Clear refresh token from DB if user is authenticated
    if (req.user?.id) {
      await userModel.findByIdAndUpdate(req.user.id, { refreshToken: undefined });
    }

    res.clearCookie("token", getCookieOptions());
    res.clearCookie("refreshToken", getCookieOptions());

    return res.status(200).json({ message: "Logged out successfully" });

  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Logout failed" });
  }
}

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body ?? {};

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await userModel.findOne({ email: email.toLowerCase() });

    // Always return success to avoid email enumeration
    if (!user) {
      return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail(
      email,
      "Reset your password",
      `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2>Password Reset</h2>
          <p>Click below to reset your password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetLink}"
             style="display:inline-block;padding:12px 24px;background:#A4873E;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
            Reset Password
          </a>
          <p style="color:#888;font-size:12px;margin-top:24px">If you didn't request this, ignore this email.</p>
        </div>
      `
    );

    return res.status(200).json({ message: "If that email exists, a reset link has been sent." });

  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────

export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body ?? {};

    if (!password) return res.status(400).json({ message: "New password is required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.refreshToken = undefined; // invalidate all sessions on password change
    await user.save();

    return res.status(200).json({ message: "Password reset successful. Please log in." });

  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────

export async function getCurrentUser(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select(
      "-password -refreshToken -verificationToken -verificationTokenExpiry -resetPasswordToken -resetPasswordExpiry"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user });

  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
