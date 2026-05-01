"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Trip {
	scheduleId: string;
	departureTime: string;
	arrivalTime: string;
	fare: string;
	status: string;
	origin: string;
	destination: string;
	distance: string;
	duration: string;
	licensePlate: string;
	busType: string;
	totalSeats: number;
}

export default function DriverDashboard() {
	const router = useRouter();
	const [trips, setTrips] = useState<Trip[]>([]);
	const [loading, setLoading] = useState(true);
	const [email, setEmail] = useState("");
	const [userName, setUserName] = useState("");
	const [message, setMessage] = useState("");
	const [activeTab, setActiveTab] = useState("upcoming");

	useEffect(() => {
		const storedEmail = localStorage.getItem("userEmail");
		const storedName = localStorage.getItem("userName");
		if (!storedEmail) {
			router.push("/login");
			return;
		}
		setEmail(storedEmail);
		setUserName(storedName || "");
		fetchTrips(storedEmail);
	}, []);

	const fetchTrips = async (driverEmail: string) => {
		try {
			const res = await fetch(`/api/driver/trips?email=${driverEmail}`);
			const data = await res.json();
			if (res.ok) setTrips(data.trips);
		} catch {
			console.error("Failed to fetch trips");
		} finally {
			setLoading(false);
		}
	};

	const handleStatusUpdate = async (scheduleId: string, status: string) => {
		try {
			const res = await fetch("/api/driver/updatestatus", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ scheduleId, status }),
			});
			const data = await res.json();
			if (res.ok) {
				setMessage("Trip status updated successfully!");
				fetchTrips(email);
				setTimeout(() => setMessage(""), 3000);
			} else {
				setMessage(data.error || "Failed to update status");
			}
		} catch {
			setMessage("Something went wrong");
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("userEmail");
		localStorage.removeItem("userName");
		router.push("/");
	};

	const formatTime = (dateStr: string) => {
		return new Date(dateStr).toLocaleString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const getStatusConfig = (status: string) => {
		switch (status) {
			case "active":
				return {
					color: "bg-green-100 text-green-700 border-green-200",
					dot: "bg-green-500",
					label: "Active",
				};
			case "completed":
				return {
					color: "bg-gray-100 text-gray-600 border-gray-200",
					dot: "bg-gray-400",
					label: "Completed",
				};
			case "cancelled":
				return {
					color: "bg-red-100 text-red-700 border-red-200",
					dot: "bg-red-500",
					label: "Cancelled",
				};
			default:
				return {
					color: "bg-blue-100 text-blue-700 border-blue-200",
					dot: "bg-blue-500",
					label: "Scheduled",
				};
		}
	};

	const upcomingTrips = trips.filter(
		(t) => t.status === "scheduled" || t.status === "active"
	);
	const completedTrips = trips.filter((t) => t.status === "completed");
	const totalDistance = trips
		.filter((t) => t.status === "completed")
		.reduce((acc, t) => acc + parseFloat(t.distance || "0"), 0);

	const initials = userName
		? userName
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "D";

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Navbar */}
			<nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50">
				<Link href="/" className="flex items-center gap-2">
					<span className="text-2xl">🚌</span>
					<span className="text-xl font-bold text-blue-600">HighwayLink</span>
				</Link>
				<div className="flex items-center gap-4">
					<div className="hidden md:flex items-center gap-3">
						<div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
							{initials}
						</div>
						<div>
							<p className="text-sm font-semibold text-gray-800">{userName}</p>
							<p className="text-xs text-gray-400">Driver</p>
						</div>
					</div>
					<Button
						variant="outline"
						size="sm"
						className="rounded-full"
						onClick={handleLogout}
					>
						Logout
					</Button>
				</div>
			</nav>

			<div className="max-w-4xl mx-auto px-6 py-10">
				{/* Welcome Banner */}
				<div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 mb-8 text-white flex justify-between items-center">
					<div>
						<p className="text-green-100 text-sm mb-1">Welcome back,</p>
						<h1 className="text-2xl font-extrabold">
							{userName || "Driver"} 🚗
						</h1>
						<p className="text-green-100 text-sm mt-1">
							{upcomingTrips.length} upcoming trip
							{upcomingTrips.length !== 1 ? "s" : ""}
						</p>
					</div>
					<div className="text-right">
						<p className="text-green-100 text-xs mb-1">
							Total Distance Covered
						</p>
						<p className="text-3xl font-extrabold">
							{totalDistance.toFixed(0)} km
						</p>
					</div>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
					{[
						{
							label: "Total Trips",
							value: trips.length,
							icon: "🚌",
							color: "bg-blue-50 text-blue-600",
						},
						{
							label: "Upcoming",
							value: upcomingTrips.length,
							icon: "📅",
							color: "bg-green-50 text-green-600",
						},
						{
							label: "Completed",
							value: completedTrips.length,
							icon: "✅",
							color: "bg-gray-50 text-gray-600",
						},
						{
							label: "Km Driven",
							value: `${totalDistance.toFixed(0)}`,
							icon: "🗺️",
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
								<p className="text-gray-500 text-xs mt-0.5">{card.label}</p>
							</CardContent>
						</Card>
					))}
				</div>

				{message && (
					<div
						className={`p-3 rounded-xl mb-6 text-sm border ${
							message.includes("success")
								? "bg-green-50 border-green-200 text-green-600"
								: "bg-red-50 border-red-200 text-red-600"
						}`}
					>
						{message}
					</div>
				)}

				{/* Tabs */}
				<div className="flex gap-2 mb-6 bg-white border border-gray-100 rounded-xl p-1 w-fit">
					{[
						{ id: "upcoming", label: "📅 Upcoming Trips" },
						{ id: "completed", label: "✅ Completed Trips" },
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
								activeTab === tab.id
									? "bg-green-600 text-white shadow-sm"
									: "text-gray-600 hover:bg-gray-50"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>

				{loading && (
					<div className="text-center py-20">
						<p className="text-gray-500">Loading trips...</p>
					</div>
				)}

				{/* Upcoming Trips */}
				{activeTab === "upcoming" && !loading && (
					<div className="space-y-4">
						{upcomingTrips.length === 0 && (
							<Card className="border-0 shadow-sm">
								<CardContent className="py-16 text-center">
									<div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
										🚌
									</div>
									<h3 className="text-lg font-bold text-gray-800 mb-2">
										No upcoming trips
									</h3>
									<p className="text-gray-400 text-sm">
										You have no scheduled trips at the moment
									</p>
								</CardContent>
							</Card>
						)}
						{upcomingTrips.map((trip) => {
							const statusConfig = getStatusConfig(trip.status);
							return (
								<Card
									key={trip.scheduleId}
									className="border-0 shadow-sm hover:shadow-md transition"
								>
									<CardContent className="p-6">
										{/* Trip Header */}
										<div className="flex justify-between items-start mb-4">
											<div>
												<div className="flex items-center gap-3 mb-1">
													<h3 className="text-lg font-extrabold text-gray-800">
														{trip.origin} → {trip.destination}
													</h3>
													<span
														className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${statusConfig.color}`}
													>
														<span
															className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
														></span>
														{statusConfig.label}
													</span>
												</div>
												<p className="text-gray-500 text-sm">
													🚌 {trip.busType} — {trip.licensePlate}
												</p>
											</div>
											<div className="text-right">
												<p className="text-blue-600 font-bold">
													LKR {trip.fare}
												</p>
												<p className="text-gray-400 text-xs">fare per seat</p>
											</div>
										</div>

										<Separator className="mb-4" />

										{/* Trip Details */}
										<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
											<div className="bg-gray-50 rounded-xl p-3">
												<p className="text-xs text-gray-400 mb-1">
													🕐 Departure
												</p>
												<p className="text-sm font-bold text-gray-800">
													{formatTime(trip.departureTime)}
												</p>
											</div>
											<div className="bg-gray-50 rounded-xl p-3">
												<p className="text-xs text-gray-400 mb-1">🏁 Arrival</p>
												<p className="text-sm font-bold text-gray-800">
													{formatTime(trip.arrivalTime)}
												</p>
											</div>
											<div className="bg-gray-50 rounded-xl p-3">
												<p className="text-xs text-gray-400 mb-1">
													📍 Distance
												</p>
												<p className="text-sm font-bold text-gray-800">
													{trip.distance || "N/A"}
												</p>
											</div>
											<div className="bg-gray-50 rounded-xl p-3">
												<p className="text-xs text-gray-400 mb-1">⏱ Duration</p>
												<p className="text-sm font-bold text-gray-800">
													{trip.duration || "N/A"}
												</p>
											</div>
										</div>

										{/* Action Buttons */}
										<div className="flex gap-2 flex-wrap">
											{trip.status === "scheduled" && (
												<Button
													size="sm"
													className="bg-green-600 hover:bg-green-700 rounded-full px-5"
													onClick={() =>
														handleStatusUpdate(trip.scheduleId, "active")
													}
												>
													🚦 Start Trip
												</Button>
											)}
											{trip.status === "active" && (
												<Button
													size="sm"
													className="bg-blue-600 hover:bg-blue-700 rounded-full px-5"
													onClick={() =>
														handleStatusUpdate(trip.scheduleId, "completed")
													}
												>
													🏁 Complete Trip
												</Button>
											)}
											{trip.status !== "cancelled" && (
												<Button
													size="sm"
													variant="outline"
													className="rounded-full px-5 border-red-200 text-red-500 hover:bg-red-50"
													onClick={() =>
														handleStatusUpdate(trip.scheduleId, "cancelled")
													}
												>
													✕ Cancel Trip
												</Button>
											)}
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}

				{/* Completed Trips */}
				{activeTab === "completed" && !loading && (
					<div className="space-y-4">
						{completedTrips.length === 0 && (
							<Card className="border-0 shadow-sm">
								<CardContent className="py-16 text-center">
									<div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
										✅
									</div>
									<h3 className="text-lg font-bold text-gray-800 mb-2">
										No completed trips yet
									</h3>
									<p className="text-gray-400 text-sm">
										Your completed trips will appear here
									</p>
								</CardContent>
							</Card>
						)}
						{completedTrips.map((trip) => (
							<Card
								key={trip.scheduleId}
								className="border-0 shadow-sm opacity-80"
							>
								<CardContent className="p-6">
									<div className="flex justify-between items-start mb-4">
										<div>
											<div className="flex items-center gap-3 mb-1">
												<h3 className="text-lg font-bold text-gray-700">
													{trip.origin} → {trip.destination}
												</h3>
												<span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-gray-100 text-gray-600 border-gray-200">
													COMPLETED
												</span>
											</div>
											<p className="text-gray-400 text-sm">
												🚌 {trip.busType} — {trip.licensePlate}
											</p>
										</div>
										<div className="text-right">
											<p className="text-gray-600 font-bold">LKR {trip.fare}</p>
											<p className="text-gray-400 text-xs">fare per seat</p>
										</div>
									</div>

									<Separator className="mb-4" />

									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<div className="bg-gray-50 rounded-xl p-3">
											<p className="text-xs text-gray-400 mb-1">🕐 Departure</p>
											<p className="text-sm font-bold text-gray-700">
												{formatTime(trip.departureTime)}
											</p>
										</div>
										<div className="bg-gray-50 rounded-xl p-3">
											<p className="text-xs text-gray-400 mb-1">🏁 Arrival</p>
											<p className="text-sm font-bold text-gray-700">
												{formatTime(trip.arrivalTime)}
											</p>
										</div>
										<div className="bg-gray-50 rounded-xl p-3">
											<p className="text-xs text-gray-400 mb-1">📍 Distance</p>
											<p className="text-sm font-bold text-gray-700">
												{trip.distance || "N/A"}
											</p>
										</div>
										<div className="bg-gray-50 rounded-xl p-3">
											<p className="text-xs text-gray-400 mb-1">⏱ Duration</p>
											<p className="text-sm font-bold text-gray-700">
												{trip.duration || "N/A"}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
