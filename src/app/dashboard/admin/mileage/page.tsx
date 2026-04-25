"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface BusMileage {
	busId: string;
	licensePlate: string;
	busType: string;
	totalSeats: number;
	totalMileage: number;
	completedTrips: number;
}

export default function MileagePage() {
	const router = useRouter();
	const [mileageData, setMileageData] = useState<BusMileage[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedBus, setSelectedBus] = useState<string>("");
	const [mileageInput, setMileageInput] = useState("");
	const [message, setMessage] = useState("");

	useEffect(() => {
		fetchMileage();
	}, []);

	const fetchMileage = async () => {
		try {
			const res = await fetch("/api/admin/mileage");
			const data = await res.json();
			if (res.ok) setMileageData(data.mileageData);
		} catch {
			console.error("Failed to fetch mileage");
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateMileage = async () => {
		if (!selectedBus || !mileageInput) return;

		try {
			const res = await fetch("/api/admin/mileage", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					busId: selectedBus,
					mileage: mileageInput,
				}),
			});
			const data = await res.json();
			if (res.ok) {
				setMessage("Mileage updated successfully!");
				setMileageInput("");
				setSelectedBus("");
				fetchMileage();
				setTimeout(() => setMessage(""), 3000);
			} else {
				setMessage(data.error || "Failed to update mileage");
			}
		} catch {
			setMessage("Something went wrong");
		}
	};

	const totalFleetMileage = mileageData.reduce(
		(acc, b) => acc + (b.totalMileage || 0),
		0
	);

	const getBusTypeColor = (busType: string) => {
		switch (busType) {
			case "AC":
				return "bg-blue-100 text-blue-700";
			case "luxury":
				return "bg-purple-100 text-purple-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

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

			<div className="max-w-4xl mx-auto px-6 py-10">
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-gray-800">Mileage Tracking</h1>
					<p className="text-gray-500 text-sm">
						Track kilometers traveled per bus
					</p>
				</div>

				{/* Fleet Stats */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
					<Card>
						<CardContent className="pt-6">
							<div className="text-2xl mb-1">🚌</div>
							<p className="text-xl font-bold text-gray-800">
								{mileageData.length}
							</p>
							<p className="text-gray-500 text-xs">Total Buses</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="text-2xl mb-1">🗺️</div>
							<p className="text-xl font-bold text-gray-800">
								{totalFleetMileage.toLocaleString()} km
							</p>
							<p className="text-gray-500 text-xs">Total Fleet Mileage</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="text-2xl mb-1">✅</div>
							<p className="text-xl font-bold text-gray-800">
								{mileageData.reduce((acc, b) => acc + b.completedTrips, 0)}
							</p>
							<p className="text-gray-500 text-xs">Completed Trips</p>
						</CardContent>
					</Card>
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

				{/* Add Mileage Form */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle>➕ Add Mileage to Bus</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex gap-4 flex-wrap">
							<div className="flex-1 min-w-48">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Select Bus
								</label>
								<select
									value={selectedBus}
									onChange={(e) => setSelectedBus(e.target.value)}
									className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="">Choose a bus...</option>
									{mileageData.map((bus) => (
										<option key={bus.busId} value={bus.busId}>
											{bus.licensePlate} ({bus.busType})
										</option>
									))}
								</select>
							</div>
							<div className="flex-1 min-w-48">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Kilometers to Add
								</label>
								<input
									type="number"
									value={mileageInput}
									onChange={(e) => setMileageInput(e.target.value)}
									placeholder="e.g. 160"
									className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div className="flex items-end">
								<Button
									onClick={handleUpdateMileage}
									disabled={!selectedBus || !mileageInput}
								>
									Update Mileage
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Mileage Table */}
				<Card>
					<CardHeader>
						<CardTitle>🚌 Fleet Mileage Overview</CardTitle>
					</CardHeader>
					<CardContent>
						{loading && (
							<p className="text-center text-gray-500 py-10">
								Loading mileage data...
							</p>
						)}
						{!loading && mileageData.length === 0 && (
							<p className="text-center text-gray-500 py-10">
								No buses found. Add buses first.
							</p>
						)}
						{!loading && mileageData.length > 0 && (
							<div className="space-y-4">
								{mileageData.map((bus, i) => (
									<div key={bus.busId}>
										<div className="flex justify-between items-center">
											<div className="flex items-center gap-3">
												<span className="text-2xl">🚌</span>
												<div>
													<p className="font-semibold text-gray-800">
														{bus.licensePlate}
													</p>
													<div className="flex items-center gap-2 mt-1">
														<span
															className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getBusTypeColor(
																bus.busType
															)}`}
														>
															{bus.busType}
														</span>
														<span className="text-gray-500 text-xs">
															{bus.totalSeats} seats
														</span>
														<span className="text-gray-500 text-xs">
															{bus.completedTrips} trips completed
														</span>
													</div>
												</div>
											</div>
											<div className="text-right">
												<p className="text-xl font-bold text-blue-600">
													{(bus.totalMileage || 0).toLocaleString()} km
												</p>
												<p className="text-gray-400 text-xs">total mileage</p>
											</div>
										</div>

										{/* Mileage Progress Bar */}
										<div className="mt-3">
											<div className="bg-gray-100 rounded-full h-2">
												<div
													className="bg-blue-600 h-2 rounded-full transition-all"
													style={{
														width: `${Math.min(
															totalFleetMileage > 0
																? ((bus.totalMileage || 0) /
																		totalFleetMileage) *
																		100
																: 0,
															100
														)}%`,
													}}
												/>
											</div>
											<p className="text-xs text-gray-400 mt-1">
												{totalFleetMileage > 0
													? (
															((bus.totalMileage || 0) / totalFleetMileage) *
															100
													  ).toFixed(1)
													: 0}
												% of fleet total
											</p>
										</div>

										{i < mileageData.length - 1 && (
											<Separator className="mt-4" />
										)}
									</div>
								))}

								<Separator />
								<div className="flex justify-between items-center pt-2">
									<p className="font-bold text-gray-800">Total Fleet Mileage</p>
									<p className="text-xl font-bold text-blue-600">
										{totalFleetMileage.toLocaleString()} km
									</p>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
