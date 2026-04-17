import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { buses, seats, users } from "@/db/schema";

export async function POST(req: NextRequest) {
	try {
		const { licensePlate, busType, totalSeats } = await req.json();

		// Get the first admin user from the database
		const adminUsers = await db.select().from(users).limit(1);

		if (adminUsers.length === 0) {
			return NextResponse.json(
				{ error: "No users found. Please register first." },
				{ status: 400 }
			);
		}

		const userId = adminUsers[0].id;

		const newBus = await db
			.insert(buses)
			.values({
				licensePlate,
				busType: busType as "AC" | "non_AC" | "luxury",
				totalSeats: parseInt(totalSeats),
				userId,
			})
			.returning();

		const busId = newBus[0].id;

		// Auto-create seats for this bus
		const seatRows = [];
		for (let i = 1; i <= parseInt(totalSeats); i++) {
			seatRows.push({
				busId,
				seatNumber: `S${i}`,
				seatType: i % 2 === 0 ? ("aisle" as const) : ("window" as const),
				status: "available" as const,
			});
		}
		await db.insert(seats).values(seatRows);

		return NextResponse.json(
			{ message: "Bus added successfully", bus: newBus[0] },
			{ status: 201 }
		);
	} catch (error) {
		console.error("Add bus error:", error);
		return NextResponse.json({ error: "Failed to add bus" }, { status: 500 });
	}
}
