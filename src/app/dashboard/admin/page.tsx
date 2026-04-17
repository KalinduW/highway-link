"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
	const [activeTab, setActiveTab] = useState("overview");

	return (
		<div className="min-h-screen bg-gray-50 flex">
			{/* Sidebar */}
			<div className="w-64 bg-white shadow-sm min-h-screen p-6">
				<h1 className="text-xl font-bold text-blue-600 mb-8">HighwayLink</h1>
				<nav className="space-y-2">
					{[
						{ id: "overview", label: "📊 Overview" },
						{ id: "buses", label: "🚌 Buses" },
						{ id: "routes", label: "🗺️ Routes" },
						{ id: "schedules", label: "📅 Schedules" },
						{ id: "users", label: "👥 Users" },
					].map((item) => (
						<button
							key={item.id}
							onClick={() => setActiveTab(item.id)}
							className={`w-full text-left px-4 py-2 rounded-lg transition text-sm font-medium ${
								activeTab === item.id
									? "bg-blue-600 text-white"
									: "text-gray-600 hover:bg-gray-100"
							}`}
						>
							{item.label}
						</button>
					))}
				</nav>
				<div className="mt-8 pt-8 border-t">
					<Link href="/" className="text-red-500 text-sm hover:underline">
						Logout
					</Link>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 p-8">
				{activeTab === "overview" && <Overview />}
				{activeTab === "buses" && <BusesTab />}
				{activeTab === "routes" && <RoutesTab />}
				{activeTab === "schedules" && <SchedulesTab />}
				{activeTab === "users" && <UsersTab />}
			</div>
		</div>
	);
}

function Overview() {
	return (
		<div>
			<h2 className="text-2xl font-bold text-gray-800 mb-6">
				Dashboard Overview
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				{[
					{ label: "Total Buses", value: "0", icon: "🚌" },
					{ label: "Total Routes", value: "0", icon: "🗺️" },
					{ label: "Total Bookings", value: "0", icon: "🎫" },
					{ label: "Total Users", value: "0", icon: "👥" },
				].map((card) => (
					<div key={card.label} className="bg-white rounded-xl shadow-sm p-6">
						<div className="text-3xl mb-2">{card.icon}</div>
						<p className="text-2xl font-bold text-gray-800">{card.value}</p>
						<p className="text-gray-500 text-sm">{card.label}</p>
					</div>
				))}
			</div>
		</div>
	);
}

