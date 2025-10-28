// db.ts
import { Client } from "https://deno.land/x/mysql/mod.ts";

export const client = await new Client().connect({
  hostname: "127.0.0.1",
  username: "root",
  db: "user_roles_permission",
  password: "nrb1234",
  port: 3306,
});
