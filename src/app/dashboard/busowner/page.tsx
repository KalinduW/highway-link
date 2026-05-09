"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface Bus {
	id: string;
	licensePlate: string;
	busType: string;
	totalSeats: number;
	totalMileage: number;
	createdAt: string;
}

interface Schedule {
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

interface Stats {
	totalBuses: number;
	totalSchedules: number;
	totalBookings: number;
	confirmedBookings: number;
	totalRevenue: number;
}

export default function BusOwnerDashboard() {
	const router = useRouter();
	const [buses, setBuses] = useState<Bus[]>([]);
	const [schedules, setSchedules] = useState<Schedule[]>([]);
	const [stats, setStats] = useState<Stats | null>(null);
	const [loading, setLoading] = useState(true);
	const [email, setEmail] = useState("");
	const [userName, setUserName] = useState("");
	const [activeTab, setActiveTab] = useState("overview");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [addingBus, setAddingBus] = useState(false);
	const [busForm, setBusForm] = useState({
		licensePlate: "",
		busType: "AC",
		totalSeats: "",
	});

	useEffect(() => {
		const storedEmail = localStorage.getItem("userEmail");
		const storedName = localStorage.getItem("userName");
		if (!storedEmail) {
			router.push("/login");
			return;
		}
		setEmail(storedEmail);
		setUserName(storedName || "");
		fetchOverview(storedEmail);
	}, []);

	const fetchOverview = async (userEmail: string) => {
		try {
			const res = await fetch(`/api/busowner/overview?email=${userEmail}`);
			const data = await res.json();
			if (res.ok) {
				setBuses(data.buses);
				setSchedules(data.schedules);
				setStats(data.stats);
			}
		} catch {
			console.error("Failed to fetch overview");
		} finally {
			setLoading(false);
		}
	};

	const handleAddBus = async (e: React.FormEvent) => {
		e.preventDefault();
		setAddingBus(true);
		setMessage("");
		setError("");

		try {
			const res = await fetch("/api/busowner/buses", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...busForm, email }),
			});
			const data = await res.json();
			if (!res.ok) {
				setError(data.error || "Failed to add bus");
			} else {
				setMessage("Bus added successfully!");
				setBusForm({ licensePlate: "", busType: "AC", totalSeats: "" });
				fetchOverview(email);
				setTimeout(() => setMessage(""), 3000);
			}
		} catch {
			setError("Something went wrong");
		} finally {
			setAddingBus(false);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("userEmail");
		localStorage.removeItem("userName");
		router.push("/");
	};

	const formatTime = (dateStr: string) => {
		return new Date(dateStr).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
		});
	};

	const getStatusConfig = (status: string) => {
		switch (status) {
			case "active":
				return { color: "bg-green-100 text-green-700", label: "Active" };
			case "completed":
				return { color: "bg-gray-100 text-gray-600", label: "Completed" };
			case "cancelled":
				return { color: "bg-red-100 text-red-700", label: "Cancelled" };
			default:
				return { color: "bg-blue-100 text-blue-700", label: "Scheduled" };
		}
	};

	const getBusTypeConfig = (busType: string) => {
		switch (busType) {
			case "luxury":
				return { color: "bg-purple-100 text-purple-700", label: "✨ Luxury" };
			case "AC":
				return { color: "bg-blue-100 text-blue-700", label: "❄️ AC" };
			default:
				return { color: "bg-gray-100 text-gray-700", label: "🚌 Non-AC" };
		}
	};

	const initials = userName
		? userName
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "BO";

	const upcomingSchedules = schedules.filter(
		(s) => s.status === "scheduled" || s.status === "active"
	);

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
						<div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-blue-900 text-sm font-bold">
							{initials}
						</div>
						<div>
							<p className="text-sm font-semibold text-gray-800">{userName}</p>
							<p className="text-xs text-gray-400">Bus Owner</p>
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

			<div className="max-w-5xl mx-auto px-6 py-10">
				{/* Welcome Banner */}
				<div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl p-6 mb-8 text-white flex justify-between items-center">
					<div>
						<p className="text-gray-800 text-sm mb-1">Welcome back,</p>
						<h1 className="text-gray-800 text-2xl font-extrabold">
							{userName} 🚌
						</h1>
						<p className="text-gray-800 text-sm mt-1">
							{stats?.totalBuses || 0} bus
							{(stats?.totalBuses || 0) !== 1 ? "es" : ""} in your fleet
						</p>
					</div>
					<div className="text-right">
						<p className="text-gray-800 text-xs mb-1">Total Revenue</p>
						<p className="text-3xl font-extrabold">
							LKR {(stats?.totalRevenue || 0).toLocaleString()}
						</p>
					</div>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
					{[
						{
							label: "Total Buses",
							value: stats?.totalBuses || 0,
							icon: "🚌",
							color: "bg-purple-50 text-purple-600",
						},
						{
							label: "Total Schedules",
							value: stats?.totalSchedules || 0,
							icon: "📅",
							color: "bg-blue-50 text-blue-600",
						},
						{
							label: "Total Bookings",
							value: stats?.totalBookings || 0,
							icon: "🎫",
							color: "bg-green-50 text-green-600",
						},
						{
							label: "Confirmed",
							value: stats?.confirmedBookings || 0,
							icon: "✅",
							color: "bg-orange-50 text-orange-600",
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

				{/* Messages */}
				{message && (
					<div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-2">
						<span>✅</span> {message}
					</div>
				)}
				{error && (
					<div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2">
						<span>⚠️</span> {error}
					</div>
				)}

				{/* Tabs */}
				<div className="flex gap-2 mb-6 bg-white border border-gray-100 rounded-xl p-1 flex-wrap">
					{[
						{ id: "overview", label: "📊 Overview" },
						{ id: "fleet", label: "🚌 My Fleet" },
						{ id: "schedules", label: "📅 Schedules" },
						{ id: "addbus", label: "➕ Add Bus" },
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
								activeTab === tab.id
									? "bg-purple-600 text-blue-900 shadow-sm"
									: "text-gray-600 hover:bg-gray-50"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>

				{loading && (
					<div className="text-center py-20">
						<div className="text-4xl mb-3 animate-pulse">🚌</div>
						<p className="text-gray-500">Loading your dashboard...</p>
					</div>
				)}

				{/* Overview Tab */}
				{activeTab === "overview" && !loading && (
					<div className="space-y-6">
						{/* Revenue Card */}
						<Card className="border-0 shadow-sm bg-gradient-to-r from-green-600 to-green-500 text-white">
							<CardContent className="p-6">
								<div className="flex justify-between items-start">
									<div>
										<p className="text-green-100 text-sm mb-1">Total Revenue</p>
										<p className="text-4xl font-extrabold">
											LKR {(stats?.totalRevenue || 0).toLocaleString()}
										</p>
										<p className="text-green-100 text-sm mt-2">
											From {stats?.confirmedBookings || 0} confirmed bookings
										</p>
									</div>
									<span className="text-5xl">💰</span>
								</div>
							</CardContent>
						</Card>

						{/* Upcoming Schedules */}
						<Card className="border-0 shadow-sm">
							<CardHeader>
								<CardTitle className="text-base">
									📅 Upcoming Schedules
								</CardTitle>
							</CardHeader>
							<CardContent>
								{upcomingSchedules.length === 0 ? (
									<p className="text-gray-400 text-sm text-center py-6">
										No upcoming schedules
									</p>
								) : (
									<div className="space-y-3">
										{upcomingSchedules.slice(0, 5).map((schedule) => {
											const statusConfig = getStatusConfig(schedule.status);
											return (
												<div
													key={schedule.scheduleId}
													className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
												>
													<div className="flex items-center gap-3">
														<div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-xl">
															🚌
														</div>
														<div>
															<p className="font-semibold text-gray-800 text-sm">
																{schedule.origin} → {schedule.destination}
															</p>
															<p className="text-gray-400 text-xs">
																{schedule.licensePlate} ·{" "}
																{formatDate(schedule.departureTime)} at{" "}
																{formatTime(schedule.departureTime)}
															</p>
														</div>
													</div>
													<div className="text-right">
														<span
															className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig.color}`}
														>
															{statusConfig.label}
														</span>
														<p className="text-blue-600 font-bold text-sm mt-1">
															LKR {schedule.fare}
														</p>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Fleet Summary */}
						<Card className="border-0 shadow-sm">
							<CardHeader>
								<CardTitle className="text-base">🚌 Fleet Summary</CardTitle>
							</CardHeader>
							<CardContent>
								{buses.length === 0 ? (
									<div className="text-center py-6">
										<p className="text-gray-400 text-sm mb-4">
											No buses in your fleet yet
										</p>
										<Button
											size="sm"
											className="rounded-full"
											onClick={() => setActiveTab("addbus")}
										>
											+ Add Your First Bus
										</Button>
									</div>
								) : (
									<div className="space-y-3">
										{buses.map((bus) => {
											const busTypeConfig = getBusTypeConfig(bus.busType);
											return (
												<div
													key={bus.id}
													className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
												>
													<div className="flex items-center gap-3">
														<div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
															🚌
														</div>
														<div>
															<p className="font-bold text-gray-800">
																{bus.licensePlate}
															</p>
															<div className="flex items-center gap-2 mt-0.5">
																<span
																	className={`text-xs font-semibold px-2 py-0.5 rounded-full ${busTypeConfig.color}`}
																>
																	{busTypeConfig.label}
																</span>
																<span className="text-gray-400 text-xs">
																	{bus.totalSeats} seats
																</span>
															</div>
														</div>
													</div>
													<div className="text-right">
														<p className="text-blue-600 font-bold text-sm">
															{bus.totalMileage || 0} km
														</p>
														<p className="text-gray-400 text-xs">mileage</p>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				)}

				{/* Fleet Tab */}
				{activeTab === "fleet" && !loading && (
					<div className="space-y-4">
						{buses.length === 0 && (
							<Card className="border-0 shadow-sm">
								<CardContent className="py-16 text-center">
									<div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
										🚌
									</div>
									<h3 className="text-lg font-bold text-gray-800 mb-2">
										No buses yet
									</h3>
									<p className="text-gray-400 text-sm mb-6">
										Add your first bus to get started
									</p>
									<Button
										className="rounded-full px-6"
										onClick={() => setActiveTab("addbus")}
									>
										+ Add Bus
									</Button>
								</CardContent>
							</Card>
						)}
						{buses.map((bus) => {
							const busTypeConfig = getBusTypeConfig(bus.busType);
							const busSchedules = schedules.filter(
								(s) => s.licensePlate === bus.licensePlate
							);
							return (
								<Card
									key={bus.id}
									className="border-0 shadow-sm hover:shadow-md transition"
								>
									<CardContent className="p-6">
										<div className="flex justify-between items-start mb-4">
											<div className="flex items-center gap-3">
												<div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">
													🚌
												</div>
												<div>
													<h3 className="text-lg font-extrabold text-gray-800">
														{bus.licensePlate}
													</h3>
													<div className="flex items-center gap-2 mt-0.5">
														<span
															className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${busTypeConfig.color}`}
														>
															{busTypeConfig.label}
														</span>
														<span className="text-gray-400 text-xs">
															{bus.totalSeats} seats
														</span>
													</div>
												</div>
											</div>
											<div className="text-right">
												<p className="text-2xl font-extrabold text-blue-600">
													{bus.totalMileage || 0} km
												</p>
												<p className="text-gray-400 text-xs">total mileage</p>
											</div>
										</div>

										<Separator className="mb-4" />

										<div className="grid grid-cols-3 gap-3">
											<div className="bg-gray-50 rounded-xl p-3 text-center">
												<p className="text-xl font-extrabold text-gray-800">
													{busSchedules.length}
												</p>
												<p className="text-gray-400 text-xs">Schedules</p>
											</div>
											<div className="bg-gray-50 rounded-xl p-3 text-center">
												<p className="text-xl font-extrabold text-gray-800">
													{
														busSchedules.filter(
															(s) =>
																s.status === "scheduled" ||
																s.status === "active"
														).length
													}
												</p>
												<p className="text-gray-400 text-xs">Upcoming</p>
											</div>
											<div className="bg-gray-50 rounded-xl p-3 text-center">
												<p className="text-xl font-extrabold text-gray-800">
													{
														busSchedules.filter((s) => s.status === "completed")
															.length
													}
												</p>
												<p className="text-gray-400 text-xs">Completed</p>
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}

				{/* Schedules Tab */}
				{activeTab === "schedules" && !loading && (
					<div className="space-y-4">
						{schedules.length === 0 && (
							<Card className="border-0 shadow-sm">
								<CardContent className="py-16 text-center">
									<div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
										📅
									</div>
									<h3 className="text-lg font-bold text-gray-800 mb-2">
										No schedules yet
									</h3>
									<p className="text-gray-400 text-sm">
										Contact your administrator to add schedules for your buses
									</p>
								</CardContent>
							</Card>
						)}
						{schedules.map((schedule) => {
							const statusConfig = getStatusConfig(schedule.status);
							const busTypeConfig = getBusTypeConfig(schedule.busType);
							return (
								<Card
									key={schedule.scheduleId}
									className="border-0 shadow-sm hover:shadow-md transition"
								>
									<CardContent className="p-6">
										<div className="flex justify-between items-start mb-4">
											<div>
												<div className="flex items-center gap-3 mb-1">
													<h3 className="text-lg font-extrabold text-gray-800">
														{schedule.origin} → {schedule.destination}
													</h3>
													<span
														className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusConfig.color}`}
													>
														{statusConfig.label}
													</span>
												</div>
												<div className="flex items-center gap-2">
													<span
														className={`text-xs font-semibold px-2 py-0.5 rounded-full ${busTypeConfig.color}`}
													>
														{busTypeConfig.label}
													</span>
													<span className="text-gray-400 text-xs">
														{schedule.licensePlate}
													</span>
												</div>
											</div>
											<p className="text-blue-600 font-extrabold text-lg">
												LKR {schedule.fare}
											</p>
										</div>

										<Separator className="mb-4" />

										<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
											<div className="bg-gray-50 rounded-xl p-3">
												<p className="text-xs text-gray-400 mb-1">📅 Date</p>
												<p className="font-bold text-gray-800 text-sm">
													{formatDate(schedule.departureTime)}
												</p>
											</div>
											<div className="bg-gray-50 rounded-xl p-3">
												<p className="text-xs text-gray-400 mb-1">
													🕐 Departure
												</p>
												<p className="font-bold text-gray-800 text-sm">
													{formatTime(schedule.departureTime)}
												</p>
											</div>
											<div className="bg-gray-50 rounded-xl p-3">
												<p className="text-xs text-gray-400 mb-1">🏁 Arrival</p>
												<p className="font-bold text-gray-800 text-sm">
													{formatTime(schedule.arrivalTime)}
												</p>
											</div>
											<div className="bg-gray-50 rounded-xl p-3">
												<p className="text-xs text-gray-400 mb-1">
													📍 Distance
												</p>
												<p className="font-bold text-gray-800 text-sm">
													{schedule.distance || "N/A"}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}

				{/* Add Bus Tab */}
				{activeTab === "addbus" && !loading && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<Card className="border-0 shadow-sm">
							<CardHeader>
								<CardTitle className="text-lg">➕ Add New Bus</CardTitle>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleAddBus} className="space-y-4">
									<div>
										<Label className="mb-1.5 block">License Plate</Label>
										<Input
											value={busForm.licensePlate}
											onChange={(e) =>
												setBusForm({ ...busForm, licensePlate: e.target.value })
											}
											required
											placeholder="e.g. NB-1234"
											className="h-11"
										/>
									</div>
									<div>
										<Label className="mb-1.5 block">Bus Type</Label>
										<select
											value={busForm.busType}
											onChange={(e) =>
												setBusForm({ ...busForm, busType: e.target.value })
											}
											className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option value="AC">❄️ AC</option>
											<option value="non_AC">🚌 Non AC</option>
											<option value="luxury">✨ Luxury</option>
										</select>
									</div>
									<div>
										<Label className="mb-1.5 block">Total Seats</Label>
										<Input
											type="number"
											value={busForm.totalSeats}
											onChange={(e) =>
												setBusForm({ ...busForm, totalSeats: e.target.value })
											}
											required
											placeholder="e.g. 45"
											className="h-11"
										/>
									</div>
									<div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-600">
										ℹ️ Seats will be automatically generated based on the
										correct bus layout.
									</div>
									<Button
										type="submit"
										disabled={addingBus}
										className="w-full rounded-xl h-11"
									>
										{addingBus ? "Adding..." : "+ Add Bus"}
									</Button>
								</form>
							</CardContent>
						</Card>

						{/* Info Card */}
						<Card className="border-0 shadow-sm">
							<CardHeader>
								<CardTitle className="text-lg">📋 Important Notes</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{[
									{
										icon: "✅",
										title: "You can add buses",
										desc: "Add buses to your fleet anytime. Seats are generated automatically.",
									},
									{
										icon: "❌",
										title: "Routes & Schedules",
										desc: "Only administrators can add routes and schedules. Contact your admin to set up trips for your buses.",
									},
									{
										icon: "📊",
										title: "Revenue Tracking",
										desc: "Your revenue is automatically calculated based on confirmed bookings for your buses.",
									},
									{
										icon: "🗺️",
										title: "Mileage Tracking",
										desc: "Mileage is tracked by timekeepers at each station and updated in real time.",
									},
								].map((item) => (
									<div
										key={item.title}
										className="flex gap-3 p-3 bg-gray-50 rounded-xl"
									>
										<span className="text-xl flex-shrink-0">{item.icon}</span>
										<div>
											<p className="font-semibold text-gray-800 text-sm">
												{item.title}
											</p>
											<p className="text-gray-500 text-xs mt-0.5">
												{item.desc}
											</p>
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
}
