import { NextResponse } from "next/server";
import { db } from "@/db";
import { routes } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
	try {
		const allRoutes = await db
			.select({
				origin: routes.origin,
				destination: routes.destination,
			})
			.from(routes);

		// Collect all unique locations
		const locationSet = new Set<string>();
		allRoutes.forEach((route) => {
			locationSet.add(route.origin);
			locationSet.add(route.destination);
		});

		const locations = Array.from(locationSet).sort();

		return NextResponse.json({ locations });
	} catch (error) {
		console.error("Locations error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
