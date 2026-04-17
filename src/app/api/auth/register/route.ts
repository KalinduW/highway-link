import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
	try {
		const { fullName, nic, email, phone, password, role } = await req.json();

		if (!fullName || !nic || !email || !phone || !password) {
			return NextResponse.json(
				{ error: "All fields are required" },
				{ status: 400 }
			);
		}

		// Check if email already exists
		const existing = await db
			.select()
			.from(users)
			.where(eq(users.email, email));

		if (existing.length > 0) {
			return NextResponse.json(
				{ error: "Email already registered" },
				{ status: 400 }
			);
		}

		// Hash the password
		const passwordHash = await bcrypt.hash(password, 10);

		// Insert new user
		const newUser = await db
			.insert(users)
			.values({
				fullName,
				nic,
				email,
				phone,
				passwordHash,
				role: role || "passenger",
			})
			.returning();

		return NextResponse.json(
			{ message: "User registered successfully", user: newUser[0] },
			{ status: 201 }
		);
	} catch (error) {
		console.error("Register error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
