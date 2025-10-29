// middleware/authMiddleware.ts
import { verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const SECRET = Deno.env.get("JWT_SECRET") || "your-secret-key-at-least-32-chars-long";
const key = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(SECRET),
  { name: "HMAC", hash: "SHA-256" },
  true,
  ["sign", "verify"]
);

export const authMiddleware = async (ctx: any, next: any) => {
  try {
    // Authorization header check koro
    const authHeader = ctx.request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: "Unauthorized: No token provided. Please login first."
      };
      return;
    }

    // Token extract koro
    const token = authHeader.substring(7); // "Bearer " remove

    // Token verify koro
    const payload = await verify(token, key);
    
    // User info context e store koro (pore use korte parben)
    ctx.state.user = payload;

    // Next middleware/controller e jao
    await next();

  } catch (error) {
    console.error("Auth middleware error:", error);
    ctx.response.status = 401;
    ctx.response.body = {
      success: false,
      message: "Invalid or expired token. Please login again."
    };
  }
};