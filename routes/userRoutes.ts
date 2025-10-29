// routes/userRoutes.ts
import { Router } from "https://deno.land/x/oak/mod.ts";

import { 
    getUsers,
    getUser,
    addUser,
    editUser,
    removeUser,

 } from "../controllers/userController.ts";

const router = new Router();

router
    .get("/api/users", getUsers)
    .get("/api/users/:id", getUser)
    .post("/api/users", addUser)
    .put("/api/users/:id", editUser)
    .delete("/api/users/:id", removeUser);

export default router;