import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, schedules } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
	try {
		const { bookingId } = await req.json();

		if (!bookingId) {
			return NextResponse.json(
				{ error: "Booking ID is required" },
				{ status: 400 }
			);
		}

		// Get the booking
		const existingBooking = await db
			.select()
			.from(bookings)
			.where(eq(bookings.id, bookingId));

		if (existingBooking.length === 0) {
			return NextResponse.json({ error: "Booking not found" }, { status: 404 });
		}

		const booking = existingBooking[0];

		// Check if already cancelled
		if (booking.bookingStatus === "cancelled") {
			return NextResponse.json(
				{ error: "Booking is already cancelled" },
				{ status: 400 }
			);
		}

		// Get schedule to check departure time
		const schedule = await db
			.select()
			.from(schedules)
			.where(eq(schedules.id, booking.scheduleId));

		if (schedule.length === 0) {
			return NextResponse.json(
				{ error: "Schedule not found" },
				{ status: 404 }
			);
		}

		// Check if departure is at least 2 hours away
		const departureTime = new Date(schedule[0].departureTime);
		const now = new Date();
		const hoursUntilDeparture =
			(departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

		if (hoursUntilDeparture < 2) {
			return NextResponse.json(
				{ error: "Cannot cancel less than 2 hours before departure" },
				{ status: 400 }
			);
		}

		// Cancel the booking
		const updatedBooking = await db
			.update(bookings)
			.set({ bookingStatus: "cancelled" })
			.where(eq(bookings.id, bookingId))
			.returning();

		return NextResponse.json({
			message: "Booking cancelled successfully",
			booking: updatedBooking[0],
		});
	} catch (error) {
		console.error("Cancel error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
