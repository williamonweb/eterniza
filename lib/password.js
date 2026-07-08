import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export async function hashPassword(password) {
  return bcrypt.hash(String(password), SALT_ROUNDS);
}

export async function verifyPassword(password, hashedPassword) {
  if (!password || !hashedPassword) return false;
  return bcrypt.compare(String(password), String(hashedPassword));
}