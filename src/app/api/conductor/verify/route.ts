import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, users, seats } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
	try {
		const { qrCode } = await req.json();

		if (!qrCode) {
			return NextResponse.json(
				{ valid: false, message: "QR code is required" },
				{ status: 400 }
			);
		}

		// Find booking by QR code
		const booking = await db
			.select()
			.from(bookings)
			.where(eq(bookings.qrCode, qrCode));

		if (booking.length === 0) {
			return NextResponse.json({
				valid: false,
				message: "Ticket not found. This QR code is invalid.",
			});
		}

		const bookingData = booking[0];

		if (bookingData.bookingStatus === "cancelled") {
			return NextResponse.json({
				valid: false,
				message: "This ticket has been cancelled.",
			});
		}

		if (bookingData.bookingStatus !== "confirmed") {
			return NextResponse.json({
				valid: false,
				message: "This ticket is not confirmed.",
			});
		}

		// Get passenger details
		const passenger = await db
			.select()
			.from(users)
			.where(eq(users.id, bookingData.passengerId));

		// Get seat details
		const seat = await db
			.select()
			.from(seats)
			.where(eq(seats.id, bookingData.seatId));

		return NextResponse.json({
			valid: true,
			message: "Ticket is valid. Passenger may board.",
			passenger: {
				fullName: passenger[0].fullName,
				email: passenger[0].email,
				phone: passenger[0].phone,
			},
			booking: {
				id: bookingData.id,
				seatNumber: seat[0].seatNumber,
				bookingStatus: bookingData.bookingStatus,
				bookingTime: bookingData.bookingTime,
			},
		});
	} catch (error) {
		console.error("Verify error:", error);
		return NextResponse.json(
			{ valid: false, message: "Internal server error" },
			{ status: 500 }
		);
	}
}
