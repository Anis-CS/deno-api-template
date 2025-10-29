// controllers/userController.ts

import { Context } from "https://deno.land/x/oak/mod.ts";
import { 
  getAllUsers, 
  getUserById, 
  createUser,
  // updateUser,
  // deletedUser,
} from "../models/userModel.ts";

export const getUsers = async (ctx: Context) => {
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

export const getUser = async (ctx: Context) => {
  try {
    const id = Number(ctx.params.id); // 🟢 এখানে id নাও
    console.log("User ID:", id);

    const user = await getUserById(id);

    if (user) {
      ctx.response.status = 200;
      ctx.response.body = { success: true, data: user };
    } else {
      ctx.response.status = 404;
      ctx.response.body = { success: false, message: "User not found" };
    }
  } catch (error) {
    console.error("Error in getUser:", error);
    ctx.response.status = 500;
    ctx.response.body = { success: false, message: error.message };
  }
};


//json data insert
// export const addUser = async (ctx: Context) => {
//   try {
//     const { name, email, password } = await ctx.request.body.json();

//     if (!name || !email || !password) {
//       ctx.response.status = 400;
//       ctx.response.body = {
//         success: false,
//         message: "Name, email, and password are required",
//       };
//       return;
//     }

//     const newUser = await createUser({ name, email, password });

//     ctx.response.status = 201;
//     ctx.response.body = { success: true, data: newUser };
//   } catch (error) {
//     console.error("Error adding user:", error);
//     ctx.response.status = 500;
//     ctx.response.body = {
//       success: false,
//       message: "Failed to create user",
//       error: error.message,
//     };
//   }
// };

// Form data insert
// export const addUser = async (ctx: Context) => {
//   try {
//     const body = ctx.request.body;
//     const contentType = ctx.request.headers.get("content-type");

//     let name, email, password;

//     // Check if it's form-data or JSON
//     if (contentType?.includes("multipart/form-data")) {
      
//       const formData = await body.formData();
      
//       name = formData.get("name")?.toString();
//       email = formData.get("email")?.toString();
//       password = formData.get("password")?.toString();
      
//     } else {
//       const jsonData = await body.json();
//       name = jsonData.name;
//       email = jsonData.email;
//       password = jsonData.password;
//     }

//     if (!name || !email || !password) {
//       ctx.response.status = 400;
//       ctx.response.body = {
//         success: false,
//         message: "Name, email, and password are required",
//       };
//       return;
//     }

//     const newUser = await createUser({ name, email, password });

//     ctx.response.status = 201;
//     ctx.response.body = { success: true, data: newUser };
//   } catch (error) {
//     console.error("Error adding user:", error);
//     ctx.response.status = 500;
//     ctx.response.body = {
//       success: false,
//       message: "Failed to create user",
//       error: error.message,
//     };
//   }
// };



// export const editUser = async (ctx: Context) => {
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

// export const removeUser = (ctx: Context) => {
//   const id = Number(ctx.params.id);
//   const deleted = deletedUser(id);
//   if(deleted){
//     ctx.response.body ={message: "User delete successfully."};
//   }else{
//     ctx.response.status = 404;
//     ctx.response.body = {message: "User not found!"};
//   }
// };
//form data insert end

//form data insert with image start
export const addUser = async (ctx: Context) => {
  try {
    const body = ctx.request.body;
    const contentType = ctx.request.headers.get("content-type");

    let name, email, password, imageFile = null;

    // Check if it's form-data or JSON
    if (contentType?.includes("multipart/form-data")) {
      
      const formData = await body.formData();
      
      name = formData.get("name")?.toString();
      email = formData.get("email")?.toString();
      password = formData.get("password")?.toString();
      imageFile = formData.get("image") as File | null;
      
    } else {
      const jsonData = await body.json();
      name = jsonData.name;
      email = jsonData.email;
      password = jsonData.password;
    }

    if (!name || !email || !password) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "Name, email, and password are required",
      };
      return;
    }

    let imagePath = null;

    // Image upload handling
    if (imageFile && imageFile.size > 0) {
      const uploadDir = "./uploads";
      
      // Create uploads directory if it doesn't exist
      try {
        await Deno.mkdir(uploadDir, { recursive: true });
      } catch (error) {
        // Directory already exists
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${timestamp}-${crypto.randomUUID()}.${fileExt}`;
      imagePath = `${uploadDir}/${fileName}`;

      // Save file to disk
      const buffer = await imageFile.arrayBuffer();
      await Deno.writeFile(imagePath, new Uint8Array(buffer));
      
      // Store relative path for database
      imagePath = `/uploads/${fileName}`;
    }

    const newUser = await createUser({ name, email, password, image: imagePath });

    ctx.response.status = 201;
    ctx.response.body = { success: true, data: newUser };
  } catch (error) {
    console.error("Error adding user:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "Failed to create user",
      error: error.message,
    };
  }
};
//form data insert with image end





