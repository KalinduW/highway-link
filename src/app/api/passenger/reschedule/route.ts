import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, schedules } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
	try {
		const { bookingId, newScheduleId } = await req.json();

		if (!bookingId || !newScheduleId) {
			return NextResponse.json(
				{ error: "Booking ID and new schedule ID are required" },
				{ status: 400 }
			);
		}

		// Get the existing booking
		const existingBooking = await db
			.select()
			.from(bookings)
			.where(eq(bookings.id, bookingId));

		if (existingBooking.length === 0) {
			return NextResponse.json({ error: "Booking not found" }, { status: 404 });
		}

		const booking = existingBooking[0];

		if (booking.bookingStatus === "cancelled") {
			return NextResponse.json(
				{ error: "Cannot reschedule a cancelled booking" },
				{ status: 400 }
			);
		}

		// Get the new schedule to check departure time
		const newSchedule = await db
			.select()
			.from(schedules)
			.where(eq(schedules.id, newScheduleId));

		if (newSchedule.length === 0) {
			return NextResponse.json(
				{ error: "New schedule not found" },
				{ status: 404 }
			);
		}

		// Check if departure is at least 2 hours away
		const departureTime = new Date(newSchedule[0].departureTime);
		const now = new Date();
		const hoursUntilDeparture =
			(departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

		if (hoursUntilDeparture < 2) {
			return NextResponse.json(
				{ error: "Cannot reschedule less than 2 hours before departure" },
				{ status: 400 }
			);
		}

		// Update the booking with new schedule
		const updatedBooking = await db
			.update(bookings)
			.set({
				scheduleId: newScheduleId,
				bookingStatus: "rescheduled",
			})
			.where(eq(bookings.id, bookingId))
			.returning();

		return NextResponse.json({
			message: "Booking rescheduled successfully",
			booking: updatedBooking[0],
		});
	} catch (error) {
		console.error("Reschedule error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
