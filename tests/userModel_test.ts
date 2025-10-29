// tests/userModel_test.ts
import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { createUser,
  // deletedUser, 
  getAllUsers, 
  getUserById,
  //  updateUser,
    User } from "../models/userModel.ts";

// প্রতিটি test এর আগে users array reset করার জন্য
let initialUsers: User[];

Deno.test("setup: save initial users", () => {
  initialUsers = getAllUsers().map(u => ({ ...u })); // deep copy
});

// ✅ Test createUser
Deno.test("should create a new user", () => {
  const newUser: User = { id: 999, name: "Test User", email: "test@example.com" };
  const result = createUser(newUser);

  // createUser ঠিক কাজ করছে কি না যাচাই
  assertEquals(result, newUser);

  // getAllUsers এ নতুন user যুক্ত হয়েছে কি না
  const allUsers = getAllUsers();
  assertEquals(allUsers.includes(newUser), true);
});

// ✅ Test getUserById
Deno.test("should return user by id", () => {
  const user = getUserById(1);
  assertEquals(user?.name, "Anis");
});

// ✅ Test updateUser
Deno.test("should update user", () => {
  const updated = updateUser(1, { name: "Updated Name" });
  assertEquals(updated?.name, "Updated Name");

  // updateUser non-existent id
  const notFound = updateUser(12345, { name: "No User" });
  assertEquals(notFound, null);
});

// deleted user 
Deno.test("should delete user", () => {
  const deleted = deletedUser(1);
  assertEquals(deleted?.id, 1); // verify correct user deleted

  const notFound = deletedUser(12345); // non-existent
  assertEquals(notFound, null);
});

// ✅ Optional: reset users after tests (prevent interference)
Deno.test("cleanup: reset users", () => {
  const users = getAllUsers();
  users.length = 0;
  initialUsers.forEach(u => users.push(u));
});


