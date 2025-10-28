// models/userModel.ts
import { client } from "../db.ts";

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


// export const createUser = (user: User) => {
//     users.push(user);
//     return user;
// };

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
