// app.ts
import { Application } from "https://deno.land/x/oak/mod.ts";
import userRoutes from "./routes/userRoutes.ts";

const app = new Application();
const PORT = 5000;

// Logging middleware
app.use(async (ctx, next) => {
  console.log(`${ctx.request.method} ${ctx.request.url}`);
  await next();
});

// Routes
app.use(userRoutes.routes());
app.use(userRoutes.allowedMethods());

console.log(`🚀 Server running at http://localhost:${PORT}`);
await app.listen({ port: PORT });
