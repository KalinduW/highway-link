"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Stats {
	totalBookings: number;
	confirmedBookings: number;
	cancelledBookings: number;
	totalBuses: number;
	totalRoutes: number;
	totalUsers: number;
	totalSchedules: number;
}

interface RouteBooking {
	origin: string;
	destination: string;
	totalBookings: number;
}

interface BusBooking {
	licensePlate: string;
	busType: string;
	totalBookings: number;
}

interface RevenueRoute {
	origin: string;
	destination: string;
	fare: string;
	bookingCount: number;
}

export default function ReportsPage() {
	const router = useRouter();
	const [stats, setStats] = useState<Stats | null>(null);
	const [bookingsPerRoute, setBookingsPerRoute] = useState<RouteBooking[]>([]);
	const [bookingsPerBus, setBookingsPerBus] = useState<BusBooking[]>([]);
	const [revenuePerRoute, setRevenuePerRoute] = useState<RevenueRoute[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchReports = async () => {
			try {
				const res = await fetch("/api/admin/reports");
				const data = await res.json();
				if (res.ok) {
					setStats(data.stats);
					setBookingsPerRoute(data.bookingsPerRoute);
					setBookingsPerBus(data.bookingsPerBus);
					setRevenuePerRoute(data.revenuePerRoute);
				}
			} catch {
				console.error("Failed to load reports");
			} finally {
				setLoading(false);
			}
		};
		fetchReports();
	}, []);

	const calculateRevenue = (fare: string, count: number) => {
		return (parseFloat(fare) * count).toLocaleString("en-US");
	};

	const totalRevenue = revenuePerRoute.reduce((acc, r) => {
		return acc + parseFloat(r.fare) * r.bookingCount;
	}, 0);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Navbar */}
			<nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
				<Link href="/" className="text-2xl font-bold text-blue-600">
					HighwayLink
				</Link>
				<div className="flex items-center gap-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => router.push("/dashboard/admin")}
					>
						← Back to Dashboard
					</Button>
					<Button variant="outline" size="sm" onClick={() => window.print()}>
						🖨️ Print Report
					</Button>
				</div>
			</nav>

			<div className="max-w-5xl mx-auto px-6 py-10">
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-gray-800">
						Reports & Analytics
					</h1>
					<p className="text-gray-500 text-sm">
						Overview of bookings, revenue, and operations
					</p>
				</div>

				{loading && (
					<p className="text-center text-gray-500 py-20">Loading reports...</p>
				)}

				{!loading && stats && (
					<>
						{/* Stats Overview */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
							{[
								{
									label: "Total Bookings",
									value: stats.totalBookings,
									icon: "🎫",
								},
								{
									label: "Confirmed",
									value: stats.confirmedBookings,
									icon: "✅",
								},
								{
									label: "Cancelled",
									value: stats.cancelledBookings,
									icon: "❌",
								},
								{ label: "Total Users", value: stats.totalUsers, icon: "👥" },
								{ label: "Total Buses", value: stats.totalBuses, icon: "🚌" },
								{ label: "Total Routes", value: stats.totalRoutes, icon: "🗺️" },
								{
									label: "Total Schedules",
									value: stats.totalSchedules,
									icon: "📅",
								},
								{
									label: "Total Revenue",
									value: `LKR ${totalRevenue.toLocaleString()}`,
									icon: "💰",
								},
							].map((card) => (
								<Card key={card.label}>
									<CardContent className="pt-6">
										<div className="text-2xl mb-1">{card.icon}</div>
										<p className="text-xl font-bold text-gray-800">
											{card.value}
										</p>
										<p className="text-gray-500 text-xs">{card.label}</p>
									</CardContent>
								</Card>
							))}
						</div>

						{/* Revenue Per Route */}
						<Card className="mb-6">
							<CardHeader>
								<CardTitle>💰 Revenue Per Route</CardTitle>
							</CardHeader>
							<CardContent>
								{revenuePerRoute.length === 0 ? (
									<p className="text-gray-500 text-sm">No revenue data yet</p>
								) : (
									<div className="space-y-3">
										{revenuePerRoute.map((r, i) => (
											<div key={i}>
												<div className="flex justify-between items-center">
													<div>
														<p className="font-semibold text-gray-800">
															{r.origin} → {r.destination}
														</p>
														<p className="text-gray-500 text-sm">
															{r.bookingCount} booking(s) × LKR {r.fare}
														</p>
													</div>
													<p className="text-blue-600 font-bold text-lg">
														LKR {calculateRevenue(r.fare, r.bookingCount)}
													</p>
												</div>
												{i < revenuePerRoute.length - 1 && (
													<Separator className="mt-3" />
												)}
											</div>
										))}
										<Separator />
										<div className="flex justify-between items-center pt-2">
											<p className="font-bold text-gray-800">Total Revenue</p>
											<p className="text-green-600 font-bold text-xl">
												LKR {totalRevenue.toLocaleString()}
											</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Bookings Per Route */}
						<Card className="mb-6">
							<CardHeader>
								<CardTitle>🗺️ Bookings Per Route</CardTitle>
							</CardHeader>
							<CardContent>
								{bookingsPerRoute.length === 0 ? (
									<p className="text-gray-500 text-sm">No bookings data yet</p>
								) : (
									<div className="space-y-3">
										{bookingsPerRoute.map((r, i) => (
											<div key={i}>
												<div className="flex justify-between items-center">
													<p className="font-semibold text-gray-800">
														{r.origin} → {r.destination}
													</p>
													<div className="flex items-center gap-3">
														<div className="bg-blue-100 rounded-full h-2 w-24">
															<div
																className="bg-blue-600 h-2 rounded-full"
																style={{
																	width: `${Math.min(
																		(r.totalBookings /
																			Math.max(
																				...bookingsPerRoute.map(
																					(b) => b.totalBookings
																				)
																			)) *
																			100,
																		100
																	)}%`,
																}}
															/>
														</div>
														<span className="text-blue-600 font-bold w-6 text-right">
															{r.totalBookings}
														</span>
													</div>
												</div>
												{i < bookingsPerRoute.length - 1 && (
													<Separator className="mt-3" />
												)}
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Bookings Per Bus */}
						<Card>
							<CardHeader>
								<CardTitle>🚌 Bookings Per Bus</CardTitle>
							</CardHeader>
							<CardContent>
								{bookingsPerBus.length === 0 ? (
									<p className="text-gray-500 text-sm">No bus data yet</p>
								) : (
									<div className="space-y-3">
										{bookingsPerBus.map((b, i) => (
											<div key={i}>
												<div className="flex justify-between items-center">
													<div>
														<p className="font-semibold text-gray-800">
															{b.licensePlate}
														</p>
														<p className="text-gray-500 text-sm">{b.busType}</p>
													</div>
													<div className="flex items-center gap-3">
														<div className="bg-green-100 rounded-full h-2 w-24">
															<div
																className="bg-green-600 h-2 rounded-full"
																style={{
																	width: `${Math.min(
																		(b.totalBookings /
																			Math.max(
																				...bookingsPerBus.map(
																					(x) => x.totalBookings
																				)
																			)) *
																			100,
																		100
																	)}%`,
																}}
															/>
														</div>
														<span className="text-green-600 font-bold w-6 text-right">
															{b.totalBookings}
														</span>
													</div>
												</div>
												{i < bookingsPerBus.length - 1 && (
													<Separator className="mt-3" />
												)}
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</>
				)}
			</div>
		</div>
	);
}
