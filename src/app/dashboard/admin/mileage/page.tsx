"use client";

import { useEffect, useState } from "react";
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
	const [mileageData, setMileageData] = useState<BusMileage[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedBus, setSelectedBus] = useState<string>("");
	const [mileageInput, setMileageInput] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [updating, setUpdating] = useState(false);

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
		setUpdating(true);
		setError("");
		setMessage("");

		try {
			const res = await fetch("/api/admin/mileage", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ busId: selectedBus, mileage: mileageInput }),
			});
			const data = await res.json();
			if (res.ok) {
				setMessage("Mileage updated successfully!");
				setMileageInput("");
				setSelectedBus("");
				fetchMileage();
				setTimeout(() => setMessage(""), 3000);
			} else {
				setError(data.error || "Failed to update mileage");
			}
		} catch {
			setError("Something went wrong");
		} finally {
			setUpdating(false);
		}
	};

	const totalFleetMileage = mileageData.reduce(
		(acc, b) => acc + (b.totalMileage || 0),
		0
	);

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

	return (
		<div>
			{/* Top Bar */}
			<div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-30">
				<div>
					<h1 className="text-lg font-bold text-gray-800">
						🛣️ Mileage Tracking
					</h1>
					<p className="text-xs text-gray-400">HighwayLink Admin Panel</p>
				</div>
				<Button variant="outline" size="sm" onClick={() => window.print()}>
					🖨️ Print Report
				</Button>
			</div>

			<div className="p-8">
				{/* Fleet Stats */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
					{[
						{
							label: "Total Buses",
							value: mileageData.length,
							icon: "🚌",
							color: "bg-blue-50 text-blue-600",
						},
						{
							label: "Total Fleet Mileage",
							value: `${totalFleetMileage.toLocaleString()} km`,
							icon: "🛣️",
							color: "bg-green-50 text-green-600",
						},
						{
							label: "Completed Trips",
							value: mileageData.reduce((acc, b) => acc + b.completedTrips, 0),
							icon: "✅",
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
					<div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-2">
						<span>✅</span> {message}
					</div>
				)}
				{error && (
					<div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2">
						<span>⚠️</span> {error}
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Add Mileage Form */}
					<Card className="border-0 shadow-sm">
						<CardHeader>
							<CardTitle className="text-base">➕ Add Mileage</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">
									Select Bus
								</label>
								<select
									value={selectedBus}
									onChange={(e) => setSelectedBus(e.target.value)}
									className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="">Choose a bus...</option>
									{mileageData.map((bus) => (
										<option key={bus.busId} value={bus.busId}>
											{bus.licensePlate} ({bus.busType})
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">
									Kilometers to Add
								</label>
								<input
									type="number"
									value={mileageInput}
									onChange={(e) => setMileageInput(e.target.value)}
									placeholder="e.g. 160"
									className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<Button
								onClick={handleUpdateMileage}
								disabled={!selectedBus || !mileageInput || updating}
								className="w-full rounded-xl"
							>
								{updating ? "Updating..." : "➕ Update Mileage"}
							</Button>
						</CardContent>
					</Card>

					{/* Fleet Mileage Overview */}
					<div className="md:col-span-2">
						<Card className="border-0 shadow-sm">
							<CardHeader>
								<CardTitle className="text-base">
									🚌 Fleet Mileage Overview
								</CardTitle>
							</CardHeader>
							<CardContent>
								{loading && (
									<p className="text-center text-gray-400 py-8">
										Loading mileage data...
									</p>
								)}
								{!loading && mileageData.length === 0 && (
									<p className="text-center text-gray-400 py-8">
										No buses found. Add buses first.
									</p>
								)}
								{!loading && mileageData.length > 0 && (
									<div className="space-y-5">
										{mileageData.map((bus, i) => {
											const busTypeConfig = getBusTypeConfig(bus.busType);
											const percentage =
												totalFleetMileage > 0
													? ((bus.totalMileage || 0) / totalFleetMileage) * 100
													: 0;
											return (
												<div key={bus.busId}>
													<div className="flex justify-between items-center mb-2">
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
																	<span className="text-gray-400 text-xs">
																		{bus.completedTrips} trips
																	</span>
																</div>
															</div>
														</div>
														<div className="text-right">
															<p className="text-xl font-extrabold text-blue-600">
																{(bus.totalMileage || 0).toLocaleString()} km
															</p>
															<p className="text-gray-400 text-xs">
																{percentage.toFixed(1)}% of fleet
															</p>
														</div>
													</div>

													{/* Progress Bar */}
													<div className="bg-gray-100 rounded-full h-2">
														<div
															className="bg-blue-500 h-2 rounded-full transition-all"
															style={{ width: `${Math.min(percentage, 100)}%` }}
														/>
													</div>

													{i < mileageData.length - 1 && (
														<Separator className="mt-5" />
													)}
												</div>
											);
										})}

										<Separator />
										<div className="flex justify-between items-center pt-2">
											<p className="font-extrabold text-gray-800">
												Total Fleet Mileage
											</p>
											<p className="text-xl font-extrabold text-blue-600">
												{totalFleetMileage.toLocaleString()} km
											</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
