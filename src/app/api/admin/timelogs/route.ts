import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { timeLogs, schedules, routes, buses, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
	try {
		const allLogs = await db
			.select({
				id: timeLogs.id,
				type: timeLogs.type,
				station: timeLogs.station,
				scheduledTime: timeLogs.scheduledTime,
				actualTime: timeLogs.actualTime,
				minutesLate: timeLogs.minutesLate,
				status: timeLogs.status,
				createdAt: timeLogs.createdAt,
				timekeeperName: users.fullName,
				origin: routes.origin,
				destination: routes.destination,
				licensePlate: buses.licensePlate,
				busType: buses.busType,
			})
			.from(timeLogs)
			.innerJoin(users, eq(timeLogs.timekeeperId, users.id))
			.innerJoin(schedules, eq(timeLogs.scheduleId, schedules.id))
			.innerJoin(buses, eq(schedules.busId, buses.id))
			.innerJoin(routes, eq(schedules.routeId, routes.id));

		return NextResponse.json({ logs: allLogs });
	} catch (error) {
		console.error("Time logs error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
