// models/userModel.ts
import { client } from "../db.ts";
import { encodeHex } from "https://deno.land/std@0.224.0/encoding/hex.ts";

export interface User {
  id?: number;
  name: string;
  email: string;
  image?: string | null; 
}

export const getAllUsers = async (): Promise<User[]> => {
  const result = await client.query("SELECT id, name, email FROM users");
  return result.map((row: any) => ({
    id: row.id,
    name: row.name,
    email: row.email,
  }));
};

export const getUserById = async (id: number): Promise<User | null> => {
  console.log("Searching user ID:", id);
  
  const result = await client.execute(  // ✅ execute ব্যবহার করুন
    `SELECT id, name, email, image FROM users WHERE id = ?`,
    [id]
  );

  console.log("Query result:", result); // Debug

  if (result.rows && result.rows.length > 0) {
    const row = result.rows[0];
    console.log("Found user:", row); // Debug
    return {
      id: Number(row.id),
      name: row.name,
      email: row.email,
      image: row.image || null,
    };
  }

  console.log("❌ User not found with ID:", id);
  return null;
};

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return encodeHex(new Uint8Array(hashBuffer));
}

//form data insert with image start
export const createUser = async (userData: { 
  name: string; 
  email: string; 
  password: string;
  image?: string | null;
}) => {
  const result = await client.execute(
    `INSERT INTO users (name, email, password, image) VALUES (?, ?, ?, ?)`,
    [userData.name, userData.email, userData.password, userData.image || null]
  );
  
  return {
    id: result.lastInsertId,
    name: userData.name,
    email: userData.email,
    image: userData.image,
  };
};
//form data insert with image end

// Update user
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
    fields.push("password = ?");
    values.push(updates.password);
  }
  if (updates.image) {  // ✅ Make sure this is included
    fields.push("image = ?");
    values.push(updates.image);
  }

  if (fields.length === 0) return null;

  values.push(id);

  console.log("🔄 Update query:", `UPDATE users SET ${fields.join(", ")} WHERE id = ?`); // Debug
  console.log("📊 Values:", values); // Debug

  const result = await client.execute(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  console.log("✅ Update result:", result); // Debug

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


