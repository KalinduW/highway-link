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
	totalPassengers: number;
	newThisWeek: number;
	newThisMonth: number;
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

interface RecentPassenger {
	id: string;
	fullName: string;
	email: string;
	phone: string;
	createdAt: string;
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
					setRecentPassengers(data.recentPassengers || []);
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

	const [recentPassengers, setRecentPassengers] = useState<RecentPassenger[]>(
		[]
	);

	return (
		<div className="bg-gray-50 min-h-screen">
			{/* Top Bar */}
			<div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-30">
				<div>
					<h1 className="text-lg font-bold text-gray-800">
						💰 Reports & Analytics
					</h1>
					<p className="text-xs text-gray-400">HighwayLink Admin Panel</p>
				</div>
				<Button variant="outline" size="sm" onClick={() => window.print()}>
					🖨️ Print Report
				</Button>
			</div>

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
								{
									label: "Total Passengers",
									value: stats.totalPassengers,
									icon: "👥",
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

						{/* Passenger Stats */}
						<Card className="mb-6 mt-6">
							<CardHeader>
								<CardTitle>👥 Passenger Growth</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-3 gap-4 mb-6">
									{[
										{
											label: "Total Passengers",
											value: stats.totalPassengers,
											icon: "👥",
											color: "bg-blue-50 text-blue-600",
										},
										{
											label: "New This Week",
											value: stats.newThisWeek,
											icon: "📈",
											color: "bg-green-50 text-green-600",
										},
										{
											label: "New This Month",
											value: stats.newThisMonth,
											icon: "🗓️",
											color: "bg-purple-50 text-purple-600",
										},
									].map((card) => (
										<div
											key={card.label}
											className={`rounded-xl p-4 ${card.color}`}
										>
											<p className="text-2xl mb-1">{card.icon}</p>
											<p className="text-2xl font-extrabold">{card.value}</p>
											<p className="text-sm opacity-75">{card.label}</p>
										</div>
									))}
								</div>

								{/* Recently Joined */}
								<p className="font-semibold text-gray-700 mb-3">
									Recently Joined Passengers
								</p>
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead className="bg-gray-50 border-b">
											<tr>
												<th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">
													Name
												</th>
												<th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">
													Email
												</th>
												<th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">
													Phone
												</th>
												<th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">
													Joined
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-50">
											{recentPassengers.length === 0 && (
												<tr>
													<td
														colSpan={4}
														className="text-center py-6 text-gray-400"
													>
														No passengers yet
													</td>
												</tr>
											)}
											{recentPassengers.map((passenger) => (
												<tr
													key={passenger.id}
													className="hover:bg-gray-50 transition"
												>
													<td className="px-4 py-3">
														<div className="flex items-center gap-3">
															<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
																{passenger.fullName
																	.split(" ")
																	.map((n: string) => n[0])
																	.join("")
																	.slice(0, 2)
																	.toUpperCase()}
															</div>
															<p className="font-medium text-gray-800">
																{passenger.fullName}
															</p>
														</div>
													</td>
													<td className="px-4 py-3 text-gray-600">
														{passenger.email}
													</td>
													<td className="px-4 py-3 text-gray-600">
														{passenger.phone}
													</td>
													<td className="px-4 py-3 text-gray-400 text-xs">
														{new Date(passenger.createdAt).toLocaleDateString(
															"en-US",
															{
																year: "numeric",
																month: "short",
																day: "numeric",
															}
														)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</CardContent>
						</Card>
					</>
				)}
			</div>
		</div>
	);
}
