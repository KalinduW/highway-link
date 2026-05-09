import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
	timeLogs,
	schedules,
	users,
	passengerNotifications,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
	try {
		const { scheduleId, type, email } = await req.json();

		if (!scheduleId || !type || !email) {
			return NextResponse.json(
				{ error: "Schedule ID, type and email are required" },
				{ status: 400 }
			);
		}

		// Get timekeeper
		const timekeeper = await db
			.select()
			.from(users)
			.where(eq(users.email, email));

		if (timekeeper.length === 0) {
			return NextResponse.json(
				{ error: "Timekeeper not found" },
				{ status: 404 }
			);
		}

		const timekeeperData = timekeeper[0];
		const station = timekeeperData.station;

		if (!station) {
			return NextResponse.json(
				{ error: "No station assigned" },
				{ status: 400 }
			);
		}

		// Get schedule details
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

		const scheduleData = schedule[0];
		const now = new Date();

		// Determine scheduled time based on type
		const scheduledTime =
			type === "departure"
				? new Date(scheduleData.departureTime)
				: new Date(scheduleData.arrivalTime);

		// Calculate minutes late
		const minutesLate = Math.floor(
			(now.getTime() - scheduledTime.getTime()) / (1000 * 60)
		);

		// Determine status
		let status: "on_time" | "late" | "very_late" = "on_time";
		if (minutesLate >= 10) {
			status = "very_late";
		} else if (minutesLate >= 5) {
			status = "late";
		}

		// Check if already marked
		const existingLog = await db
			.select()
			.from(timeLogs)
			.where(
				and(
					eq(timeLogs.scheduleId, scheduleId),
					eq(timeLogs.station, station),
					eq(timeLogs.type, type)
				)
			);

		if (existingLog.length > 0) {
			return NextResponse.json(
				{ error: `Bus has already been marked as ${type} from ${station}` },
				{ status: 400 }
			);
		}

		// Create time log
		const newLog = await db
			.insert(timeLogs)
			.values({
				scheduleId,
				timekeeperId: timekeeperData.id,
				station,
				type,
				scheduledTime,
				actualTime: now,
				minutesLate: Math.max(0, minutesLate),
				status,
			})
			.returning();

		// Send notification to conductor and driver
		const notificationMessage =
			type === "departure"
				? `Your bus has been marked as departed from ${station} at ${now.toLocaleTimeString(
						"en-US",
						{ hour: "2-digit", minute: "2-digit" }
				  )}${minutesLate >= 5 ? ` (${minutesLate} minutes late)` : ""}`
				: `Your bus has been marked as arrived at ${station} at ${now.toLocaleTimeString(
						"en-US",
						{ hour: "2-digit", minute: "2-digit" }
				  )}${minutesLate >= 5 ? ` (${minutesLate} minutes late)` : ""}`;

		// Notify driver
		if (scheduleData.userId) {
			await db.insert(passengerNotifications).values({
				userId: scheduleData.userId,
				title: type === "departure" ? "🚌 Bus Departed" : "✅ Bus Arrived",
				message: notificationMessage,
				type: minutesLate >= 5 ? "warning" : "info",
			});
		}

		// Notify conductor
		if (scheduleData.conductorId) {
			await db.insert(passengerNotifications).values({
				userId: scheduleData.conductorId,
				title: type === "departure" ? "🚌 Bus Departed" : "✅ Bus Arrived",
				message: notificationMessage,
				type: minutesLate >= 5 ? "warning" : "info",
			});
		}

		return NextResponse.json({
			message: `Bus marked as ${type} successfully`,
			log: newLog[0],
			minutesLate: Math.max(0, minutesLate),
			status,
		});
	} catch (error) {
		console.error("Mark time error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
