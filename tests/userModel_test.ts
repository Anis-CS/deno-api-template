// tests/userModel_test.ts
import { 
  assertEquals, 
  assertExists 
} from "https://deno.land/std@0.203.0/testing/asserts.ts";

import { 
  createUser, 
  getAllUsers, 
  getUserById,
  updateUser,
  deleteUser
} from "../models/userModel.ts";

// ✅ Test getAllUsers
Deno.test("should get all users", async () => {
  const users = await getAllUsers();
  assertExists(users);
  assertEquals(Array.isArray(users), true);
});

// ✅ Test createUser (without image)
Deno.test("should create a new user without image", async () => {
  const newUser = { 
    name: "Test User", 
    email: `test${Date.now()}@example.com`,
    password: "test1234" 
  };
  
  const result = await createUser(newUser);
  
  assertExists(result.id);
  assertEquals(result.name, newUser.name);
  assertEquals(result.email, newUser.email);
});

// ✅ Test createUser (with image)
Deno.test("should create a new user with image", async () => {
  const newUser = { 
    name: "Test User With Image", 
    email: `testimage${Date.now()}@example.com`,
    password: "test1234",
    image: "/uploads/test-image.png"
  };
  
  const result = await createUser(newUser);
  
  assertExists(result.id);
  assertEquals(result.name, newUser.name);
  assertEquals(result.email, newUser.email);
  assertEquals(result.image, newUser.image);
});

// ✅ Test getUserById
Deno.test("should return user by id", async () => {
  // First create a user
  const newUser = await createUser({
    name: "Find Me",
    email: `findme${Date.now()}@example.com`,
    password: "password123"
  });

  // Then find by id
  const user = await getUserById(newUser.id!);
  assertExists(user);
  assertEquals(user?.name, "Find Me");
  assertEquals(user?.email, newUser.email);
});

// ✅ Test getUserById - not found
Deno.test("should return null for non-existent user", async () => {
  const user = await getUserById(999999);
  assertEquals(user, null);
});

// ✅ Test updateUser - name only
Deno.test("should update user name", async () => {
  // Create user first
  const newUser = await createUser({
    name: "Update Me",
    email: `updateme${Date.now()}@example.com`,
    password: "password123"
  });

  // Update the user name
  const updated = await updateUser(newUser.id!, { name: "Updated Name" });
  assertExists(updated);
  assertEquals(updated?.name, "Updated Name");
});

// ✅ Test updateUser - email only
Deno.test("should update user email", async () => {
  const newUser = await createUser({
    name: "Email Update Test",
    email: `emailtest${Date.now()}@example.com`,
    password: "password123"
  });

  const newEmail = `newemail${Date.now()}@example.com`;
  const updated = await updateUser(newUser.id!, { email: newEmail });
  
  assertExists(updated);
  assertEquals(updated?.email, newEmail);
});

// ✅ Test updateUser - with image
Deno.test("should update user with image", async () => {
  const newUser = await createUser({
    name: "Image Update Test",
    email: `imageupdate${Date.now()}@example.com`,
    password: "password123",
    image: "/uploads/old-image.png"
  });

  const newImagePath = "/uploads/new-image.png";
  const updated = await updateUser(newUser.id!, { 
    name: "Updated With Image",
    image: newImagePath 
  });
  
  assertExists(updated);
  assertEquals(updated?.name, "Updated With Image");
  assertEquals(updated?.image, newImagePath);
});

// ✅ Test updateUser - multiple fields
Deno.test("should update multiple user fields", async () => {
  const newUser = await createUser({
    name: "Multi Update",
    email: `multi${Date.now()}@example.com`,
    password: "password123"
  });

  const updates = {
    name: "Completely Updated",
    email: `updated${Date.now()}@example.com`
  };

  const updated = await updateUser(newUser.id!, updates);
  
  assertExists(updated);
  assertEquals(updated?.name, updates.name);
  assertEquals(updated?.email, updates.email);
});

// ✅ Test updateUser - non-existent user
Deno.test("should return null when updating non-existent user", async () => {
  const updated = await updateUser(999999, { name: "Ghost User" });
  assertEquals(updated, null);
});

// ✅ Test deleteUser
Deno.test("should delete user", async () => {
  // Create user first
  const newUser = await createUser({
    name: "Delete Me",
    email: `deleteme${Date.now()}@example.com`,
    password: "password123"
  });

  // Delete the user
  const deleted = await deleteUser(newUser.id!);
  assertEquals(deleted, true);

  // Verify deleted
  const user = await getUserById(newUser.id!);
  assertEquals(user, null);
});

// ✅ Test deleteUser - non-existent user
Deno.test("should return false when deleting non-existent user", async () => {
  const deleted = await deleteUser(999999);
  assertEquals(deleted, false);
});

// ✅ Test deleteUser - with image
Deno.test("should delete user with image", async () => {
  const newUser = await createUser({
    name: "Delete With Image",
    email: `deleteimage${Date.now()}@example.com`,
    password: "password123",
    image: "/uploads/delete-test.png"
  });

  const deleted = await deleteUser(newUser.id!);
  assertEquals(deleted, true);

  // Verify user is deleted
  const user = await getUserById(newUser.id!);
  assertEquals(user, null);
});