import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { buses, seats, users } from "@/db/schema";

export async function POST(req: NextRequest) {
	try {
		const { licensePlate, busType, totalSeats } = await req.json();

		const adminUsers = await db.select().from(users).limit(1);

		if (adminUsers.length === 0) {
			return NextResponse.json(
				{ error: "No users found. Please register first." },
				{ status: 400 }
			);
		}

		const userId = adminUsers[0].id;

		const newBus = await db
			.insert(buses)
			.values({
				licensePlate,
				busType: busType as "AC" | "non_AC" | "luxury",
				totalSeats: parseInt(totalSeats),
				userId,
			})
			.returning();

		const busId = newBus[0].id;
		const total = parseInt(totalSeats);

		// Generate seats based on correct bus layout
		// S1 = front left window seat (next to driver)
		// Then rows of 4 (2+2): W, A, A, W
		// Last row = 5 seats: W, M, M, M, W

		const seatRows = [];
		let seatNum = 1;

		// S1 — front left seat (window)
		seatRows.push({
			busId,
			seatNumber: `S${seatNum}`,
			seatType: "window" as const,
			status: "available" as const,
		});
		seatNum++;

		// Calculate how many regular rows and if there's a last row of 5
		const remainingSeats = total - 1; // minus S1
		const hasLastRow = total >= 6;
		const lastRowSeats = 5;
		const regularSeats = hasLastRow
			? remainingSeats - lastRowSeats
			: remainingSeats;
		const regularRows = Math.floor(regularSeats / 4);

		// Regular rows — 2+2 layout
		for (let row = 0; row < regularRows; row++) {
			// Left side
			seatRows.push({
				busId,
				seatNumber: `S${seatNum}`,
				seatType: "window" as const,
				status: "available" as const,
			});
			seatNum++;

			seatRows.push({
				busId,
				seatNumber: `S${seatNum}`,
				seatType: "aisle" as const,
				status: "available" as const,
			});
			seatNum++;

			// Right side
			seatRows.push({
				busId,
				seatNumber: `S${seatNum}`,
				seatType: "aisle" as const,
				status: "available" as const,
			});
			seatNum++;

			seatRows.push({
				busId,
				seatNumber: `S${seatNum}`,
				seatType: "window" as const,
				status: "available" as const,
			});
			seatNum++;
		}

		// Last row — 5 seats: W, M, M, M, W
		if (hasLastRow) {
			const lastRowTypes: ("window" | "aisle" | "middle")[] = [
				"window",
				"middle",
				"middle",
				"middle",
				"window",
			];
			for (const type of lastRowTypes) {
				seatRows.push({
					busId,
					seatNumber: `S${seatNum}`,
					seatType: type,
					status: "available" as const,
				});
				seatNum++;
			}
		}

		await db.insert(seats).values(seatRows);

		return NextResponse.json(
			{ message: "Bus added successfully", bus: newBus[0] },
			{ status: 201 }
		);
	} catch (error) {
		console.error("Add bus error:", error);
		return NextResponse.json({ error: "Failed to add bus" }, { status: 500 });
	}
}
