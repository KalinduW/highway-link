"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface TimeLog {
	id: string;
	type: string;
	station: string;
	scheduledTime: string;
	actualTime: string;
	minutesLate: number;
	status: string;
	createdAt: string;
	timekeeperName: string;
	origin: string;
	destination: string;
	licensePlate: string;
	busType: string;
}

export default function AdminTimeLogsPage() {
	const [logs, setLogs] = useState<TimeLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState("all");
	const [filterStatus, setFilterStatus] = useState("all");

	useEffect(() => {
		fetchLogs();
	}, []);

	const fetchLogs = async () => {
		try {
			const res = await fetch("/api/admin/timelogs");
			const data = await res.json();
			if (res.ok) setLogs(data.logs);
		} catch {
			console.error("Failed to fetch logs");
		} finally {
			setLoading(false);
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
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const getStatusStyle = (minutesLate: number) => {
		if (minutesLate >= 10) return "bg-red-100 text-red-700 border-red-200";
		if (minutesLate >= 5)
			return "bg-orange-100 text-orange-700 border-orange-200";
		return "bg-green-100 text-green-700 border-green-200";
	};

	const getStatusLabel = (minutesLate: number) => {
		if (minutesLate >= 10) return `⚠️ LATE ${minutesLate} mins`;
		if (minutesLate >= 5) return `🔴 ${minutesLate} mins late`;
		return "✅ On Time";
	};

	const filteredLogs = logs.filter((log) => {
		const matchesSearch =
			log.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
			log.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
			log.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
			log.station.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesType = filterType === "all" || log.type === filterType;
		const matchesStatus =
			filterStatus === "all" ||
			(filterStatus === "late" && log.minutesLate >= 10) ||
			(filterStatus === "on_time" && log.minutesLate < 5);
		return matchesSearch && matchesType && matchesStatus;
	});

	const lateCount = logs.filter((l) => l.minutesLate >= 10).length;
	const onTimeCount = logs.filter((l) => l.minutesLate < 5).length;

	return (
		<div>
			{/* Top Bar */}
			<div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-30">
				<div>
					<h1 className="text-lg font-bold text-gray-800">
						⏱️ Time Logs Report
					</h1>
					<p className="text-xs text-gray-400">HighwayLink Admin Panel</p>
				</div>
				<Button variant="outline" size="sm" onClick={() => window.print()}>
					🖨️ Print Report
				</Button>
			</div>

			<div className="p-8">
				{/* Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
					{[
						{
							label: "Total Logs",
							value: logs.length,
							icon: "📋",
							color: "bg-blue-50 text-blue-600",
						},
						{
							label: "On Time",
							value: onTimeCount,
							icon: "✅",
							color: "bg-green-50 text-green-600",
						},
						{
							label: "Late (10+ mins)",
							value: lateCount,
							icon: "⚠️",
							color: "bg-red-50 text-red-600",
						},
						{
							label: "Departures",
							value: logs.filter((l) => l.type === "departure").length,
							icon: "🛫",
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

				{/* Search & Filter */}
				<div className="flex gap-4 mb-6 flex-wrap">
					<Input
						placeholder="Search by route, bus or station..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="flex-1 min-w-48"
					/>
					<select
						value={filterType}
						onChange={(e) => setFilterType(e.target.value)}
						className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="all">All Types</option>
						<option value="departure">Departures</option>
						<option value="arrival">Arrivals</option>
					</select>
					<select
						value={filterStatus}
						onChange={(e) => setFilterStatus(e.target.value)}
						className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="all">All Status</option>
						<option value="on_time">On Time</option>
						<option value="late">Late</option>
					</select>
				</div>

				{/* Table */}
				<Card className="border-0 shadow-sm overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-gray-50 border-b">
								<tr>
									<th className="text-left px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">
										Route
									</th>
									<th className="text-left px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">
										Bus
									</th>
									<th className="text-left px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">
										Station
									</th>
									<th className="text-left px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">
										Type
									</th>
									<th className="text-left px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">
										Scheduled
									</th>
									<th className="text-left px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">
										Actual
									</th>
									<th className="text-left px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">
										Status
									</th>
									<th className="text-left px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">
										Timekeeper
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-50">
								{loading && (
									<tr>
										<td colSpan={8} className="text-center py-10 text-gray-400">
											Loading logs...
										</td>
									</tr>
								)}
								{!loading && filteredLogs.length === 0 && (
									<tr>
										<td colSpan={8} className="text-center py-10 text-gray-400">
											No time logs found
										</td>
									</tr>
								)}
								{filteredLogs.map((log) => (
									<tr
										key={log.id}
										className={`hover:bg-gray-50 transition ${
											log.minutesLate >= 5 ? "bg-red-50" : ""
										}`}
									>
										<td className="px-6 py-4">
											<p className="font-semibold text-gray-800">
												{log.origin} → {log.destination}
											</p>
											<p className="text-gray-400 text-xs">
												{formatDate(log.createdAt)}
											</p>
										</td>
										<td className="px-6 py-4">
											<p className="font-medium text-gray-800">
												{log.licensePlate}
											</p>
											<p className="text-gray-400 text-xs">{log.busType}</p>
										</td>
										<td className="px-6 py-4 text-gray-600">{log.station}</td>
										<td className="px-6 py-4">
											<span
												className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
													log.type === "departure"
														? "bg-orange-100 text-orange-700"
														: "bg-green-100 text-green-700"
												}`}
											>
												{log.type === "departure"
													? "🛫 Departure"
													: "🛬 Arrival"}
											</span>
										</td>
										<td className="px-6 py-4 text-gray-600">
											{formatTime(log.scheduledTime)}
										</td>
										<td className="px-6 py-4 font-semibold text-gray-800">
											{formatTime(log.actualTime)}
										</td>
										<td className="px-6 py-4">
											<span
												className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusStyle(
													log.minutesLate
												)}`}
											>
												{getStatusLabel(log.minutesLate)}
											</span>
										</td>
										<td className="px-6 py-4 text-gray-600 text-xs">
											{log.timekeeperName}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Card>
			</div>
		</div>
	);
}
