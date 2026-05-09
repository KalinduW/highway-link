import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { buses, seats, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const email = searchParams.get("email");

		if (!email) {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		const owner = await db.select().from(users).where(eq(users.email, email));

		if (owner.length === 0) {
			return NextResponse.json({ error: "Owner not found" }, { status: 404 });
		}

		const ownerBuses = await db
			.select()
			.from(buses)
			.where(eq(buses.userId, owner[0].id));

		return NextResponse.json({ buses: ownerBuses });
	} catch (error) {
		console.error("Bus owner buses error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const { licensePlate, busType, totalSeats, email } = await req.json();

		if (!licensePlate || !busType || !totalSeats || !email) {
			return NextResponse.json(
				{ error: "All fields are required" },
				{ status: 400 }
			);
		}

		const owner = await db.select().from(users).where(eq(users.email, email));

		if (owner.length === 0) {
			return NextResponse.json({ error: "Owner not found" }, { status: 404 });
		}

		const newBus = await db
			.insert(buses)
			.values({
				licensePlate,
				busType: busType as "AC" | "non_AC" | "luxury",
				totalSeats: parseInt(totalSeats),
				userId: owner[0].id,
			})
			.returning();

		const busId = newBus[0].id;
		const total = parseInt(totalSeats);
		const seatRows = [];
		let seatNum = 1;

		// S1 front left window seat
		seatRows.push({
			busId,
			seatNumber: `S${seatNum}`,
			seatType: "window" as const,
			status: "available" as const,
		});
		seatNum++;

		const remainingSeats = total - 1;
		const hasLastRow = total >= 6;
		const lastRowSeats = 5;
		const regularSeats = hasLastRow
			? remainingSeats - lastRowSeats
			: remainingSeats;
		const regularRows = Math.floor(regularSeats / 4);

		for (let row = 0; row < regularRows; row++) {
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
					seatType: type as any,
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
