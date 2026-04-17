import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
	try {
		const { scheduleId, seatId, passengerEmail } = await req.json();

		if (!scheduleId || !seatId || !passengerEmail) {
			return NextResponse.json(
				{ error: "All fields are required" },
				{ status: 400 }
			);
		}

		// Find passenger by email
		const passenger = await db
			.select()
			.from(users)
			.where(eq(users.email, passengerEmail));

		if (passenger.length === 0) {
			return NextResponse.json(
				{ error: "Please login to book a seat" },
				{ status: 401 }
			);
		}

		const passengerId = passenger[0].id;

		// Check if seat is already booked
		const existingBooking = await db
			.select()
			.from(bookings)
			.where(
				and(
					eq(bookings.scheduleId, scheduleId),
					eq(bookings.seatId, seatId),
					eq(bookings.bookingStatus, "confirmed")
				)
			);

		if (existingBooking.length > 0) {
			return NextResponse.json(
				{ error: "This seat is already booked" },
				{ status: 400 }
			);
		}

		// Generate QR code data
		const qrCode = `HL-${passengerId}-${scheduleId}-${seatId}-${Date.now()}`;

		// Create booking
		const newBooking = await db
			.insert(bookings)
			.values({
				passengerId,
				scheduleId,
				seatId,
				qrCode,
				bookingStatus: "confirmed",
			})
			.returning();

		return NextResponse.json(
			{ message: "Booking confirmed!", booking: newBooking[0], qrCode },
			{ status: 201 }
		);
	} catch (error) {
		console.error("Booking error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
