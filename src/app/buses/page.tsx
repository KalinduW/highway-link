"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import LoginModal from "@/components/LoginModal";

interface BusResult {
	scheduleId: string;
	departureTime: string;
	arrivalTime: string;
	fare: string;
	busType: string;
	totalSeats: number;
	licensePlate: string;
	origin: string;
	destination: string;
	distance: string;
	duration: string;
}

function NavBar() {
	const { user, isLoggedIn, logout } = useAuth();
	const router = useRouter();

	const handleLogout = () => {
		logout();
		router.push("/");
	};

	return (
		<nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50">
			<Link href="/" className="flex items-center gap-2">
				<span className="text-2xl">🚌</span>
				<span className="text-xl font-bold text-blue-600">HighwayLink</span>
			</Link>
			<div className="flex items-center gap-3">
				{isLoggedIn ? (
					<>
						<div className="hidden md:flex items-center gap-2">
							<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
								{user?.name
									.split(" ")
									.map((n: string) => n[0])
									.join("")
									.slice(0, 2)
									.toUpperCase()}
							</div>
							<span className="text-sm font-medium text-gray-700">
								{user?.name}
							</span>
						</div>
						<Link href="/dashboard/passenger">
							<Button variant="outline" size="sm" className="rounded-full">
								My Bookings
							</Button>
						</Link>
						<Button
							variant="outline"
							size="sm"
							className="rounded-full text-red-500 border-red-200 hover:bg-red-50"
							onClick={handleLogout}
						>
							Logout
						</Button>
					</>
				) : (
					<>
						<Link href="/login">
							<Button variant="outline" size="sm" className="rounded-full">
								Login
							</Button>
						</Link>
						<Link href="/register">
							<Button size="sm" className="rounded-full">
								Register
							</Button>
						</Link>
					</>
				)}
			</div>
		</nav>
	);
}

