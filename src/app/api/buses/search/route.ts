import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schedules, routes, buses } from "@/db/schema";
import { eq, and, ilike } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const date = searchParams.get("date");

    if (!origin || !destination || !date) {
      return NextResponse.json(
        { error: "Origin, destination and date are required" },
        { status: 400 }
      );
    }

    const results = await db
      .select({
        scheduleId: schedules.id,
        departureTime: schedules.departureTime,
        arrivalTime: schedules.arrivalTime,
        fare: schedules.fare,
        status: schedules.status,
        busId: buses.id,
        licensePlate: buses.licensePlate,
        busType: buses.busType,
        totalSeats: buses.totalSeats,
        origin: routes.origin,
        destination: routes.destination,
        distance: routes.distance,
        duration: routes.duration,
      })
      .from(schedules)
      .innerJoin(buses, eq(schedules.busId, buses.id))
      .innerJoin(routes, eq(schedules.routeId, routes.id))
      .where(
        and(
          ilike(routes.origin, `%${origin}%`),
          ilike(routes.destination, `%${destination}%`)
        )
      );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
