// routes/authRoutes.ts
import { Router } from "https://deno.land/x/oak@v17.1.3/mod.ts";
import { 
  loginUser,
  registerUser,
  logoutUser
  } from "../controllers/authenticationController.ts";

const authRouter = new Router();

authRouter
        .post("/api/auth/login", loginUser)
        .post("/api/auth/register", registerUser)
        .post("/api/auth/logout", logoutUser);

export default authRouter;