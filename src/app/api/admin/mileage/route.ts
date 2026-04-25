import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { buses, schedules, routes } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";

export async function GET() {
	try {
		// Get mileage per bus based on completed trips
		const mileageData = await db
			.select({
				busId: buses.id,
				licensePlate: buses.licensePlate,
				busType: buses.busType,
				totalSeats: buses.totalSeats,
				totalMileage: buses.totalMileage,
				completedTrips: count(schedules.id),
			})
			.from(buses)
			.leftJoin(
				schedules,
				sql`${schedules.busId} = ${buses.id} AND ${schedules.status} = 'completed'`
			)
			.groupBy(
				buses.id,
				buses.licensePlate,
				buses.busType,
				buses.totalSeats,
				buses.totalMileage
			);

		return NextResponse.json({ mileageData });
	} catch (error) {
		console.error("Mileage error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const { busId, mileage } = await req.json();

		if (!busId || mileage === undefined) {
			return NextResponse.json(
				{ error: "Bus ID and mileage are required" },
				{ status: 400 }
			);
		}

		// Get current mileage
		const bus = await db.select().from(buses).where(eq(buses.id, busId));

		if (bus.length === 0) {
			return NextResponse.json({ error: "Bus not found" }, { status: 404 });
		}

		// Update mileage
		const updatedBus = await db
			.update(buses)
			.set({
				totalMileage: (bus[0].totalMileage || 0) + parseInt(mileage),
			})
			.where(eq(buses.id, busId))
			.returning();

		return NextResponse.json({
			message: "Mileage updated successfully",
			bus: updatedBus[0],
		});
	} catch (error) {
		console.error("Update mileage error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