function BusesTab() {
	const [form, setForm] = useState({
		licensePlate: "",
		busType: "AC",
		totalSeats: "",
	});
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");
		try {
			const res = await fetch("/api/admin/buses", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			const data = await res.json();
			if (!res.ok) {
				setMessage(data.error || "Failed to add bus");
			} else {
				setMessage("Bus added successfully!");
				setForm({ licensePlate: "", busType: "AC", totalSeats: "" });
			}
		} catch {
			setMessage("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Buses</h2>
			<div className="bg-white rounded-xl shadow-sm p-6 max-w-lg">
				<h3 className="text-lg font-semibold text-gray-700 mb-4">
					Add New Bus
				</h3>
				{message && (
					<div
						className={`p-3 rounded-lg mb-4 text-sm ${
							message.includes("success")
								? "bg-green-50 text-green-600"
								: "bg-red-50 text-red-600"
						}`}
					>
						{message}
					</div>
				)}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							License Plate
						</label>
						<input
							type="text"
							value={form.licensePlate}
							onChange={(e) =>
								setForm({ ...form, licensePlate: e.target.value })
							}
							required
							placeholder="e.g. NB-1234"
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Bus Type
						</label>
						<select
							value={form.busType}
							onChange={(e) => setForm({ ...form, busType: e.target.value })}
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="AC">AC</option>
							<option value="non_AC">Non AC</option>
							<option value="luxury">Luxury</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Total Seats
						</label>
						<input
							type="number"
							value={form.totalSeats}
							onChange={(e) => setForm({ ...form, totalSeats: e.target.value })}
							required
							placeholder="e.g. 45"
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
					>
						{loading ? "Adding..." : "Add Bus"}
					</button>
				</form>
			</div>
		</div>
	);
}

function RoutesTab() {
	const [form, setForm] = useState({
		origin: "",
		destination: "",
		distance: "",
		duration: "",
	});
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");
		try {
			const res = await fetch("/api/admin/routes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			const data = await res.json();
			if (!res.ok) {
				setMessage(data.error || "Failed to add route");
			} else {
				setMessage("Route added successfully!");
				setForm({ origin: "", destination: "", distance: "", duration: "" });
			}
		} catch {
			setMessage("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Routes</h2>
			<div className="bg-white rounded-xl shadow-sm p-6 max-w-lg">
				<h3 className="text-lg font-semibold text-gray-700 mb-4">
					Add New Route
				</h3>
				{message && (
					<div
						className={`p-3 rounded-lg mb-4 text-sm ${
							message.includes("success")
								? "bg-green-50 text-green-600"
								: "bg-red-50 text-red-600"
						}`}
					>
						{message}
					</div>
				)}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Origin
						</label>
						<input
							type="text"
							value={form.origin}
							onChange={(e) => setForm({ ...form, origin: e.target.value })}
							required
							placeholder="e.g. Colombo"
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Destination
						</label>
						<input
							type="text"
							value={form.destination}
							onChange={(e) =>
								setForm({ ...form, destination: e.target.value })
							}
							required
							placeholder="e.g. Matara"
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Distance
						</label>
						<input
							type="text"
							value={form.distance}
							onChange={(e) => setForm({ ...form, distance: e.target.value })}
							placeholder="e.g. 160 km"
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Duration
						</label>
						<input
							type="text"
							value={form.duration}
							onChange={(e) => setForm({ ...form, duration: e.target.value })}
							placeholder="e.g. 2.5 hours"
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
					>
						{loading ? "Adding..." : "Add Route"}
					</button>
				</form>
			</div>
		</div>
	);
}

function SchedulesTab() {
	const [form, setForm] = useState({
		busId: "",
		routeId: "",
		departureTime: "",
		arrivalTime: "",
		fare: "",
	});
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");
		try {
			const res = await fetch("/api/admin/schedules", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			const data = await res.json();
			if (!res.ok) {
				setMessage(data.error || "Failed to add schedule");
			} else {
				setMessage("Schedule added successfully!");
				setForm({
					busId: "",
					routeId: "",
					departureTime: "",
					arrivalTime: "",
					fare: "",
				});
			}
		} catch {
			setMessage("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h2 className="text-2xl font-bold text-gray-800 mb-6">
				Manage Schedules
			</h2>
			<div className="bg-white rounded-xl shadow-sm p-6 max-w-lg">
				<h3 className="text-lg font-semibold text-gray-700 mb-4">
					Add New Schedule
				</h3>
				{message && (
					<div
						className={`p-3 rounded-lg mb-4 text-sm ${
							message.includes("success")
								? "bg-green-50 text-green-600"
								: "bg-red-50 text-red-600"
						}`}
					>
						{message}
					</div>
				)}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Bus ID
						</label>
						<input
							type="text"
							value={form.busId}
							onChange={(e) => setForm({ ...form, busId: e.target.value })}
							required
							placeholder="Paste Bus ID here"
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Route ID
						</label>
						<input
							type="text"
							value={form.routeId}
							onChange={(e) => setForm({ ...form, routeId: e.target.value })}
							required
							placeholder="Paste Route ID here"
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Departure Time
						</label>
						<input
							type="datetime-local"
							value={form.departureTime}
							onChange={(e) =>
								setForm({ ...form, departureTime: e.target.value })
							}
							required
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Arrival Time
						</label>
						<input
							type="datetime-local"
							value={form.arrivalTime}
							onChange={(e) =>
								setForm({ ...form, arrivalTime: e.target.value })
							}
							required
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Fare (LKR)
						</label>
						<input
							type="number"
							value={form.fare}
							onChange={(e) => setForm({ ...form, fare: e.target.value })}
							required
							placeholder="e.g. 500"
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
					>
						{loading ? "Adding..." : "Add Schedule"}
					</button>
				</form>
			</div>
		</div>
	);
}

function UsersTab() {
	return (
		<div>
			<h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Users</h2>
			<div className="bg-white rounded-xl shadow-sm p-6">
				<p className="text-gray-500">User management coming soon.</p>
			</div>
		</div>
	);
}
