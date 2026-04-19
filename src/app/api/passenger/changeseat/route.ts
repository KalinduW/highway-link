import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, seats, schedules } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
	try {
		const { bookingId, newSeatId } = await req.json();

		if (!bookingId || !newSeatId) {
			return NextResponse.json(
				{ error: "Booking ID and new seat ID are required" },
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
				{ error: "Cannot change seat for a cancelled booking" },
				{ status: 400 }
			);
		}

		// Check departure time - must be at least 2 hours away
		const schedule = await db
			.select()
			.from(schedules)
			.where(eq(schedules.id, booking.scheduleId));

		const departureTime = new Date(schedule[0].departureTime);
		const now = new Date();
		const hoursUntilDeparture =
			(departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

		if (hoursUntilDeparture < 2) {
			return NextResponse.json(
				{ error: "Cannot change seat less than 2 hours before departure" },
				{ status: 400 }
			);
		}

		// Check if new seat is already booked
		const seatAlreadyBooked = await db
			.select()
			.from(bookings)
			.where(
				and(
					eq(bookings.scheduleId, booking.scheduleId),
					eq(bookings.seatId, newSeatId),
					eq(bookings.bookingStatus, "confirmed")
				)
			);

		if (seatAlreadyBooked.length > 0) {
			return NextResponse.json(
				{ error: "This seat is already booked" },
				{ status: 400 }
			);
		}

		// Generate new QR code
		const newQrCode = `HL-${booking.passengerId}-${
			booking.scheduleId
		}-${newSeatId}-${Date.now()}`;

		// Update the booking with new seat
		const updatedBooking = await db
			.update(bookings)
			.set({
				seatId: newSeatId,
				qrCode: newQrCode,
			})
			.where(eq(bookings.id, bookingId))
			.returning();

		return NextResponse.json({
			message: "Seat changed successfully",
			booking: updatedBooking[0],
			newQrCode,
		});
	} catch (error) {
		console.error("Seat change error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
