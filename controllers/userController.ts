// controllers/userController.ts

import { Context } from "https://deno.land/x/oak/mod.ts";

import { 
  getAllUsers, 
  getUserById, 
  createUser,
  updateUser,
  deleteUser,
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

//form data updated controller start
export const editUser = async (ctx: Context) => {
  try {
    const id = Number(ctx.params.id);
    
    if (!id) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "Invalid user ID",
      };
      return;
    }

    // ✅ Get existing user data first (to delete old image)
    const existingUser = await getUserById(id);
    
    if (!existingUser) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: "User not found",
      };
      return;
    }

    console.log("📋 Existing user:", existingUser); // Debug

    const body = ctx.request.body;
    const contentType = ctx.request.headers.get("content-type");

    let name, email, imageFile = null;

    // Check if it's form-data or JSON
    if (contentType?.includes("multipart/form-data")) {
      const formData = await body.formData();
      
      name = formData.get("name")?.toString();
      email = formData.get("email")?.toString();
      imageFile = formData.get("image") as File | null;
      
      console.log("Form data received:", { name, email, hasImage: !!imageFile }); // Debug
    } else {
      const jsonData = await body.json();
      name = jsonData.name;
      email = jsonData.email;
    }

    // Build updates object (only include provided fields)
    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    // Image upload handling
    if (imageFile && imageFile.size > 0) {
      console.log(" New image detected, size:", imageFile.size); // Debug
      
      // ✅ Delete old image file if exists
      if (existingUser.image) {
        try {
          // Remove leading slash and construct proper path
          const oldImagePath = existingUser.image.startsWith('/') 
            ? `.${existingUser.image}` 
            : existingUser.image;
          
          console.log(` Attempting to delete: ${oldImagePath}`); // Debug
          
          await Deno.remove(oldImagePath);
          console.log(` Deleted old image: ${oldImagePath}`);
        } catch (error) {
          console.error(" Error deleting old image:", error);
          console.log("Path tried:", existingUser.image);
        }
      } else {
        console.log("No existing image to delete");
      }

      const uploadDir = "./uploads";
      
      try {
        await Deno.mkdir(uploadDir, { recursive: true });
      } catch (error) {
        // Directory already exists
      }

      const timestamp = Date.now();
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${timestamp}-${crypto.randomUUID()}.${fileExt}`;
      const imagePath = `${uploadDir}/${fileName}`;

      // Save new file to disk
      const buffer = await imageFile.arrayBuffer();
      await Deno.writeFile(imagePath, new Uint8Array(buffer));
      
      // Store relative path
      updates.image = `/uploads/${fileName}`;
      console.log(`✅ Uploaded new image: ${updates.image}`);
    }

    if (Object.keys(updates).length === 0) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "No fields to update",
      };
      return;
    }

    const updatedUser = await updateUser(id, updates);

    ctx.response.status = 200;
    ctx.response.body = { 
      success: true, 
      message: "User updated successfully",
      data: updatedUser 
    };
  } catch (error) {
    console.error("Error updating user:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "Failed to update user",
      error: error.message,
    };
  }
};
//form data updated controller end

//form data delete controller start
export const removeUser = async (ctx: Context) => {
  try {
    const id = Number(ctx.params.id);
    
    if (!id) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "Invalid user ID",
      };
      return;
    }

    // ✅ Get user before deleting to remove image file
    const user = await getUserById(id);
    
    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: "User not found",
      };
      return;
    }

    const deleted = await deleteUser(id);

    if (!deleted) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: "Failed to delete user",
      };
      return;
    }

    // ✅ Delete image file from disk
    if (user.image) {
      try {
        const imagePath = `.${user.image}`;
        await Deno.remove(imagePath);
        console.log(`Deleted image: ${imagePath}`);
      } catch (error) {
        console.log("Image file not found or already deleted");
      }
    }

    ctx.response.status = 200;
    ctx.response.body = { 
      success: true, 
      message: "User deleted successfully" 
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "Failed to delete user",
      error: error.message,
    };
  }
};
//form data delete controller end

