"use server";

import { signupSchema, loginSchema } from "../schemas/authSchema";
import db from "../db/index";
import { users } from "../db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function signupAction(formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const parsed = signupSchema.safeParse({ username, email, password });
  if (!parsed.success) {
    throw new Error(JSON.stringify(parsed.error.flatten()));
  }

  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (existingUsers.length > 0) {
    throw new Error("Kullanıcı zaten mevcut");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    username,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign({ email }, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
  cookies().set("token", token, { httpOnly: true, path: "/" });

  return true;
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    throw new Error(JSON.stringify(parsed.error.flatten()));
  }

  const usersFound = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (usersFound.length === 0) {
    throw new Error("Kullanıcı bulunamadı");
  }

  const user = usersFound[0];
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error("Geçersiz kimlik bilgileri");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
  );
  cookies().set("token", token, { httpOnly: true, path: "/" });

  return true;
}

export async function requireAuth() {
  const token = cookies().get("token")?.value;
  if (!token) {
    throw new Error("Yetkisiz erişim");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded;
  } catch (error) {
    throw new Error("Token doğrulanamadı");
  }
}
