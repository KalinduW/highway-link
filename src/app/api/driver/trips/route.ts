import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schedules, routes, buses, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const email = searchParams.get("email");

		if (!email) {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		// Find driver by email
		const driver = await db.select().from(users).where(eq(users.email, email));

		if (driver.length === 0) {
			return NextResponse.json({ error: "Driver not found" }, { status: 404 });
		}

		const driverId = driver[0].id;

		// Get all trips assigned to this driver
		const trips = await db
			.select({
				scheduleId: schedules.id,
				departureTime: schedules.departureTime,
				arrivalTime: schedules.arrivalTime,
				fare: schedules.fare,
				status: schedules.status,
				origin: routes.origin,
				destination: routes.destination,
				distance: routes.distance,
				duration: routes.duration,
				licensePlate: buses.licensePlate,
				busType: buses.busType,
				totalSeats: buses.totalSeats,
			})
			.from(schedules)
			.innerJoin(buses, eq(schedules.busId, buses.id))
			.innerJoin(routes, eq(schedules.routeId, routes.id))
			.where(eq(schedules.userId, driverId));

		return NextResponse.json({ trips });
	} catch (error) {
		console.error("Driver trips error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
