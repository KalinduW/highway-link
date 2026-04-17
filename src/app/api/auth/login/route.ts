import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
	try {
		const { email, password } = await req.json();

		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email and password are required" },
				{ status: 400 }
			);
		}

		// Find user by email
		const result = await db.select().from(users).where(eq(users.email, email));

		if (result.length === 0) {
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 }
			);
		}

		const user = result[0];

		// Check password
		const isValid = await bcrypt.compare(password, user.passwordHash);

		if (!isValid) {
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 }
			);
		}

		// Create JWT token
		const token = jwt.sign(
			{ userId: user.id, role: user.role, email: user.email },
			process.env.JWT_SECRET!,
			{ expiresIn: "7d" }
		);

		const response = NextResponse.json({
			message: "Login successful",
			user: {
				id: user.id,
				fullName: user.fullName,
				email: user.email,
				role: user.role,
			},
		});

		// Store token in cookie
		response.cookies.set("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 60 * 60 * 24 * 7, // 7 days
		});

		return response;
	} catch (error) {
		console.error("Login error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
