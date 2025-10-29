// routes/userRoutes.ts
import { Router } from "https://deno.land/x/oak/mod.ts";
import { 
    getUsers,
    getUser,
    addUser,
    editUser,
    removeUser,

 } from "../controllers/userController.ts";
import { authMiddleware } from "../middleware/authMiddleware.ts";

const router = new Router();

router
    .get("/api/users", authMiddleware, getUsers)
    .get("/api/users/:id", authMiddleware, getUser)
    .post("/api/users", authMiddleware, addUser)
    .put("/api/users/:id", authMiddleware, editUser)
    .delete("/api/users/:id", authMiddleware, removeUser);

export default router;