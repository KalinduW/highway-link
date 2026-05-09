import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
	bookings,
	schedules,
	routes,
	buses,
	users,
	payments,
} from "@/db/schema";
import { eq, count, sql, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
	try {
		// Total bookings
		const totalBookings = await db.select({ count: count() }).from(bookings);

		// Confirmed bookings
		const confirmedBookings = await db
			.select({ count: count() })
			.from(bookings)
			.where(eq(bookings.bookingStatus, "confirmed"));

		// Cancelled bookings
		const cancelledBookings = await db
			.select({ count: count() })
			.from(bookings)
			.where(eq(bookings.bookingStatus, "cancelled"));

		// Total buses
		const totalBuses = await db.select({ count: count() }).from(buses);

		// Total routes
		const totalRoutes = await db.select({ count: count() }).from(routes);

		// Total users
		const totalUsers = await db.select({ count: count() }).from(users);

		// Total schedules
		const totalSchedules = await db.select({ count: count() }).from(schedules);

		// Bookings per route
		const bookingsPerRoute = await db
			.select({
				origin: routes.origin,
				destination: routes.destination,
				totalBookings: count(bookings.id),
			})
			.from(bookings)
			.innerJoin(schedules, eq(bookings.scheduleId, schedules.id))
			.innerJoin(routes, eq(schedules.routeId, routes.id))
			.groupBy(routes.origin, routes.destination);

		// Bookings per bus
		const bookingsPerBus = await db
			.select({
				licensePlate: buses.licensePlate,
				busType: buses.busType,
				totalBookings: count(bookings.id),
			})
			.from(bookings)
			.innerJoin(schedules, eq(bookings.scheduleId, schedules.id))
			.innerJoin(buses, eq(schedules.busId, buses.id))
			.groupBy(buses.licensePlate, buses.busType);

		// Revenue per route (fare x bookings)
		const revenuePerRoute = await db
			.select({
				origin: routes.origin,
				destination: routes.destination,
				fare: schedules.fare,
				bookingCount: count(bookings.id),
			})
			.from(bookings)
			.innerJoin(schedules, eq(bookings.scheduleId, schedules.id))
			.innerJoin(routes, eq(schedules.routeId, routes.id))
			.where(eq(bookings.bookingStatus, "confirmed"))
			.groupBy(routes.origin, routes.destination, schedules.fare);

		// Passengers only
		const totalPassengers = await db
			.select({ count: count() })
			.from(users)
			.where(eq(users.role, "passenger"));

		// Newly joined this week
		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

		const newThisWeek = await db
			.select({ count: count() })
			.from(users)
			.where(
				and(
					eq(users.role, "passenger"),
					sql`${users.createdAt} >= ${oneWeekAgo}`
				)
			);

		// Newly joined this month
		const oneMonthAgo = new Date();
		oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

		const newThisMonth = await db
			.select({ count: count() })
			.from(users)
			.where(
				and(
					eq(users.role, "passenger"),
					sql`${users.createdAt} >= ${oneMonthAgo}`
				)
			);

		// Recently joined passengers
		const recentPassengers = await db
			.select({
				id: users.id,
				fullName: users.fullName,
				email: users.email,
				phone: users.phone,
				createdAt: users.createdAt,
			})
			.from(users)
			.where(eq(users.role, "passenger"))
			.limit(10);

		return NextResponse.json({
			stats: {
				totalBookings: totalBookings[0].count,
				confirmedBookings: confirmedBookings[0].count,
				cancelledBookings: cancelledBookings[0].count,
				totalBuses: totalBuses[0].count,
				totalRoutes: totalRoutes[0].count,
				totalUsers: totalUsers[0].count,
				totalSchedules: totalSchedules[0].count,
				totalPassengers: totalPassengers[0].count,
				newThisWeek: newThisWeek[0].count,
				newThisMonth: newThisMonth[0].count,
			},
			bookingsPerRoute,
			bookingsPerBus,
			revenuePerRoute,
			recentPassengers,
		});
	} catch (error) {
		console.error("Reports error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
