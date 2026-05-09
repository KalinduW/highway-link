import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { buses, schedules, routes, bookings, seats, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const email = searchParams.get("email");

		if (!email) {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		// Get bus owner
		const owner = await db.select().from(users).where(eq(users.email, email));

		if (owner.length === 0) {
			return NextResponse.json({ error: "Owner not found" }, { status: 404 });
		}

		const ownerId = owner[0].id;

		// Get all buses owned by this owner
		const ownerBuses = await db
			.select()
			.from(buses)
			.where(eq(buses.userId, ownerId));

		const busIds = ownerBuses.map((b) => b.id);

		// Get schedules for owner's buses
		const ownerSchedules = [];
		for (const busId of busIds) {
			const busSchedules = await db
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
				.where(eq(schedules.busId, busId));
			ownerSchedules.push(...busSchedules);
		}

		// Get bookings for owner's buses
		let totalBookings = 0;
		let confirmedBookings = 0;
		let totalRevenue = 0;

		for (const schedule of ownerSchedules) {
			const scheduleBookings = await db
				.select()
				.from(bookings)
				.where(eq(bookings.scheduleId, schedule.scheduleId));

			totalBookings += scheduleBookings.length;
			const confirmed = scheduleBookings.filter(
				(b) => b.bookingStatus === "confirmed"
			);
			confirmedBookings += confirmed.length;
			totalRevenue += confirmed.length * parseFloat(schedule.fare);
		}

		return NextResponse.json({
			owner: {
				id: owner[0].id,
				fullName: owner[0].fullName,
				email: owner[0].email,
			},
			buses: ownerBuses,
			schedules: ownerSchedules,
			stats: {
				totalBuses: ownerBuses.length,
				totalSchedules: ownerSchedules.length,
				totalBookings,
				confirmedBookings,
				totalRevenue,
			},
		});
	} catch (error) {
		console.error("Bus owner overview error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
