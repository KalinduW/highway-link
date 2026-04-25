import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schedules } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
	try {
		const { scheduleId, status } = await req.json();

		if (!scheduleId || !status) {
			return NextResponse.json(
				{ error: "Schedule ID and status are required" },
				{ status: 400 }
			);
		}

		const validStatuses = ["scheduled", "active", "completed", "cancelled"];
		if (!validStatuses.includes(status)) {
			return NextResponse.json({ error: "Invalid status" }, { status: 400 });
		}

		const updatedSchedule = await db
			.update(schedules)
			.set({ status })
			.where(eq(schedules.id, scheduleId))
			.returning();

		return NextResponse.json({
			message: "Trip status updated successfully",
			schedule: updatedSchedule[0],
		});
	} catch (error) {
		console.error("Update status error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
