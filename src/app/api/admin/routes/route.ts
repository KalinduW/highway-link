import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { routes } from "@/db/schema";

export async function POST(req: NextRequest) {
	try {
		const { origin, destination, distance, duration } = await req.json();

		const newRoute = await db
			.insert(routes)
			.values({
				origin,
				destination,
				distance,
				duration,
			})
			.returning();

		return NextResponse.json(
			{ message: "Route added successfully", route: newRoute[0] },
			{ status: 201 }
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Failed to add route" }, { status: 500 });
	}
}