function BusSearchResults() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { isLoggedIn } = useAuth();
	const origin = searchParams.get("origin") || "";
	const destination = searchParams.get("destination") || "";
	const date = searchParams.get("date") || "";

	const [results, setResults] = useState<BusResult[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [sortBy, setSortBy] = useState("departure");
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [pendingScheduleId, setPendingScheduleId] = useState<string | null>(
		null
	);

	useEffect(() => {
		const fetchBuses = async () => {
			try {
				const res = await fetch(
					`/api/buses/search?origin=${origin}&destination=${destination}&date=${date}`
				);
				const data = await res.json();
				if (!res.ok) {
					setError(data.error || "Failed to fetch buses");
				} else {
					setResults(data.results);
				}
			} catch {
				setError("Something went wrong");
			} finally {
				setLoading(false);
			}
		};
		fetchBuses();
	}, [origin, destination, date]);

	const formatTime = (dateStr: string) => {
		return new Date(dateStr).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString("en-US", {
			weekday: "long",
			month: "long",
			day: "numeric",
		});
	};

	const getDuration = (departure: string, arrival: string) => {
		const diff = new Date(arrival).getTime() - new Date(departure).getTime();
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		return `${hours}h ${minutes}m`;
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

	const sortedResults = [...results].sort((a, b) => {
		if (sortBy === "fare") return parseFloat(a.fare) - parseFloat(b.fare);
		if (sortBy === "departure")
			return (
				new Date(a.departureTime).getTime() -
				new Date(b.departureTime).getTime()
			);
		return 0;
	});

	const handleSelectSeat = (scheduleId: string) => {
		if (!isLoggedIn) {
			setPendingScheduleId(scheduleId);
			setShowLoginModal(true);
		} else {
			router.push(`/booking/${scheduleId}`);
		}
	};

	return (
		<div className="max-w-4xl mx-auto px-6 py-8">
			{/* Search Summary */}
			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
				<div className="flex flex-wrap justify-between items-center gap-4">
					<div>
						<div className="flex items-center gap-3 mb-1">
							<h2 className="text-xl font-extrabold text-gray-800">
								{origin} → {destination}
							</h2>
							{results.length > 0 && (
								<span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
									{results.length} bus{results.length !== 1 ? "es" : ""} found
								</span>
							)}
						</div>
						<p className="text-gray-400 text-sm">
							📅 {date ? formatDate(date) : "Any date"}
						</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						className="rounded-full"
						onClick={() => router.push("/")}
					>
						← Modify Search
					</Button>
				</div>
			</div>

			{/* Loading */}
			{loading && (
				<div className="text-center py-20">
					<div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl animate-pulse">
						🚌
					</div>
					<p className="text-gray-500 font-medium">
						Searching for available buses...
					</p>
					<p className="text-gray-400 text-sm mt-1">This won't take long</p>
				</div>
			)}

			{/* Error */}
			{error && (
				<div className="text-center py-20">
					<div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
						⚠️
					</div>
					<p className="text-red-500 font-medium">{error}</p>
					<Button
						variant="outline"
						size="sm"
						className="mt-4 rounded-full"
						onClick={() => router.push("/")}
					>
						Try Again
					</Button>
				</div>
			)}

			{/* No Results */}
			{!loading && !error && results.length === 0 && (
				<div className="text-center py-20">
					<div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl">
						🚌
					</div>
					<h3 className="text-xl font-bold text-gray-700 mb-2">
						No buses found
					</h3>
					<p className="text-gray-400 mb-6">
						No buses available for{" "}
						<strong>
							{origin} → {destination}
						</strong>{" "}
						on this date.
					</p>
					<Button
						variant="outline"
						className="rounded-full"
						onClick={() => router.push("/")}
					>
						Change Route
					</Button>
				</div>
			)}

			{/* Results */}
			{!loading && sortedResults.length > 0 && (
				<div>
					{/* Sort Bar */}
					<div className="flex justify-between items-center mb-4">
						<p className="text-gray-500 text-sm">
							Showing <strong>{results.length}</strong> available bus
							{results.length !== 1 ? "es" : ""}
						</p>
						<div className="flex items-center gap-2">
							<span className="text-gray-400 text-sm">Sort by:</span>
							<div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1">
								{[
									{ id: "departure", label: "🕐 Departure" },
									{ id: "fare", label: "💰 Price" },
								].map((sort) => (
									<button
										key={sort.id}
										onClick={() => setSortBy(sort.id)}
										className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
											sortBy === sort.id
												? "bg-blue-600 text-white"
												: "text-gray-600 hover:bg-gray-50"
										}`}
									>
										{sort.label}
									</button>
								))}
							</div>
						</div>
					</div>

					<div className="space-y-4">
						{sortedResults.map((bus) => {
							const busTypeConfig = getBusTypeConfig(bus.busType);
							const tripDuration = getDuration(
								bus.departureTime,
								bus.arrivalTime
							);

							return (
								<Card
									key={bus.scheduleId}
									className="border-0 shadow-sm hover:shadow-md transition group"
								>
									<CardContent className="p-6">
										<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
											{/* Left — Times */}
											<div className="flex-1">
												<div className="flex items-center gap-4 mb-3">
													<span
														className={`text-xs font-semibold px-2.5 py-1 rounded-full ${busTypeConfig.color}`}
													>
														{busTypeConfig.label}
													</span>
													<span className="text-gray-400 text-xs">
														🚌 {bus.licensePlate}
													</span>
													<span className="text-gray-400 text-xs">
														💺 {bus.totalSeats} seats
													</span>
												</div>

												{/* Time Display */}
												<div className="flex items-center gap-4">
													<div className="text-center">
														<p className="text-2xl font-extrabold text-gray-800">
															{formatTime(bus.departureTime)}
														</p>
														<p className="text-gray-400 text-xs mt-0.5">
															{bus.origin}
														</p>
													</div>

													<div className="flex-1 flex flex-col items-center">
														<p className="text-xs text-gray-400 mb-1">
															{tripDuration}
														</p>
														<div className="w-full flex items-center gap-1">
															<div className="w-2 h-2 rounded-full bg-blue-400"></div>
															<div className="flex-1 h-0.5 bg-gray-200 relative">
																<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm">
																	✈️
																</div>
															</div>
															<div className="w-2 h-2 rounded-full bg-blue-600"></div>
														</div>
														<p className="text-xs text-gray-400 mt-1">
															{bus.distance || "Direct"}
														</p>
													</div>

													<div className="text-center">
														<p className="text-2xl font-extrabold text-gray-800">
															{formatTime(bus.arrivalTime)}
														</p>
														<p className="text-gray-400 text-xs mt-0.5">
															{bus.destination}
														</p>
													</div>
												</div>
											</div>

											{/* Right — Price & Book */}
											<div className="flex md:flex-col items-center md:items-end gap-4 md:gap-2 w-full md:w-auto">
												<div className="text-left md:text-right">
													<p className="text-2xl font-extrabold text-blue-600">
														LKR {bus.fare}
													</p>
													<p className="text-gray-400 text-xs">per seat</p>
												</div>
												<Button
													onClick={() => handleSelectSeat(bus.scheduleId)}
													className="rounded-full px-6 group-hover:bg-blue-700 transition"
												>
													Select Seats →
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			)}

			{/* Login Modal */}
			<LoginModal
				isOpen={showLoginModal}
				onClose={() => setShowLoginModal(false)}
				redirectTo={
					pendingScheduleId ? `/booking/${pendingScheduleId}` : undefined
				}
				message="Please login to book a seat on this bus"
			/>
		</div>
	);
}

export default function BusSearchPage() {
	return (
		<div className="min-h-screen bg-gray-50">
			<NavBar />
			<Suspense
				fallback={
					<div className="text-center py-20 text-gray-500">
						<div className="text-4xl mb-3 animate-pulse">🚌</div>
						Loading...
					</div>
				}
			>
				<BusSearchResults />
			</Suspense>
		</div>
	);
}
