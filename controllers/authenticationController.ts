// controllers/authenticationController.ts
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { 
  createUser, 
  getUserByEmail, 
  verifyUserPassword 
} from "../models/userModel.ts";

// Generate proper CryptoKey
const SECRET = Deno.env.get("JWT_SECRET") || "your-secret-key-at-least-32-chars-long";
const key = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(SECRET),
  { name: "HMAC", hash: "SHA-256" },
  true,
  ["sign", "verify"]
);

export const loginUser = async (ctx: any) => {
  try {
    const body = await ctx.request.body.json();
    const { email, password } = body;

    if (!email || !password) {
      ctx.response.status = 400;
      ctx.response.body = { 
        success: false, 
        message: "Email and password are required" 
      };
      return;
    }

    // ✅ userModel theke verify koro
    const user = await verifyUserPassword(email, password);

    if (!user) {
      ctx.response.status = 401;
      ctx.response.body = { 
        success: false, 
        message: "Invalid credentials" 
      };
      return;
    }

    // JWT token create koro
    const jwt = await create(
      { alg: "HS256", typ: "JWT" },
      { 
        userId: user.id,
        email: user.email,
        exp: getNumericDate(60 * 60) // 1 hour
      },
      key
    );

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Login successful",
      token: jwt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image
      }
    };

  } catch (error) {
    console.error("Login error:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "Login failed",
      error: error.message
    };
  }
};

export const registerUser = async (ctx: any) => {
  try {
    const body = await ctx.request.body.json();
    const { email, password, name, image } = body;

    if (!email || !password || !name) {
      ctx.response.status = 400;
      ctx.response.body = { 
        success: false, 
        message: "All fields are required" 
      };
      return;
    }

    // ✅ Check if user exists using model
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      ctx.response.status = 409;
      ctx.response.body = { 
        success: false, 
        message: "User already exists" 
      };
      return;
    }

    // ✅ Create user using model (auto hash password)
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

export const logoutUser = async (ctx: any) => {
  try {
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Logout successful"
    };
  } catch (error) {
    console.error("Logout error:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "Logout failed"
    };
  }
};