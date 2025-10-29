// db.ts
import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

export const client = new Client();

await client.connect({
  hostname: "127.0.0.1",
  username: "root",
  password: "your_password",
  db: "user_roles_permission",
  port: 3306,
});

console.log("INFO connected to 127.0.0.1:3306");

// Export close function
export const closeConnection = async () => {
  await client.close();
  console.log("INFO connection closed");
};
