import { Application, send } from "https://deno.land/x/oak@v17.1.6/mod.ts";
import router from "./routes/userRoutes.ts";

const app = new Application();

// Middleware for logging
app.use(async (ctx, next) => {
  console.log(`${ctx.request.method} ${ctx.request.url.pathname}`);
  await next();
});

// Serve uploaded images
app.use(async (ctx, next) => {
  const path = ctx.request.url.pathname;
  if (path.startsWith("/uploads/")) {
    try {
      await send(ctx, path, {
        root: `${Deno.cwd()}`,
      });
    } catch {
      await next();
    }
  } else {
    await next();
  }
});

// Routes
app.use(router.routes());
app.use(router.allowedMethods());

console.log("🚀 Server running at http://localhost:5000");
await app.listen({ port: 5000 });