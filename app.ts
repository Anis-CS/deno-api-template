import { Application, Router, send } from "https://deno.land/x/oak@v17.1.6/mod.ts";
import { addUser, getUsers } from "./controllers/userController.ts";

const app = new Application();
const router = new Router();

// API routes
router.post("/api/users", addUser);
router.get("/api/users", getUsers);

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

app.use(router.routes());
app.use(router.allowedMethods());

console.log("🚀 Server running at http://localhost:5000");
await app.listen({ port: 5000 });