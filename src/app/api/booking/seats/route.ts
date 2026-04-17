import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { seats, bookings, schedules } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const scheduleId = searchParams.get("scheduleId");

		if (!scheduleId) {
			return NextResponse.json(
				{ error: "Schedule ID is required" },
				{ status: 400 }
			);
		}

		// Get the schedule to find the bus
		const schedule = await db
			.select()
			.from(schedules)
			.where(eq(schedules.id, scheduleId));

		if (schedule.length === 0) {
			return NextResponse.json(
				{ error: "Schedule not found" },
				{ status: 404 }
			);
		}

		const busId = schedule[0].busId;

		// Get all seats for this bus
		const allSeats = await db
			.select()
			.from(seats)
			.where(eq(seats.busId, busId));

		// Get already booked seats for this schedule
		const bookedBookings = await db
			.select()
			.from(bookings)
			.where(
				and(
					eq(bookings.scheduleId, scheduleId),
					eq(bookings.bookingStatus, "confirmed")
				)
			);

		const bookedSeatIds = bookedBookings.map((b) => b.seatId);

		// Mark seats as booked or available
		const seatsWithStatus = allSeats.map((seat) => ({
			...seat,
			isBooked: bookedSeatIds.includes(seat.id),
		}));

		return NextResponse.json({ seats: seatsWithStatus });
	} catch (error) {
		console.error("Seats error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
