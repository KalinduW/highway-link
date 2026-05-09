import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schedules, routes, buses, users, timeLogs } from "@/db/schema";
import { eq, and, ilike } from "drizzle-orm";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const email = searchParams.get("email");
		const date =
			searchParams.get("date") || new Date().toISOString().split("T")[0];

		if (!email) {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		// Get timekeeper details
		const timekeeper = await db
			.select()
			.from(users)
			.where(eq(users.email, email));

		if (timekeeper.length === 0) {
			return NextResponse.json(
				{ error: "Timekeeper not found" },
				{ status: 404 }
			);
		}

		const station = timekeeper[0].station;

		if (!station) {
			return NextResponse.json(
				{ error: "No station assigned" },
				{ status: 400 }
			);
		}

		// Get all schedules where origin or destination matches station
		const allSchedules = await db
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
			.where(eq(schedules.status, "scheduled"));

		// Filter schedules where origin or destination matches station
		const stationSchedules = allSchedules.filter(
			(s) =>
				s.origin.toLowerCase() === station.toLowerCase() ||
				s.destination.toLowerCase() === station.toLowerCase()
		);

		// Get existing time logs for these schedules
		const scheduleIds = stationSchedules.map((s) => s.scheduleId);
		const existingLogs: any[] = [];

		for (const scheduleId of scheduleIds) {
			const logs = await db
				.select({
					id: timeLogs.id,
					scheduleId: timeLogs.scheduleId,
					station: timeLogs.station,
					type: timeLogs.type,
					scheduledTime: timeLogs.scheduledTime,
					actualTime: timeLogs.actualTime,
					minutesLate: timeLogs.minutesLate,
					status: timeLogs.status,
					createdAt: timeLogs.createdAt,
					timekeeperName: users.fullName,
				})
				.from(timeLogs)
				.innerJoin(users, eq(timeLogs.timekeeperId, users.id))
				.where(eq(timeLogs.scheduleId, scheduleId));

			existingLogs.push(...logs);
		}

		return NextResponse.json({
			schedules: stationSchedules,
			timeLogs: existingLogs,
			station,
			timekeeperId: timekeeper[0].id,
		});
	} catch (error) {
		console.error("Timekeeper schedules error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
