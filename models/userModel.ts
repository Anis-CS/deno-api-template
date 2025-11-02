// models/userModel.ts
import { client } from "../config/db.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  image?: string | null; 
  created_at?: Date;
}

// Get all users (without password)
export const getAllUsers = async (): Promise<User[]> => {
  const result = await client.query("SELECT id, name, email, image, created_at FROM users");
  return result.map((row: any) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image || null,
    created_at: row.created_at,
  }));
};

// Get user by ID (without password)
export const getUserById = async (id: number): Promise<User | null> => {
  console.log("Searching user ID:", id);
  
  const result = await client.execute(
    `SELECT id, name, email, image, created_at FROM users WHERE id = ?`,
    [id]
  );

  console.log("Query result:", result);

  if (result.rows && result.rows.length > 0) {
    const row = result.rows[0];
    console.log("Found user:", row);
    return {
      id: Number(row.id),
      name: row.name,
      email: row.email,
      image: row.image || null,
      created_at: row.created_at,
    };
  }

  console.log("User not found with ID:", id);
  return null;
};

// ✅ Get user by email (WITH password - for authentication)
export const getUserByEmail = async (email: string): Promise<User | null> => {
  console.log("Searching user by email:", email);
  
  const result = await client.execute(
    `SELECT id, name, email, password, image, created_at FROM users WHERE email = ?`,
    [email]
  );

  if (result.rows && result.rows.length > 0) {
    const row = result.rows[0];
    return {
      id: Number(row.id),
      name: row.name,
      email: row.email,
      password: row.password, // Password include kora ache
      image: row.image || null,
      created_at: row.created_at,
    };
  }

  return null;
};

// ✅ Create user with bcrypt hashed password
export const createUser = async (userData: { 
  name: string; 
  email: string; 
  password: string;
  image?: string | null;
}) => {
  // ✅ bcrypt diye password hash koro
  const hashedPassword = await bcrypt.hash(userData.password);
  
  const result = await client.execute(
    `INSERT INTO users (
        name, 
        email, 
        password, 
        image, 
        created_at
      ) VALUES (?, ?, ?, ?, NOW())`,
    [
      userData.name, 
      userData.email, 
      hashedPassword, 
      userData.image || null
    ]
  );
  
  return {
    id: result.lastInsertId,
    name: userData.name,
    email: userData.email,
    image: userData.image,
  };
};

// ✅ Update user (password optional)
export const updateUser = async (id: number, updates: Partial<{ 
  name: string; 
  email: string; 
  password: string;
  image: string;
}>) => {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name) {
    fields.push("name = ?");
    values.push(updates.name);
  }
  if (updates.email) {
    fields.push("email = ?");
    values.push(updates.email);
  }
  if (updates.password) {
    // ✅ Password update hole hash koro
    const hashedPassword = await bcrypt.hash(updates.password);
    fields.push("password = ?");
    values.push(hashedPassword);
  }
  if (updates.image) {
    fields.push("image = ?");
    values.push(updates.image);
  }

  if (fields.length === 0) return null;

  values.push(id);

  console.log("🔄 Update query:", `UPDATE users SET ${fields.join(", ")} WHERE id = ?`);
  console.log("📊 Values:", values);

  const result = await client.execute(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  console.log("✅ Update result:", result);

  if (result.affectedRows === 0) return null;

  return await getUserById(id);
};

// Delete user
export const deleteUser = async (id: number): Promise<boolean> => {
  const result = await client.execute(
    `DELETE FROM users WHERE id = ?`,
    [id]
  );

  return result.affectedRows! > 0;
};

// ✅ Verify user password (for login)
export const verifyUserPassword = async (email: string, password: string): Promise<User | null> => {
  const user = await getUserByEmail(email);
  
  if (!user || !user.password) {
    return null;
  }

  // bcrypt diye password compare koro
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    return null;
  }

  // Password return korbo na
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};