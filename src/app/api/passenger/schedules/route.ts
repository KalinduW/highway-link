import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schedules, routes, buses } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
	try {
		const results = await db
			.select({
				scheduleId: schedules.id,
				departureTime: schedules.departureTime,
				arrivalTime: schedules.arrivalTime,
				fare: schedules.fare,
				status: schedules.status,
				origin: routes.origin,
				destination: routes.destination,
				busType: buses.busType,
				licensePlate: buses.licensePlate,
			})
			.from(schedules)
			.innerJoin(buses, eq(schedules.busId, buses.id))
			.innerJoin(routes, eq(schedules.routeId, routes.id));

		return NextResponse.json({ schedules: results });
	} catch (error) {
		console.error("Schedules error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
