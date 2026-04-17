"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

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

export default function BusSearchPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const origin = searchParams.get("origin") || "";
	const destination = searchParams.get("destination") || "";
	const date = searchParams.get("date") || "";

	const [results, setResults] = useState<BusResult[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

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

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Navbar */}
			<nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
				<Link href="/" className="text-2xl font-bold text-blue-600">
					HighwayLink
				</Link>
				<div className="flex gap-4">
					<Link
						href="/login"
						className="text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
					>
						Login
					</Link>
					<Link
						href="/register"
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
					>
						Register
					</Link>
				</div>
			</nav>

			<div className="max-w-4xl mx-auto px-6 py-10">
				{/* Search Summary */}
				<div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
					<div>
						<span className="text-gray-500 text-sm">Searching buses from</span>
						<h2 className="text-lg font-bold text-gray-800">
							{origin} → {destination}
						</h2>
						<span className="text-gray-500 text-sm">{date}</span>
					</div>
					<button
						onClick={() => router.push("/")}
						className="text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition text-sm"
					>
						Change Search
					</button>
				</div>

				{/* Results */}
				{loading && (
					<div className="text-center py-20 text-gray-500">
						Searching for available buses...
					</div>
				)}

				{error && <div className="text-center py-20 text-red-500">{error}</div>}

				{!loading && !error && results.length === 0 && (
					<div className="text-center py-20">
						<div className="text-5xl mb-4">🚌</div>
						<h3 className="text-xl font-semibold text-gray-700 mb-2">
							No buses found
						</h3>
						<p className="text-gray-500">
							No buses available for this route on the selected date.
						</p>
					</div>
				)}

				{!loading && results.length > 0 && (
					<div className="space-y-4">
						<p className="text-gray-600 text-sm">
							{results.length} bus(es) found
						</p>
						{results.map((bus) => (
							<div
								key={bus.scheduleId}
								className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
							>
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-2">
										<span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
											{bus.busType}
										</span>
										<span className="text-gray-500 text-sm">
											{bus.licensePlate}
										</span>
									</div>
									<div className="flex items-center gap-4">
										<div>
											<p className="text-2xl font-bold text-gray-800">
												{formatTime(bus.departureTime)}
											</p>
											<p className="text-gray-500 text-sm">{bus.origin}</p>
										</div>
										<div className="text-gray-400 flex-1 text-center">
											<p className="text-xs text-gray-400">{bus.duration}</p>
											<div className="border-t border-gray-300 my-1"></div>
											<p className="text-xs text-gray-400">{bus.distance}</p>
										</div>
										<div>
											<p className="text-2xl font-bold text-gray-800">
												{formatTime(bus.arrivalTime)}
											</p>
											<p className="text-gray-500 text-sm">{bus.destination}</p>
										</div>
									</div>
								</div>

								<div className="text-center md:text-right">
									<p className="text-2xl font-bold text-blue-600 mb-1">
										LKR {bus.fare}
									</p>
									<p className="text-gray-500 text-sm mb-3">
										{bus.totalSeats} seats total
									</p>
									<button
										onClick={() => router.push(`/booking/${bus.scheduleId}`)}
										className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
									>
										Select Seats
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
