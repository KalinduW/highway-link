import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schedules, routes, buses } from "@/db/schema";
import { eq, and, ilike, or } from "drizzle-orm";

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

		const searchDate = new Date(date);

		// Get all schedules for this route
		const allSchedules = await db
			.select({
				scheduleId: schedules.id,
				departureTime: schedules.departureTime,
				arrivalTime: schedules.arrivalTime,
				fare: schedules.fare,
				status: schedules.status,
				scheduleType: schedules.scheduleType,
				isPaused: schedules.isPaused,
				recurringEndDate: schedules.recurringEndDate,
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
					ilike(routes.destination, `%${destination}%`),
					eq(schedules.isPaused, 0)
				)
			);

		// Filter by date — include one-time schedules on the exact date
		// and recurring schedules that are still active
		const results = allSchedules.filter((schedule) => {
			if (schedule.scheduleType === "one_time") {
				// Check if departure date matches search date
				const depDate = new Date(schedule.departureTime);
				return (
					depDate.getFullYear() === searchDate.getFullYear() &&
					depDate.getMonth() === searchDate.getMonth() &&
					depDate.getDate() === searchDate.getDate()
				);
			} else if (schedule.scheduleType === "recurring") {
				// Check if search date is after or on the schedule start date
				const startDate = new Date(schedule.departureTime);
				const isAfterStart =
					searchDate >=
					new Date(
						startDate.getFullYear(),
						startDate.getMonth(),
						startDate.getDate()
					);

				// Check if search date is before end date (if set)
				const isBeforeEnd = schedule.recurringEndDate
					? searchDate <= new Date(schedule.recurringEndDate)
					: true;

				return isAfterStart && isBeforeEnd;
			}
			return false;
		});

		// For recurring schedules, adjust the departure and arrival times
		// to match the search date while keeping the same time
		const adjustedResults = results.map((schedule) => {
			if (schedule.scheduleType === "recurring") {
				const originalDep = new Date(schedule.departureTime);
				const originalArr = new Date(schedule.arrivalTime);

				// Set the date to search date but keep the time
				const adjustedDep = new Date(searchDate);
				adjustedDep.setHours(
					originalDep.getHours(),
					originalDep.getMinutes(),
					0,
					0
				);

				const adjustedArr = new Date(searchDate);
				adjustedArr.setHours(
					originalArr.getHours(),
					originalArr.getMinutes(),
					0,
					0
				);

				// If arrival is before departure, it means it arrives next day
				if (adjustedArr <= adjustedDep) {
					adjustedArr.setDate(adjustedArr.getDate() + 1);
				}

				return {
					...schedule,
					departureTime: adjustedDep.toISOString(),
					arrivalTime: adjustedArr.toISOString(),
				};
			}
			return schedule;
		});

		return NextResponse.json({ results: adjustedResults });
	} catch (error) {
		console.error("Search error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
