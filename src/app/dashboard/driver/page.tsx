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
	const [message, setMessage] = useState("");
	const [activeTab, setActiveTab] = useState("upcoming");

	useEffect(() => {
		const storedEmail = localStorage.getItem("userEmail");
		if (!storedEmail) {
			router.push("/login");
			return;
		}
		setEmail(storedEmail);
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

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-700";
			case "completed":
				return "bg-gray-100 text-gray-700";
			case "cancelled":
				return "bg-red-100 text-red-700";
			default:
				return "bg-blue-100 text-blue-700";
		}
	};

	const upcomingTrips = trips.filter(
		(t) => t.status === "scheduled" || t.status === "active"
	);
	const completedTrips = trips.filter((t) => t.status === "completed");

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Navbar */}
			<nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
				<Link href="/" className="text-2xl font-bold text-blue-600">
					HighwayLink
				</Link>
				<div className="flex items-center gap-4">
					<span className="text-gray-600 text-sm">{email}</span>
					<Button variant="outline" size="sm" onClick={handleLogout}>
						Logout
					</Button>
				</div>
			</nav>

			<div className="max-w-4xl mx-auto px-6 py-10">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-gray-800">Driver Dashboard</h1>
					<p className="text-gray-500 text-sm">
						View and manage your assigned trips
					</p>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
					{[
						{ label: "Total Trips", value: trips.length, icon: "🚌" },
						{ label: "Upcoming", value: upcomingTrips.length, icon: "📅" },
						{ label: "Completed", value: completedTrips.length, icon: "✅" },
						{
							label: "Total Distance",
							value: `${trips
								.reduce((acc, t) => acc + parseFloat(t.distance || "0"), 0)
								.toFixed(0)} km`,
							icon: "🗺️",
						},
					].map((card) => (
						<Card key={card.label}>
							<CardContent className="pt-6">
								<div className="text-2xl mb-1">{card.icon}</div>
								<p className="text-xl font-bold text-gray-800">{card.value}</p>
								<p className="text-gray-500 text-xs">{card.label}</p>
							</CardContent>
						</Card>
					))}
				</div>

				{message && (
					<div
						className={`p-3 rounded-lg mb-6 text-sm ${
							message.includes("success")
								? "bg-green-50 text-green-600"
								: "bg-red-50 text-red-600"
						}`}
					>
						{message}
					</div>
				)}

				{/* Tabs */}
				<div className="flex gap-4 mb-6">
					{[
						{ id: "upcoming", label: "📅 Upcoming Trips" },
						{ id: "completed", label: "✅ Completed Trips" },
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
								activeTab === tab.id
									? "bg-blue-600 text-white"
									: "bg-white text-gray-600 hover:bg-gray-100"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>

				{loading && (
					<p className="text-center text-gray-500 py-10">Loading trips...</p>
				)}

				{/* Upcoming Trips */}
				{activeTab === "upcoming" && !loading && (
					<div className="space-y-4">
						{upcomingTrips.length === 0 && (
							<Card>
								<CardContent className="py-10 text-center">
									<p className="text-4xl mb-3">🚌</p>
									<p className="text-gray-600 font-medium">No upcoming trips</p>
									<p className="text-gray-400 text-sm">
										You have no scheduled trips at the moment
									</p>
								</CardContent>
							</Card>
						)}
						{upcomingTrips.map((trip) => (
							<Card key={trip.scheduleId}>
								<CardContent className="pt-6">
									<div className="flex justify-between items-start mb-4">
										<div>
											<h3 className="text-lg font-bold text-gray-800">
												{trip.origin} → {trip.destination}
											</h3>
											<p className="text-gray-500 text-sm">
												{trip.busType} — {trip.licensePlate}
											</p>
										</div>
										<span
											className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(
												trip.status
											)}`}
										>
											{trip.status.toUpperCase()}
										</span>
									</div>

									<Separator className="mb-4" />

									<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
										<div>
											<p className="text-xs text-gray-500 mb-1">Departure</p>
											<p className="text-sm font-semibold text-gray-800">
												{formatTime(trip.departureTime)}
											</p>
										</div>
										<div>
											<p className="text-xs text-gray-500 mb-1">Arrival</p>
											<p className="text-sm font-semibold text-gray-800">
												{formatTime(trip.arrivalTime)}
											</p>
										</div>
										<div>
											<p className="text-xs text-gray-500 mb-1">Distance</p>
											<p className="text-sm font-semibold text-gray-800">
												{trip.distance || "N/A"}
											</p>
										</div>
										<div>
											<p className="text-xs text-gray-500 mb-1">Duration</p>
											<p className="text-sm font-semibold text-gray-800">
												{trip.duration || "N/A"}
											</p>
										</div>
									</div>

									{/* Status Update Buttons */}
									<div className="flex gap-2 flex-wrap">
										{trip.status === "scheduled" && (
											<Button
												size="sm"
												className="bg-green-600 hover:bg-green-700"
												onClick={() =>
													handleStatusUpdate(trip.scheduleId, "active")
												}
											>
												Start Trip
											</Button>
										)}
										{trip.status === "active" && (
											<Button
												size="sm"
												className="bg-blue-600 hover:bg-blue-700"
												onClick={() =>
													handleStatusUpdate(trip.scheduleId, "completed")
												}
											>
												Complete Trip
											</Button>
										)}
										{trip.status !== "cancelled" && (
											<Button
												size="sm"
												variant="destructive"
												onClick={() =>
													handleStatusUpdate(trip.scheduleId, "cancelled")
												}
											>
												Cancel Trip
											</Button>
										)}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Completed Trips */}
				{activeTab === "completed" && !loading && (
					<div className="space-y-4">
						{completedTrips.length === 0 && (
							<Card>
								<CardContent className="py-10 text-center">
									<p className="text-4xl mb-3">✅</p>
									<p className="text-gray-600 font-medium">
										No completed trips yet
									</p>
								</CardContent>
							</Card>
						)}
						{completedTrips.map((trip) => (
							<Card key={trip.scheduleId} className="opacity-75">
								<CardContent className="pt-6">
									<div className="flex justify-between items-start mb-4">
										<div>
											<h3 className="text-lg font-bold text-gray-800">
												{trip.origin} → {trip.destination}
											</h3>
											<p className="text-gray-500 text-sm">
												{trip.busType} — {trip.licensePlate}
											</p>
										</div>
										<span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
											COMPLETED
										</span>
									</div>
									<Separator className="mb-4" />
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<div>
											<p className="text-xs text-gray-500 mb-1">Departure</p>
											<p className="text-sm font-semibold text-gray-800">
												{formatTime(trip.departureTime)}
											</p>
										</div>
										<div>
											<p className="text-xs text-gray-500 mb-1">Arrival</p>
											<p className="text-sm font-semibold text-gray-800">
												{formatTime(trip.arrivalTime)}
											</p>
										</div>
										<div>
											<p className="text-xs text-gray-500 mb-1">Distance</p>
											<p className="text-sm font-semibold text-gray-800">
												{trip.distance || "N/A"}
											</p>
										</div>
										<div>
											<p className="text-xs text-gray-500 mb-1">Fare</p>
											<p className="text-sm font-semibold text-blue-600">
												LKR {trip.fare}
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
