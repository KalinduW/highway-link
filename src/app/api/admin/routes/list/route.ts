import { NextResponse } from "next/server";
import { db } from "@/db";
import { routes } from "@/db/schema";

export async function GET() {
	try {
		const allRoutes = await db
			.select({
				id: routes.id,
				origin: routes.origin,
				destination: routes.destination,
				distance: routes.distance,
				duration: routes.duration,
			})
			.from(routes);

		return NextResponse.json({ routes: allRoutes });
	} catch (error) {
		console.error("Route list error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
