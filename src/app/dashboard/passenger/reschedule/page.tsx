"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Schedule {
	scheduleId: string;
	departureTime: string;
	arrivalTime: string;
	fare: string;
	origin: string;
	destination: string;
	busType: string;
	licensePlate: string;
}

function RescheduleContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const bookingId = searchParams.get("bookingId");

	const [schedules, setSchedules] = useState<Schedule[]>([]);
	const [loading, setLoading] = useState(true);
	const [processing, setProcessing] = useState<string | null>(null);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		fetchSchedules();
	}, []);

	const fetchSchedules = async () => {
		try {
			const res = await fetch("/api/passenger/schedules");
			const data = await res.json();
			if (res.ok) setSchedules(data.schedules);
		} catch {
			setError("Failed to load schedules");
		} finally {
			setLoading(false);
		}
	};

	const handleReschedule = async (newScheduleId: string) => {
		setProcessing(newScheduleId);
		setError("");
		setMessage("");

		try {
			const res = await fetch("/api/passenger/reschedule", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ bookingId, newScheduleId }),
			});
			const data = await res.json();
			if (!res.ok) {
				setError(data.error || "Failed to reschedule");
			} else {
				setMessage("Booking rescheduled successfully!");
				setTimeout(() => router.push("/dashboard/passenger"), 2000);
			}
		} catch {
			setError("Something went wrong");
		} finally {
			setProcessing(null);
		}
	};

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
			year: "numeric",
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

	const filteredSchedules = schedules.filter(
		(s) =>
			s.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
			s.destination.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="max-w-3xl mx-auto px-6 py-10">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-2">
					<div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
						🔄
					</div>
					<div>
						<h1 className="text-2xl font-extrabold text-gray-800">
							Reschedule Booking
						</h1>
						<p className="text-gray-400 text-sm">
							Select a new schedule for your trip
						</p>
					</div>
				</div>
			</div>

			{/* Info Note */}
			<div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
				<span className="text-blue-500 text-lg">ℹ️</span>
				<div>
					<p className="text-blue-700 text-sm font-semibold mb-0.5">
						Rescheduling Policy
					</p>
					<p className="text-blue-600 text-sm">
						You can reschedule your booking up to 2 hours before departure. Your
						seat preference may change based on availability.
					</p>
				</div>
			</div>

			{/* Success */}
			{message && (
				<div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
					<span className="text-2xl">✅</span>
					<div>
						<p className="text-green-700 font-bold">{message}</p>
						<p className="text-green-600 text-sm">
							Redirecting to your dashboard...
						</p>
					</div>
				</div>
			)}

			{/* Error */}
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
					<span className="text-2xl">⚠️</span>
					<p className="text-red-600 text-sm">{error}</p>
				</div>
			)}

			{/* Search */}
			<div className="mb-6">
				<input
					type="text"
					placeholder="Search by origin or destination..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>

			{/* Loading */}
			{loading && (
				<div className="text-center py-20">
					<div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl animate-pulse">
						📅
					</div>
					<p className="text-gray-500">Loading available schedules...</p>
				</div>
			)}

			{/* No schedules */}
			{!loading && filteredSchedules.length === 0 && (
				<Card className="border-0 shadow-sm">
					<CardContent className="py-16 text-center">
						<div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
							📅
						</div>
						<h3 className="text-lg font-bold text-gray-800 mb-2">
							No schedules found
						</h3>
						<p className="text-gray-400 text-sm">
							No available schedules match your search
						</p>
					</CardContent>
				</Card>
			)}

			{/* Schedules List */}
			{!loading && (
				<div className="space-y-4">
					{filteredSchedules.map((schedule) => {
						const busTypeConfig = getBusTypeConfig(schedule.busType);
						const isProcessing = processing === schedule.scheduleId;

						return (
							<Card
								key={schedule.scheduleId}
								className="border-0 shadow-sm hover:shadow-md transition group"
							>
								<CardContent className="p-6">
									<div className="flex justify-between items-start gap-4">
										<div className="flex-1">
											{/* Route */}
											<div className="flex items-center gap-3 mb-3">
												<h3 className="font-extrabold text-gray-800 text-lg">
													{schedule.origin} → {schedule.destination}
												</h3>
												<span
													className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${busTypeConfig.color}`}
												>
													{busTypeConfig.label}
												</span>
											</div>

											{/* Date */}
											<p className="text-gray-500 text-sm mb-3">
												📅 {formatDate(schedule.departureTime)}
											</p>

											{/* Times */}
											<div className="flex items-center gap-4">
												<div className="text-center">
													<p className="text-xl font-extrabold text-gray-800">
														{formatTime(schedule.departureTime)}
													</p>
													<p className="text-gray-400 text-xs">
														{schedule.origin}
													</p>
												</div>

												<div className="flex-1 flex flex-col items-center">
													<p className="text-xs text-gray-400 mb-1">
														{getDuration(
															schedule.departureTime,
															schedule.arrivalTime
														)}
													</p>
													<div className="w-full flex items-center gap-1">
														<div className="w-2 h-2 rounded-full bg-blue-400"></div>
														<div className="flex-1 h-0.5 bg-gray-200"></div>
														<div className="w-2 h-2 rounded-full bg-blue-600"></div>
													</div>
												</div>

												<div className="text-center">
													<p className="text-xl font-extrabold text-gray-800">
														{formatTime(schedule.arrivalTime)}
													</p>
													<p className="text-gray-400 text-xs">
														{schedule.destination}
													</p>
												</div>
											</div>

											<Separator className="my-3" />

											{/* Bus Info */}
											<div className="flex items-center gap-4 text-xs text-gray-400">
												<span>🚌 {schedule.licensePlate}</span>
												<span>💰 LKR {schedule.fare} per seat</span>
											</div>
										</div>

										{/* Select Button */}
										<div className="flex flex-col items-end gap-2">
											<p className="text-2xl font-extrabold text-blue-600">
												LKR {schedule.fare}
											</p>
											<Button
												onClick={() => handleReschedule(schedule.scheduleId)}
												disabled={!!processing}
												className="rounded-full px-5"
												size="sm"
											>
												{isProcessing ? "Selecting..." : "Select →"}
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default function ReschedulePage() {
	const router = useRouter();
	return (
		<div className="min-h-screen bg-gray-50">
			{/* Navbar */}
			<nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50">
				<Link href="/" className="flex items-center gap-2">
					<span className="text-2xl">🚌</span>
					<span className="text-xl font-bold text-blue-600">HighwayLink</span>
				</Link>
				<Button
					variant="outline"
					size="sm"
					className="rounded-full"
					onClick={() => router.push("/dashboard/passenger")}
				>
					← Back to Dashboard
				</Button>
			</nav>
			<Suspense
				fallback={
					<div className="text-center py-20 text-gray-500">
						<div className="text-4xl mb-3 animate-pulse">🔄</div>
						Loading...
					</div>
				}
			>
				<RescheduleContent />
			</Suspense>
		</div>
	);
}
