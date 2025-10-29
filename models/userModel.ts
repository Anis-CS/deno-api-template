// models/userModel.ts
import { client } from "../db.ts";
import { encodeHex } from "https://deno.land/std@0.224.0/encoding/hex.ts";

export interface User {
  id?: number;
  name: string;
  email: string;
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
    const result = await client.query(
        "SELECT id, name, email FROM users WHERE id = ? LIMIT 1",
        [id]
    );
 
  if (result.length > 0) {
    const row = result[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
    };
  } else {
    return null; // user না পেলে null return করবে
  }
};

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return encodeHex(new Uint8Array(hashBuffer));
}

//json data insert
// export const createUser = async (userData: { name: string; email: string; password: string }) => {
//   const hashedPassword = await hashPassword(userData.password);
  
//   const result = await client.execute(
//     `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
//     [userData.name, userData.email, hashedPassword]
//   );
  
//   return {
//     id: result.lastInsertId,
//     name: userData.name,
//     email: userData.email,
//   };
// };

//form data insert start
// export const createUser = async (userData: { 
//   name: string; 
//   email: string; 
//   password: string;
// }) => {
//   const result = await client.execute(
//     `INSERT INTO users (name, email, password ) VALUES (?, ?, ?)`,
//     [userData.name, userData.email, userData.password ]
//   );
  
//   return {
//     id: result.lastInsertId,
//     name: userData.name,
//     email: userData.email,
//   };
// };
//form data insert end

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


// export const updateUser = (id: number, data: Partial<User>) => {
//     const index = users.findIndex((u) => u.id === id);
//     if(index === -1) return null;
//     users[index] = {...users[index], ...data };
//     return users[index];
// };

// export const deletedUser = (id: number) => {
//     const index = users.findIndex((u) => u.id === id);
//     if(index === -1) return null;
//     return users.splice(index, 1)[0];
// };
