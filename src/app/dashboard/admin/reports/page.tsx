"use client";

import { useEffect, useState } from "react";
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
	const [activeTab, setActiveTab] = useState("overview");
	const [stats, setStats] = useState<Stats | null>(null);
	const [bookingsPerRoute, setBookingsPerRoute] = useState<RouteBooking[]>([]);
	const [bookingsPerBus, setBookingsPerBus] = useState<BusBooking[]>([]);
	const [revenuePerRoute, setRevenuePerRoute] = useState<RevenueRoute[]>([]);
	const [recentPassengers, setRecentPassengers] = useState<RecentPassenger[]>(
		[]
	);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchReports();
	}, []);

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

	const totalRevenue = revenuePerRoute.reduce((acc, r) => {
		return acc + parseFloat(r.fare) * r.bookingCount;
	}, 0);

	const calculateRevenue = (fare: string, count: number) => {
		return (parseFloat(fare) * count).toLocaleString("en-US");
	};

	const handlePrint = (sectionId: string) => {
		const section = document.getElementById(sectionId);
		if (!section) return;
		const printWindow = window.open("", "_blank");
		if (!printWindow) return;
		printWindow.document.write(`
      <html>
        <head>
          <title>HighwayLink Report — ${activeTab}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f5f5f5; }
            h2 { color: #1d4ed8; }
            .stat { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; min-width: 150px; }
          </style>
        </head>
        <body>
          <h2>HighwayLink — ${
						activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
					} Report</h2>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <hr/>
          ${section.innerHTML}
        </body>
      </html>
    `);
		printWindow.document.close();
		printWindow.print();
	};

	const tabs = [
		{ id: "overview", label: "📊 Overview" },
		{ id: "revenue", label: "💰 Revenue" },
		{ id: "bookings", label: "🎫 Bookings" },
		{ id: "passengers", label: "👥 Passengers" },
		{ id: "fleet", label: "🚌 Fleet" },
	];

	return (
		<div>
			{/* Top Bar */}
			<div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-30">
				<div>
					<h1 className="text-lg font-bold text-gray-800">
						💰 Reports & Analytics
					</h1>
					<p className="text-xs text-gray-400">HighwayLink Admin Panel</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => handlePrint(`report-${activeTab}`)}
				>
					🖨️ Print {tabs.find((t) => t.id === activeTab)?.label.split(" ")[1]}{" "}
					Report
				</Button>
			</div>

			<div className="p-8">
				{loading && (
					<div className="text-center py-20">
						<div className="text-4xl mb-3 animate-pulse">📊</div>
						<p className="text-gray-500">Loading reports...</p>
					</div>
				)}

				{!loading && stats && (
					<>
						{/* Tabs */}
						<div className="flex gap-2 mb-8 bg-white border border-gray-100 rounded-xl p-1 flex-wrap">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${
										activeTab === tab.id
											? "bg-blue-600 text-white shadow-sm"
											: "text-gray-600 hover:bg-gray-50"
									}`}
								>
									{tab.label}
								</button>
							))}
						</div>

						{/* Overview Tab */}
						{activeTab === "overview" && (
							<div id="report-overview">
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
									{[
										{
											label: "Total Bookings",
											value: stats.totalBookings,
											icon: "🎫",
											color: "bg-blue-50 text-blue-600",
										},
										{
											label: "Total Revenue",
											value: `LKR ${totalRevenue.toLocaleString()}`,
											icon: "💰",
											color: "bg-green-50 text-green-600",
										},
										{
											label: "Total Passengers",
											value: stats.totalPassengers,
											icon: "👥",
											color: "bg-purple-50 text-purple-600",
										},
										{
											label: "Total Buses",
											value: stats.totalBuses,
											icon: "🚌",
											color: "bg-orange-50 text-orange-600",
										},
										{
											label: "Confirmed Bookings",
											value: stats.confirmedBookings,
											icon: "✅",
											color: "bg-green-50 text-green-600",
										},
										{
											label: "Cancelled Bookings",
											value: stats.cancelledBookings,
											icon: "❌",
											color: "bg-red-50 text-red-600",
										},
										{
											label: "Total Routes",
											value: stats.totalRoutes,
											icon: "🗺️",
											color: "bg-blue-50 text-blue-600",
										},
										{
											label: "Total Schedules",
											value: stats.totalSchedules,
											icon: "📅",
											color: "bg-yellow-50 text-yellow-600",
										},
									].map((card) => (
										<Card key={card.label} className="border-0 shadow-sm">
											<CardContent className="pt-5 pb-5">
												<div
													className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${card.color}`}
												>
													{card.icon}
												</div>
												<p className="text-2xl font-extrabold text-gray-800">
													{card.value}
												</p>
												<p className="text-gray-500 text-xs mt-0.5">
													{card.label}
												</p>
											</CardContent>
										</Card>
									))}
								</div>

								{/* Quick Summary */}
								<Card className="border-0 shadow-sm">
									<CardHeader>
										<CardTitle className="text-base">
											📋 Quick Summary
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-3">
											{[
												{
													label: "Booking Confirmation Rate",
													value:
														stats.totalBookings > 0
															? `${Math.round(
																	(stats.confirmedBookings /
																		stats.totalBookings) *
																		100
															  )}%`
															: "0%",
													color: "text-green-600",
												},
												{
													label: "Cancellation Rate",
													value:
														stats.totalBookings > 0
															? `${Math.round(
																	(stats.cancelledBookings /
																		stats.totalBookings) *
																		100
															  )}%`
															: "0%",
													color: "text-red-600",
												},
												{
													label: "Average Revenue Per Route",
													value:
														revenuePerRoute.length > 0
															? `LKR ${Math.round(
																	totalRevenue / revenuePerRoute.length
															  ).toLocaleString()}`
															: "N/A",
													color: "text-blue-600",
												},
												{
													label: "New Passengers This Week",
													value: stats.newThisWeek,
													color: "text-purple-600",
												},
												{
													label: "New Passengers This Month",
													value: stats.newThisMonth,
													color: "text-orange-600",
												},
											].map((item, i) => (
												<div key={i}>
													<div className="flex justify-between items-center py-2">
														<p className="text-sm text-gray-600">
															{item.label}
														</p>
														<p className={`font-bold text-sm ${item.color}`}>
															{item.value}
														</p>
													</div>
													{i < 4 && <Separator />}
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							</div>
						)}

						{/* Revenue Tab */}
						{activeTab === "revenue" && (
							<div id="report-revenue" className="space-y-6">
								{/* Total Revenue Card */}
								<div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 text-white">
									<p className="text-green-100 text-sm mb-1">
										Total Revenue Generated
									</p>
									<p className="text-4xl font-extrabold">
										LKR {totalRevenue.toLocaleString()}
									</p>
									<p className="text-green-100 text-sm mt-2">
										From {revenuePerRoute.length} route
										{revenuePerRoute.length !== 1 ? "s" : ""}
									</p>
								</div>

								{/* Revenue Per Route */}
								<Card className="border-0 shadow-sm">
									<CardHeader>
										<CardTitle className="text-base">
											💰 Revenue Per Route
										</CardTitle>
									</CardHeader>
									<CardContent>
										{revenuePerRoute.length === 0 ? (
											<p className="text-gray-400 text-sm text-center py-8">
												No revenue data yet
											</p>
										) : (
											<div className="space-y-4">
												{revenuePerRoute.map((r, i) => (
													<div key={i}>
														<div className="flex justify-between items-center py-2">
															<div>
																<p className="font-bold text-gray-800">
																	{r.origin} → {r.destination}
																</p>
																<p className="text-gray-400 text-xs mt-0.5">
																	{r.bookingCount} booking
																	{r.bookingCount !== 1 ? "s" : ""} × LKR{" "}
																	{r.fare}
																</p>
															</div>
															<p className="text-green-600 font-extrabold text-lg">
																LKR {calculateRevenue(r.fare, r.bookingCount)}
															</p>
														</div>
														{/* Progress bar */}
														<div className="bg-gray-100 rounded-full h-1.5 mt-2">
															<div
																className="bg-green-500 h-1.5 rounded-full"
																style={{
																	width: `${
																		totalRevenue > 0
																			? ((parseFloat(r.fare) * r.bookingCount) /
																					totalRevenue) *
																			  100
																			: 0
																	}%`,
																}}
															/>
														</div>
														{i < revenuePerRoute.length - 1 && (
															<Separator className="mt-3" />
														)}
													</div>
												))}
												<Separator />
												<div className="flex justify-between items-center pt-2">
													<p className="font-extrabold text-gray-800">Total</p>
													<p className="text-green-600 font-extrabold text-xl">
														LKR {totalRevenue.toLocaleString()}
													</p>
												</div>
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						)}

						{/* Bookings Tab */}
						{activeTab === "bookings" && (
							<div id="report-bookings" className="space-y-6">
								{/* Booking Stats */}
								<div className="grid grid-cols-3 gap-4">
									{[
										{
											label: "Total Bookings",
											value: stats.totalBookings,
											icon: "🎫",
											color: "bg-blue-50 text-blue-600",
										},
										{
											label: "Confirmed",
											value: stats.confirmedBookings,
											icon: "✅",
											color: "bg-green-50 text-green-600",
										},
										{
											label: "Cancelled",
											value: stats.cancelledBookings,
											icon: "❌",
											color: "bg-red-50 text-red-600",
										},
									].map((card) => (
										<Card key={card.label} className="border-0 shadow-sm">
											<CardContent className="pt-5 pb-5">
												<div
													className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${card.color}`}
												>
													{card.icon}
												</div>
												<p className="text-2xl font-extrabold text-gray-800">
													{card.value}
												</p>
												<p className="text-gray-500 text-xs mt-0.5">
													{card.label}
												</p>
											</CardContent>
										</Card>
									))}
								</div>

								{/* Bookings Per Route */}
								<Card className="border-0 shadow-sm">
									<CardHeader>
										<CardTitle className="text-base">
											🗺️ Bookings Per Route
										</CardTitle>
									</CardHeader>
									<CardContent>
										{bookingsPerRoute.length === 0 ? (
											<p className="text-gray-400 text-sm text-center py-8">
												No bookings data yet
											</p>
										) : (
											<div className="space-y-4">
												{bookingsPerRoute.map((r, i) => (
													<div key={i}>
														<div className="flex justify-between items-center py-2">
															<p className="font-semibold text-gray-800">
																{r.origin} → {r.destination}
															</p>
															<div className="flex items-center gap-3">
																<div className="bg-blue-100 rounded-full h-2 w-32">
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
																<span className="text-blue-600 font-bold w-8 text-right">
																	{r.totalBookings}
																</span>
															</div>
														</div>
														{i < bookingsPerRoute.length - 1 && <Separator />}
													</div>
												))}
											</div>
										)}
									</CardContent>
								</Card>

								{/* Bookings Per Bus */}
								<Card className="border-0 shadow-sm">
									<CardHeader>
										<CardTitle className="text-base">
											🚌 Bookings Per Bus
										</CardTitle>
									</CardHeader>
									<CardContent>
										{bookingsPerBus.length === 0 ? (
											<p className="text-gray-400 text-sm text-center py-8">
												No bus data yet
											</p>
										) : (
											<div className="space-y-4">
												{bookingsPerBus.map((b, i) => (
													<div key={i}>
														<div className="flex justify-between items-center py-2">
															<div>
																<p className="font-semibold text-gray-800">
																	{b.licensePlate}
																</p>
																<p className="text-gray-400 text-xs">
																	{b.busType}
																</p>
															</div>
															<div className="flex items-center gap-3">
																<div className="bg-green-100 rounded-full h-2 w-32">
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
																<span className="text-green-600 font-bold w-8 text-right">
																	{b.totalBookings}
																</span>
															</div>
														</div>
														{i < bookingsPerBus.length - 1 && <Separator />}
													</div>
												))}
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						)}

						{/* Passengers Tab */}
						{activeTab === "passengers" && (
							<div id="report-passengers" className="space-y-6">
								{/* Passenger Stats */}
								<div className="grid grid-cols-3 gap-4">
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
										<Card key={card.label} className="border-0 shadow-sm">
											<CardContent className="pt-5 pb-5">
												<div
													className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${card.color}`}
												>
													{card.icon}
												</div>
												<p className="text-2xl font-extrabold text-gray-800">
													{card.value}
												</p>
												<p className="text-gray-500 text-xs mt-0.5">
													{card.label}
												</p>
											</CardContent>
										</Card>
									))}
								</div>

								{/* Recently Joined */}
								<Card className="border-0 shadow-sm">
									<CardHeader>
										<CardTitle className="text-base">
											🆕 Recently Joined Passengers
										</CardTitle>
									</CardHeader>
									<CardContent>
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
																className="text-center py-8 text-gray-400"
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
																{new Date(
																	passenger.createdAt
																).toLocaleDateString("en-US", {
																	year: "numeric",
																	month: "short",
																	day: "numeric",
																})}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</CardContent>
								</Card>
							</div>
						)}

						{/* Fleet Tab */}
						{activeTab === "fleet" && (
							<div id="report-fleet" className="space-y-6">
								{/* Fleet Stats */}
								<div className="grid grid-cols-3 gap-4">
									{[
										{
											label: "Total Buses",
											value: stats.totalBuses,
											icon: "🚌",
											color: "bg-blue-50 text-blue-600",
										},
										{
											label: "Total Routes",
											value: stats.totalRoutes,
											icon: "🗺️",
											color: "bg-green-50 text-green-600",
										},
										{
											label: "Total Schedules",
											value: stats.totalSchedules,
											icon: "📅",
											color: "bg-purple-50 text-purple-600",
										},
									].map((card) => (
										<Card key={card.label} className="border-0 shadow-sm">
											<CardContent className="pt-5 pb-5">
												<div
													className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${card.color}`}
												>
													{card.icon}
												</div>
												<p className="text-2xl font-extrabold text-gray-800">
													{card.value}
												</p>
												<p className="text-gray-500 text-xs mt-0.5">
													{card.label}
												</p>
											</CardContent>
										</Card>
									))}
								</div>

								{/* Bus Performance */}
								<Card className="border-0 shadow-sm">
									<CardHeader>
										<CardTitle className="text-base">
											🚌 Bus Performance
										</CardTitle>
									</CardHeader>
									<CardContent>
										{bookingsPerBus.length === 0 ? (
											<p className="text-gray-400 text-sm text-center py-8">
												No bus data yet
											</p>
										) : (
											<div className="overflow-x-auto">
												<table className="w-full text-sm">
													<thead className="bg-gray-50 border-b">
														<tr>
															<th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">
																Bus
															</th>
															<th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">
																Type
															</th>
															<th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">
																Total Bookings
															</th>
															<th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">
																Performance
															</th>
														</tr>
													</thead>
													<tbody className="divide-y divide-gray-50">
														{bookingsPerBus.map((bus, i) => (
															<tr
																key={i}
																className="hover:bg-gray-50 transition"
															>
																<td className="px-4 py-3 font-semibold text-gray-800">
																	{bus.licensePlate}
																</td>
																<td className="px-4 py-3">
																	<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
																		{bus.busType}
																	</span>
																</td>
																<td className="px-4 py-3 font-bold text-gray-800">
																	{bus.totalBookings}
																</td>
																<td className="px-4 py-3">
																	<div className="flex items-center gap-2">
																		<div className="bg-gray-100 rounded-full h-2 w-24">
																			<div
																				className="bg-blue-500 h-2 rounded-full"
																				style={{
																					width: `${Math.min(
																						(bus.totalBookings /
																							Math.max(
																								...bookingsPerBus.map(
																									(b) => b.totalBookings
																								)
																							)) *
																							100,
																						100
																					)}%`,
																				}}
																			/>
																		</div>
																		<span className="text-xs text-gray-400">
																			{Math.round(
																				(bus.totalBookings /
																					Math.max(
																						...bookingsPerBus.map(
																							(b) => b.totalBookings
																						)
																					)) *
																					100
																			)}
																			%
																		</span>
																	</div>
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Routes */}
								<Card className="border-0 shadow-sm">
									<CardHeader>
										<CardTitle className="text-base">
											🗺️ Route Performance
										</CardTitle>
									</CardHeader>
									<CardContent>
										{bookingsPerRoute.length === 0 ? (
											<p className="text-gray-400 text-sm text-center py-8">
												No route data yet
											</p>
										) : (
											<div className="overflow-x-auto">
												<table className="w-full text-sm">
													<thead className="bg-gray-50 border-b">
														<tr>
															<th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">
																Route
															</th>
															<th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">
																Bookings
															</th>
															<th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">
																Revenue
															</th>
														</tr>
													</thead>
													<tbody className="divide-y divide-gray-50">
														{bookingsPerRoute.map((route, i) => {
															const routeRevenue = revenuePerRoute.find(
																(r) =>
																	r.origin === route.origin &&
																	r.destination === route.destination
															);
															return (
																<tr
																	key={i}
																	className="hover:bg-gray-50 transition"
																>
																	<td className="px-4 py-3 font-semibold text-gray-800">
																		{route.origin} → {route.destination}
																	</td>
																	<td className="px-4 py-3 font-bold text-blue-600">
																		{route.totalBookings}
																	</td>
																	<td className="px-4 py-3 font-bold text-green-600">
																		{routeRevenue
																			? `LKR ${calculateRevenue(
																					routeRevenue.fare,
																					routeRevenue.bookingCount
																			  )}`
																			: "N/A"}
																	</td>
																</tr>
															);
														})}
													</tbody>
												</table>
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
