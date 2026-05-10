import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schedules, users, routes, buses } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
	try {
		const allSchedules = await db
			.select({
				id: schedules.id,
				departureTime: schedules.departureTime,
				arrivalTime: schedules.arrivalTime,
				fare: schedules.fare,
				status: schedules.status,
				scheduleType: schedules.scheduleType,
				isPaused: schedules.isPaused,
				recurringEndDate: schedules.recurringEndDate,
				origin: routes.origin,
				destination: routes.destination,
				licensePlate: buses.licensePlate,
				busType: buses.busType,
			})
			.from(schedules)
			.innerJoin(buses, eq(schedules.busId, buses.id))
			.innerJoin(routes, eq(schedules.routeId, routes.id));

		return NextResponse.json({ schedules: allSchedules });
	} catch (error) {
		console.error("Schedules error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const {
			busId,
			routeId,
			departureTime,
			arrivalTime,
			fare,
			scheduleType,
			recurringEndDate,
		} = await req.json();

		// Get the first admin user
		const adminUsers = await db.select().from(users).limit(1);
		if (adminUsers.length === 0) {
			return NextResponse.json({ error: "No users found" }, { status: 400 });
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
				scheduleType: scheduleType || "one_time",
				recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : null,
				isPaused: 0,
			})
			.returning();

		return NextResponse.json({
			message: "Schedule added successfully",
			schedule: newSchedule[0],
		});
	} catch (error) {
		console.error("Add schedule error:", error);
		return NextResponse.json(
			{ error: "Failed to add schedule" },
			{ status: 500 }
		);
	}
}

export async function PATCH(req: NextRequest) {
	try {
		const { scheduleId, isPaused } = await req.json();

		const updated = await db
			.update(schedules)
			.set({ isPaused: isPaused ? 1 : 0 })
			.where(eq(schedules.id, scheduleId))
			.returning();

		return NextResponse.json({
			message: isPaused ? "Schedule paused" : "Schedule resumed",
			schedule: updated[0],
		});
	} catch (error) {
		console.error("Pause schedule error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const scheduleId = searchParams.get("scheduleId");

		if (!scheduleId) {
			return NextResponse.json(
				{ error: "Schedule ID is required" },
				{ status: 400 }
			);
		}

		await db.delete(schedules).where(eq(schedules.id, scheduleId));

		return NextResponse.json({ message: "Schedule deleted successfully" });
	} catch (error) {
		console.error("Delete schedule error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
