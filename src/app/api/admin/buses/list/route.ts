import { NextResponse } from "next/server";
import { db } from "@/db";
import { buses } from "@/db/schema";

export async function GET() {
	try {
		const allBuses = await db
			.select({
				id: buses.id,
				licensePlate: buses.licensePlate,
				busType: buses.busType,
				totalSeats: buses.totalSeats,
			})
			.from(buses);

		return NextResponse.json({ buses: allBuses });
	} catch (error) {
		console.error("Bus list error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
