import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schedules, users } from "@/db/schema";

export async function POST(req: NextRequest) {
	try {
		const { busId, routeId, departureTime, arrivalTime, fare } =
			await req.json();

		// Get the first admin user from the database
		const adminUsers = await db.select().from(users).limit(1);

		if (adminUsers.length === 0) {
			return NextResponse.json(
				{ error: "No users found. Please register first." },
				{ status: 400 }
			);
		}

		const userId = adminUsers[0].id;

		const newSchedule = await db
			.insert(schedules)
			.values({
				busId,
				routeId,
				userId,
				departureTime: new Date(departureTime),
				arrivalTime: new Date(arrivalTime),
				fare,
				status: "scheduled",
			})
			.returning();

		return NextResponse.json(
			{ message: "Schedule added successfully", schedule: newSchedule[0] },
			{ status: 201 }
		);
	} catch (error) {
		console.error("Add schedule error:", error);
		return NextResponse.json(
			{ error: "Failed to add schedule" },
			{ status: 500 }
		);
	}
}
