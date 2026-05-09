import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { timeLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
	try {
		const { logId } = await req.json();

		if (!logId) {
			return NextResponse.json(
				{ error: "Log ID is required" },
				{ status: 400 }
			);
		}

		// Get the log
		const log = await db.select().from(timeLogs).where(eq(timeLogs.id, logId));

		if (log.length === 0) {
			return NextResponse.json({ error: "Log not found" }, { status: 404 });
		}

		const logData = log[0];
		const now = new Date();
		const minutesSinceMarked =
			(now.getTime() - new Date(logData.createdAt!).getTime()) / (1000 * 60);

		// Check 3 minute window
		if (minutesSinceMarked > 3) {
			return NextResponse.json(
				{
					error: `Cannot undo — the 3 minute undo window has passed. This mark was made ${Math.floor(
						minutesSinceMarked
					)} minutes ago.`,
				},
				{ status: 400 }
			);
		}

		// Delete the log
		await db.delete(timeLogs).where(eq(timeLogs.id, logId));

		return NextResponse.json({
			message: "Mark undone successfully",
		});
	} catch (error) {
		console.error("Undo error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
