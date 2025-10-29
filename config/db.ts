// config/db.ts
import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

const client = await new Client().connect({
  hostname: "localhost",
  username: "root",
  password: "nrb1234",
  db: "user_roles_permission",
  port: 3306,
});

// console.log("✅ MySQL Database connected successfully");

export { client };
export { client as db };