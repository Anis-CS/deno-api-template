import { Application, send } from "https://deno.land/x/oak@v17.1.6/mod.ts";
import router from "./routes/userRoutes.ts";
import authRouter from "./routes/authRoutes.ts";

const app = new Application();

// CORS middleware (optional - frontend theke API call er jonno)
app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 200;
    return;
  }
  
  await next();
});

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error("Error:", err);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "Internal server error"
    };
  }
});

// ✅ First, auth routes
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

// ✅ Then, user routes
app.use(router.routes());
app.use(router.allowedMethods());

console.log("🚀 Server running at http://localhost:5000");
await app.listen({ port: 5000 });
