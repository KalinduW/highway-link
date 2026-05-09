import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, inviteLinks } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
	try {
		const { fullName, nic, email, phone, password, role, token } =
			await req.json();

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

		const passwordHash = await bcrypt.hash(password, 10);
		let assignedRole = "passenger";
		let assignedStation = null;

		// If invite token provided, validate and use it
		if (token) {
			const invite = await db
				.select()
				.from(inviteLinks)
				.where(eq(inviteLinks.token, token));

			if (invite.length === 0) {
				return NextResponse.json(
					{ error: "Invalid invite link" },
					{ status: 400 }
				);
			}

			const inviteData = invite[0];

			if (inviteData.isUsed === 1) {
				return NextResponse.json(
					{ error: "This invite link has already been used" },
					{ status: 400 }
				);
			}

			if (new Date() > new Date(inviteData.expiresAt)) {
				return NextResponse.json(
					{ error: "This invite link has expired" },
					{ status: 400 }
				);
			}

			assignedRole = inviteData.role;
			assignedStation = inviteData.station;
		}

		// Insert new user
		const newUser = await db
			.insert(users)
			.values({
				fullName,
				nic,
				email,
				phone,
				passwordHash,
				role: assignedRole as any,
				station: assignedStation,
			})
			.returning();

		// Mark invite as used if token was provided
		if (token) {
			await db
				.update(inviteLinks)
				.set({
					isUsed: 1,
					usedBy: newUser[0].id,
				})
				.where(eq(inviteLinks.token, token));
		}

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
