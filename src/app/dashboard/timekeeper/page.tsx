"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

interface TimeLog {
	id: string;
	scheduleId: string;
	station: string;
	type: string;
	scheduledTime: string;
	actualTime: string;
	minutesLate: number;
	status: string;
	createdAt: string;
	timekeeperName: string;
}

export default function TimekeeperDashboard() {
	const router = useRouter();
	const [schedules, setSchedules] = useState<Schedule[]>([]);
	const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
	const [station, setStation] = useState("");
	const [timekeeperId, setTimekeeperId] = useState("");
	const [email, setEmail] = useState("");
	const [userName, setUserName] = useState("");
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("today");
	const [marking, setMarking] = useState<string | null>(null);
	const [undoing, setUndoing] = useState<string | null>(null);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [undoErrors, setUndoErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		const storedEmail = localStorage.getItem("userEmail");
		const storedName = localStorage.getItem("userName");
		if (!storedEmail) {
			router.push("/login");
			return;
		}
		setEmail(storedEmail);
		setUserName(storedName || "");
		fetchSchedules(storedEmail);
	}, []);

	const fetchSchedules = async (userEmail: string) => {
		try {
			const res = await fetch(`/api/timekeeper/schedules?email=${userEmail}`);
			const data = await res.json();
			if (res.ok) {
				setSchedules(data.schedules);
				setTimeLogs(data.timeLogs);
				setStation(data.station);
				setTimekeeperId(data.timekeeperId);
			} else {
				setError(data.error || "Failed to load schedules");
			}
		} catch {
			setError("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	const handleMark = async (
		scheduleId: string,
		type: "departure" | "arrival"
	) => {
		setMarking(`${scheduleId}-${type}`);
		setMessage("");
		setError("");

		try {
			const res = await fetch("/api/timekeeper/mark", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ scheduleId, type, email }),
			});
			const data = await res.json();
			if (!res.ok) {
				setError(data.error || "Failed to mark");
			} else {
				setMessage(`Bus marked as ${type} successfully!`);
				fetchSchedules(email);
				setTimeout(() => setMessage(""), 4000);
			}
		} catch {
			setError("Something went wrong");
		} finally {
			setMarking(null);
		}
	};

	const handleUndo = async (logId: string) => {
		setUndoing(logId);
		setUndoErrors((prev) => ({ ...prev, [logId]: "" }));

		try {
			const res = await fetch("/api/timekeeper/undo", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ logId }),
			});
			const data = await res.json();
			if (!res.ok) {
				setUndoErrors((prev) => ({ ...prev, [logId]: data.error }));
			} else {
				setMessage("Mark undone successfully!");
				fetchSchedules(email);
				setTimeout(() => setMessage(""), 3000);
			}
		} catch {
			setUndoErrors((prev) => ({ ...prev, [logId]: "Something went wrong" }));
		} finally {
			setUndoing(null);
		}
	};

	const getLogForSchedule = (
		scheduleId: string,
		type: string,
		logStation: string
	) => {
		return timeLogs.find(
			(l) =>
				l.scheduleId === scheduleId &&
				l.type === type &&
				l.station.toLowerCase() === logStation.toLowerCase()
		);
	};

	const formatTime = (dateStr: string) => {
		return new Date(dateStr).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatDateTime = (dateStr: string) => {
		return new Date(dateStr).toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	};

	const getStatusStyle = (minutesLate: number) => {
		if (minutesLate >= 5) return "text-red-600 bg-red-50 border-red-200";
		return "text-green-600 bg-green-50 border-green-200";
	};

	const getStatusLabel = (minutesLate: number) => {
		if (minutesLate >= 10) return `⚠️ LATE ${minutesLate} mins`;
		if (minutesLate >= 5) return `🔴 ${minutesLate} mins late`;
		return "✅ On Time";
	};

	const handleLogout = () => {
		localStorage.removeItem("userEmail");
		localStorage.removeItem("userName");
		router.push("/");
	};

	const initials = userName
		? userName
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "T";

	// Schedules where this station is the origin (departure)
	const departureSchedules = schedules.filter(
		(s) => s.origin.toLowerCase() === station.toLowerCase()
	);

	// Schedules where this station is the destination (arrival)
	const arrivalSchedules = schedules.filter(
		(s) => s.destination.toLowerCase() === station.toLowerCase()
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
						<div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
							{initials}
						</div>
						<div>
							<p className="text-sm font-semibold text-gray-800">{userName}</p>
							<p className="text-xs text-gray-400">Timekeeper — {station}</p>
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
				<div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-6 mb-8 text-white flex justify-between items-center">
					<div>
						<p className="text-orange-100 text-sm mb-1">Welcome back,</p>
						<h1 className="text-2xl font-extrabold">{userName} ⏱️</h1>
						<p className="text-orange-100 text-sm mt-1">
							Station: <strong>{station}</strong>
						</p>
					</div>
					<div className="text-right">
						<p className="text-orange-100 text-xs mb-1">Today's Buses</p>
						<p className="text-3xl font-extrabold">{schedules.length}</p>
					</div>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
					{[
						{
							label: "Total Buses",
							value: schedules.length,
							icon: "🚌",
							color: "bg-blue-50 text-blue-600",
						},
						{
							label: "Departures",
							value: departureSchedules.length,
							icon: "🛫",
							color: "bg-orange-50 text-orange-600",
						},
						{
							label: "Arrivals",
							value: arrivalSchedules.length,
							icon: "🛬",
							color: "bg-green-50 text-green-600",
						},
						{
							label: "Marked Today",
							value: timeLogs.filter(
								(l) => l.station.toLowerCase() === station.toLowerCase()
							).length,
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

				{/* No station warning */}
				{!station && !loading && (
					<div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center mb-6">
						<p className="text-3xl mb-3">⚠️</p>
						<p className="text-yellow-800 font-bold mb-1">
							No Station Assigned
						</p>
						<p className="text-yellow-600 text-sm">
							Please contact your administrator to assign a station to your
							account.
						</p>
					</div>
				)}

				{/* Tabs */}
				<div className="flex gap-2 mb-6 bg-white border border-gray-100 rounded-xl p-1 flex-wrap">
					{[
						{ id: "today", label: "📅 Today's Buses" },
						{ id: "departures", label: "🛫 Departures" },
						{ id: "arrivals", label: "🛬 Arrivals" },
						{ id: "logs", label: "📋 Time Logs" },
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
								activeTab === tab.id
									? "bg-orange-500 text-white shadow-sm"
									: "text-gray-600 hover:bg-gray-50"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>

				{loading && (
					<div className="text-center py-20">
						<div className="text-4xl mb-3 animate-pulse">⏱️</div>
						<p className="text-gray-500">Loading schedules...</p>
					</div>
				)}

				{/* Today's Buses Tab */}
				{activeTab === "today" && !loading && (
					<div className="space-y-4">
						{schedules.length === 0 && (
							<Card className="border-0 shadow-sm">
								<CardContent className="py-16 text-center">
									<div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
										🚌
									</div>
									<h3 className="text-lg font-bold text-gray-800 mb-2">
										No buses today
									</h3>
									<p className="text-gray-400 text-sm">
										No buses scheduled for {station} today
									</p>
								</CardContent>
							</Card>
						)}
						{schedules.map((schedule) => {
							const isDeparture =
								schedule.origin.toLowerCase() === station.toLowerCase();
							const isArrival =
								schedule.destination.toLowerCase() === station.toLowerCase();
							const departureLog = getLogForSchedule(
								schedule.scheduleId,
								"departure",
								schedule.origin
							);
							const arrivalLog = getLogForSchedule(
								schedule.scheduleId,
								"arrival",
								schedule.destination
							);
							const stationLog = isDeparture ? departureLog : arrivalLog;
							const logType = isDeparture ? "departure" : "arrival";

							return (
								<Card
									key={schedule.scheduleId}
									className="border-0 shadow-sm hover:shadow-md transition"
								>
									<CardContent className="p-6">
										{/* Header */}
										<div className="flex justify-between items-start mb-4">
											<div>
												<div className="flex items-center gap-3 mb-1">
													<h3 className="text-lg font-extrabold text-gray-800">
														{schedule.origin} → {schedule.destination}
													</h3>
													<span
														className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
															isDeparture
																? "bg-orange-100 text-orange-700"
																: "bg-green-100 text-green-700"
														}`}
													>
														{isDeparture ? "🛫 Departure" : "🛬 Arrival"}
													</span>
												</div>
												<p className="text-gray-400 text-sm">
													🚌 {schedule.busType} — {schedule.licensePlate}
												</p>
											</div>
										</div>

										<Separator className="mb-4" />

										{/* Times */}
										<div className="grid grid-cols-2 gap-4 mb-4">
											<div className="bg-gray-50 rounded-xl p-3">
												<p className="text-xs text-gray-400 mb-1">
													{isDeparture
														? "🕐 Scheduled Departure"
														: "🕐 Scheduled Arrival"}
												</p>
												<p className="text-lg font-extrabold text-gray-800">
													{isDeparture
														? formatTime(schedule.departureTime)
														: formatTime(schedule.arrivalTime)}
												</p>
											</div>
											<div
												className={`rounded-xl p-3 border ${
													stationLog
														? getStatusStyle(stationLog.minutesLate)
														: "bg-gray-50 border-gray-100"
												}`}
											>
												<p className="text-xs text-gray-400 mb-1">
													{isDeparture
														? "✅ Actual Departure"
														: "✅ Actual Arrival"}
												</p>
												{stationLog ? (
													<>
														<p className="text-lg font-extrabold">
															{formatTime(stationLog.actualTime)}
														</p>
														<p className="text-xs font-semibold mt-0.5">
															{getStatusLabel(stationLog.minutesLate)}
														</p>
													</>
												) : (
													<p className="text-gray-400 text-sm font-medium">
														Not marked yet
													</p>
												)}
											</div>
										</div>

										{/* Other station logs */}
										{departureLog && isDeparture === false && (
											<div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
												<p className="text-xs text-blue-500 mb-1">
													🛫 Departed {schedule.origin} at
												</p>
												<p className="font-bold text-blue-700">
													{formatTime(departureLog.actualTime)}
													{departureLog.minutesLate >= 5 && (
														<span className="text-red-500 text-xs ml-2">
															({departureLog.minutesLate} mins late)
														</span>
													)}
												</p>
												<p className="text-xs text-blue-400">
													Marked by {departureLog.timekeeperName}
												</p>
											</div>
										)}

										{arrivalLog && isArrival === false && (
											<div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
												<p className="text-xs text-green-500 mb-1">
													🛬 Arrived {schedule.destination} at
												</p>
												<p className="font-bold text-green-700">
													{formatTime(arrivalLog.actualTime)}
													{arrivalLog.minutesLate >= 5 && (
														<span className="text-red-500 text-xs ml-2">
															({arrivalLog.minutesLate} mins late)
														</span>
													)}
												</p>
												<p className="text-xs text-green-400">
													Marked by {arrivalLog.timekeeperName}
												</p>
											</div>
										)}

										{/* Mark Button */}
										{!stationLog && (
											<Button
												onClick={() =>
													handleMark(
														schedule.scheduleId,
														logType as "departure" | "arrival"
													)
												}
												disabled={
													marking === `${schedule.scheduleId}-${logType}`
												}
												className={`w-full rounded-full ${
													isDeparture
														? "bg-orange-500 hover:bg-orange-600"
														: "bg-green-600 hover:bg-green-700"
												}`}
											>
												{marking === `${schedule.scheduleId}-${logType}`
													? "Marking..."
													: isDeparture
													? "🛫 Mark as Departed"
													: "🛬 Mark as Arrived"}
											</Button>
										)}

										{/* Undo Button */}
										{stationLog && (
											<div>
												<div className="flex items-center justify-between mb-2">
													<p className="text-xs text-gray-400">
														Marked at {formatDateTime(stationLog.createdAt)} by
														you
													</p>
													<button
														onClick={() => handleUndo(stationLog.id)}
														disabled={undoing === stationLog.id}
														className="text-xs text-red-500 hover:text-red-700 font-medium border border-red-200 px-3 py-1 rounded-full hover:bg-red-50 transition"
													>
														{undoing === stationLog.id
															? "Undoing..."
															: "↩️ Undo"}
													</button>
												</div>
												{undoErrors[stationLog.id] && (
													<div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs">
														⚠️ {undoErrors[stationLog.id]}
													</div>
												)}
											</div>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}

				{/* Departures Tab */}
				{activeTab === "departures" && !loading && (
					<div className="space-y-4">
						{departureSchedules.length === 0 && (
							<Card className="border-0 shadow-sm">
								<CardContent className="py-16 text-center">
									<div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
										🛫
									</div>
									<h3 className="text-lg font-bold text-gray-800 mb-2">
										No departures today
									</h3>
									<p className="text-gray-400 text-sm">
										No buses departing from {station} today
									</p>
								</CardContent>
							</Card>
						)}
						{departureSchedules.map((schedule) => {
							const log = getLogForSchedule(
								schedule.scheduleId,
								"departure",
								station
							);
							return (
								<Card key={schedule.scheduleId} className="border-0 shadow-sm">
									<CardContent className="p-6">
										<div className="flex justify-between items-start mb-3">
											<div>
												<h3 className="font-extrabold text-gray-800">
													{schedule.origin} → {schedule.destination}
												</h3>
												<p className="text-gray-400 text-sm">
													🚌 {schedule.licensePlate}
												</p>
											</div>
											<span className="text-2xl font-extrabold text-orange-500">
												{formatTime(schedule.departureTime)}
											</span>
										</div>
										<Separator className="mb-3" />
										{log ? (
											<div
												className={`rounded-xl p-3 border ${getStatusStyle(
													log.minutesLate
												)}`}
											>
												<p className="text-sm font-bold">
													Departed at {formatTime(log.actualTime)}
												</p>
												<p className="text-xs mt-0.5">
													{getStatusLabel(log.minutesLate)}
												</p>
												<p className="text-xs opacity-60 mt-1">
													{formatDateTime(log.createdAt)}
												</p>
												<button
													onClick={() => handleUndo(log.id)}
													className="text-xs text-red-500 mt-2 border border-red-200 px-3 py-1 rounded-full hover:bg-red-50 transition"
												>
													↩️ Undo
												</button>
												{undoErrors[log.id] && (
													<p className="text-red-600 text-xs mt-2">
														⚠️ {undoErrors[log.id]}
													</p>
												)}
											</div>
										) : (
											<Button
												onClick={() =>
													handleMark(schedule.scheduleId, "departure")
												}
												disabled={
													marking === `${schedule.scheduleId}-departure`
												}
												className="w-full rounded-full bg-orange-500 hover:bg-orange-600"
											>
												{marking === `${schedule.scheduleId}-departure`
													? "Marking..."
													: "🛫 Mark as Departed"}
											</Button>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}

				{/* Arrivals Tab */}
				{activeTab === "arrivals" && !loading && (
					<div className="space-y-4">
						{arrivalSchedules.length === 0 && (
							<Card className="border-0 shadow-sm">
								<CardContent className="py-16 text-center">
									<div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
										🛬
									</div>
									<h3 className="text-lg font-bold text-gray-800 mb-2">
										No arrivals today
									</h3>
									<p className="text-gray-400 text-sm">
										No buses arriving at {station} today
									</p>
								</CardContent>
							</Card>
						)}
						{arrivalSchedules.map((schedule) => {
							const log = getLogForSchedule(
								schedule.scheduleId,
								"arrival",
								station
							);
							return (
								<Card key={schedule.scheduleId} className="border-0 shadow-sm">
									<CardContent className="p-6">
										<div className="flex justify-between items-start mb-3">
											<div>
												<h3 className="font-extrabold text-gray-800">
													{schedule.origin} → {schedule.destination}
												</h3>
												<p className="text-gray-400 text-sm">
													🚌 {schedule.licensePlate}
												</p>
											</div>
											<span className="text-2xl font-extrabold text-green-600">
												{formatTime(schedule.arrivalTime)}
											</span>
										</div>
										<Separator className="mb-3" />
										{log ? (
											<div
												className={`rounded-xl p-3 border ${getStatusStyle(
													log.minutesLate
												)}`}
											>
												<p className="text-sm font-bold">
													Arrived at {formatTime(log.actualTime)}
												</p>
												<p className="text-xs mt-0.5">
													{getStatusLabel(log.minutesLate)}
												</p>
												<p className="text-xs opacity-60 mt-1">
													{formatDateTime(log.createdAt)}
												</p>
												<button
													onClick={() => handleUndo(log.id)}
													className="text-xs text-red-500 mt-2 border border-red-200 px-3 py-1 rounded-full hover:bg-red-50 transition"
												>
													↩️ Undo
												</button>
												{undoErrors[log.id] && (
													<p className="text-red-600 text-xs mt-2">
														⚠️ {undoErrors[log.id]}
													</p>
												)}
											</div>
										) : (
											<Button
												onClick={() =>
													handleMark(schedule.scheduleId, "arrival")
												}
												disabled={marking === `${schedule.scheduleId}-arrival`}
												className="w-full rounded-full bg-green-600 hover:bg-green-700"
											>
												{marking === `${schedule.scheduleId}-arrival`
													? "Marking..."
													: "🛬 Mark as Arrived"}
											</Button>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}

				{/* Time Logs Tab */}
				{activeTab === "logs" && !loading && (
					<div className="space-y-4">
						<div className="bg-white rounded-2xl shadow-sm overflow-hidden border-0">
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead className="bg-gray-50 border-b">
										<tr>
											<th className="text-left px-6 py-4 text-gray-500 font-semibold text-xs uppercase">
												Bus
											</th>
											<th className="text-left px-6 py-4 text-gray-500 font-semibold text-xs uppercase">
												Station
											</th>
											<th className="text-left px-6 py-4 text-gray-500 font-semibold text-xs uppercase">
												Type
											</th>
											<th className="text-left px-6 py-4 text-gray-500 font-semibold text-xs uppercase">
												Scheduled
											</th>
											<th className="text-left px-6 py-4 text-gray-500 font-semibold text-xs uppercase">
												Actual
											</th>
											<th className="text-left px-6 py-4 text-gray-500 font-semibold text-xs uppercase">
												Status
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-50">
										{timeLogs.length === 0 && (
											<tr>
												<td
													colSpan={6}
													className="text-center py-10 text-gray-400"
												>
													No time logs yet
												</td>
											</tr>
										)}
										{timeLogs.map((log) => (
											<tr key={log.id} className="hover:bg-gray-50 transition">
												<td className="px-6 py-4 font-medium text-gray-800">
													{log.station}
												</td>
												<td className="px-6 py-4 text-gray-600">
													{log.station}
												</td>
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
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
