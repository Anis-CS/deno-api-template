// controllers/authenticationController.ts
import { create, verify, getNumericDate, Context } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { 
  createUser, 
  getUserByEmail, 
  verifyUserPassword 
} from "../models/userModel.ts";

// 🔐 Generate CryptoKey
const SECRET = Deno.env.get("JWT_SECRET") || "your-secret-key-at-least-32-chars-long";
const ACCESS_KEY = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(SECRET),
  { name: "HMAC", hash: "SHA-256" },
  true,
  ["sign", "verify"]
);

// 🔁 Separate secret for refresh tokens
const REFRESH_SECRET = Deno.env.get("JWT_REFRESH_SECRET") || "another-very-secret-refresh-key";
const REFRESH_KEY = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(REFRESH_SECRET),
  { name: "HMAC", hash: "SHA-256" },
  true,
  ["sign", "verify"]
);

// ⚙️ In-memory store for refresh tokens (use DB in real apps)
let refreshTokens: string[] = [];

/* =======================
   LOGIN USER
======================= */
export const loginUser = async (ctx: any) => {
  try {
    const body = await ctx.request.body.json();
    const { email, password } = body;

    if (!email || !password) {
      ctx.response.status = 400;
      ctx.response.body = { success: false, message: "Email and password are required" };
      return;
    }

    const user = await verifyUserPassword(email, password);
    if (!user) {
      ctx.response.status = 401;
      ctx.response.body = { success: false, message: "Invalid credentials" };
      return;
    }

    // ✅ Access Token (1 hour)
    const accessToken = await create(
      { alg: "HS256", typ: "JWT" },
      { userId: user.id, email: user.email, exp: getNumericDate(60 * 60) },
      ACCESS_KEY
    );

    // 🔁 Refresh Token (7 days)
    const refreshToken = await create(
      { alg: "HS256", typ: "JWT" },
      { userId: user.id, email: user.email, exp: getNumericDate(60 * 60 * 24 * 7) },
      REFRESH_KEY
    );

    // Store refresh token
    refreshTokens.push(refreshToken);

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
    };

  } catch (error) {
    console.error("Login error:", error);
    ctx.response.status = 500;
    ctx.response.body = { success: false, message: "Login failed", error: error.message };
  }
};

/* =======================
   REFRESH TOKEN
======================= */
export const refreshAccessToken = async (ctx: any) => {
  try {
    const body = await ctx.request.body.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      ctx.response.status = 400;
      ctx.response.body = { success: false, message: "Refresh token is required" };
      return;
    }

    if (!refreshTokens.includes(refreshToken)) {
      ctx.response.status = 403;
      ctx.response.body = { success: false, message: "Invalid refresh token" };
      return;
    }

    // ✅ Verify refresh token
    const payload = await verify(refreshToken, REFRESH_KEY);

    // 🆕 Issue new access token
    const newAccessToken = await create(
      { alg: "HS256", typ: "JWT" },
      { userId: payload.userId, email: payload.email, exp: getNumericDate(60 * 60) },
      ACCESS_KEY
    );

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
    };

  } catch (error) {
    console.error("Refresh token error:", error);
    ctx.response.status = 403;
    ctx.response.body = { success: false, message: "Invalid or expired refresh token" };
  }
};

/* =======================
   LOGOUT USER
======================= */
export const logoutUser = async (ctx: any) => {
  try {
    const body = await ctx.request.body.json();
    const { refreshToken } = body;

    if (refreshToken) {
      refreshTokens = refreshTokens.filter((t) => t !== refreshToken);
    }

    ctx.response.status = 200;
    ctx.response.body = { success: true, message: "Logout successful" };
  } catch (error) {
    console.error("Logout error:", error);
    ctx.response.status = 500;
    ctx.response.body = { success: false, message: "Logout failed" };
  }
};



export const registerUser = async (ctx: any) => {
  try {
    const body = await ctx.request.body().value;
    const { email, password, name, image } = body;

    if (!email || !password || !name) {
      ctx.response.status = 400;
      ctx.response.body = { 
        success: false, 
        message: "All fields are required" 
      };
      return;
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      ctx.response.status = 409;
      ctx.response.body = { 
        success: false, 
        message: "User already exists" 
      };
      return;
    }

    const newUser = await createUser({
      name,
      email,
      password,
      image: image || null
    });

    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        image: newUser.image
      }
    };
  } catch (error) {
    console.error("Registration error:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "Registration failed",
      error: error.message
    };
  }
};

