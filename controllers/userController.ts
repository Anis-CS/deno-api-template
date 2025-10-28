// controllers/userController.ts

import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { 
  getAllUsers, 
  getUserById, 
  // createUser,
  // updateUser,
  // deletedUser,
} from "../models/userModel.ts";

export const getUsers = async (ctx: RouterContext) => {
  try {
    const users = await getAllUsers(); // ✅ await ব্যবহার করো
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      data: users,
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "Error fetching users",
      error: error.message,
    };
  }
};

export const getUser = async (ctx: RouterContext) => {
  const id = Number(ctx.params.id);
  console.log("👉 User ID:", id);
  const user = await getUserById(id);
  console.log("✅ Found user:", user);
  ctx.response.body = user;
};


// export const addUser = async (ctx: RouterContext) => {
//   const body = await ctx.request.body.json();
//   const newUser = {
//     id: Date.now(),
//     name: body.name,
//     email: body.email,
//   };
//   const user = createUser(newUser);
//   ctx.response.status = 201;
//   ctx.response.body = user;
// };

// export const editUser = async (ctx: RouterContext) => {
//   try {
//     const id = Number(ctx.params.id);
//     const body = await ctx.request.body.json();

//     const updatedUser = updateUser(id, body);

//     if (!updatedUser) {
//       ctx.response.status = 404;
//       ctx.response.body = { message: "User not found" };
//       return;
//     }

//     // ✅ এখানে status সবসময় সংখ্যা হতে হবে
//     ctx.response.status = 200;
//     ctx.response.body = updatedUser;

//   } catch (error) {
//     console.error("❌ Error in editUser:", error);
//     ctx.response.status = 400;
//     ctx.response.body = { message: "Invalid JSON data" };
//   }
// };

// export const removeUser = (ctx: RouterContext) => {
//   const id = Number(ctx.params.id);
//   const deleted = deletedUser(id);
//   if(deleted){
//     ctx.response.body ={message: "User delete successfully."};
//   }else{
//     ctx.response.status = 404;
//     ctx.response.body = {message: "User not found!"};
//   }
// };





