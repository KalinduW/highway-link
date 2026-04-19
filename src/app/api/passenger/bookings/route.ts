import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const email = searchParams.get("email");

		if (!email) {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		// Find user by email
		const user = await db.select().from(users).where(eq(users.email, email));

		if (user.length === 0) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Get all bookings for this user
		const userBookings = await db
			.select()
			.from(bookings)
			.where(eq(bookings.passengerId, user[0].id));

		return NextResponse.json({ bookings: userBookings });
	} catch (error) {
		console.error("Bookings error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
