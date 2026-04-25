"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

interface User {
	id: string;
	fullName: string;
	email: string;
	phone: string;
	nic: string;
	role: string;
	createdAt: string;
}

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
						{ id: "reports", label: "💰 Reports" },
						{ id: "mileage", label: "🗺️ Mileage" },
						{ id: "lostfound", label: "🔍 Lost & Found" },
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
				{activeTab === "reports" && <ReportsRedirect />}
				{activeTab === "mileage" && <MileageRedirect />}
				{activeTab === "lostfound" && <LostFoundRedirect />}
			</div>
		</div>
	);
}

function ReportsRedirect() {
	const router = useRouter();
	useEffect(() => {
		router.push("/dashboard/admin/reports");
	}, []);
	return <p className="text-gray-500">Loading reports...</p>;
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

function LostFoundRedirect() {
	const router = useRouter();
	useEffect(() => {
		router.push("/lostfound");
	}, []);
	return <p className="text-gray-500">Loading Lost & Found...</p>;
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

function MileageRedirect() {
	const router = useRouter();
	useEffect(() => {
		router.push("/dashboard/admin/mileage");
	}, []);
	return <p className="text-gray-500">Loading mileage...</p>;
}

function UsersTab() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [filterRole, setFilterRole] = useState("all");

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			const res = await fetch("/api/admin/users");
			const data = await res.json();
			if (res.ok) setUsers(data.users);
		} catch {
			console.error("Failed to fetch users");
		} finally {
			setLoading(false);
		}
	};

	const handleRoleChange = async (userId: string, newRole: string) => {
		try {
			const res = await fetch("/api/admin/users", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId, role: newRole }),
			});
			if (res.ok) {
				setMessage("Role updated successfully!");
				fetchUsers();
				setTimeout(() => setMessage(""), 3000);
			}
		} catch {
			setMessage("Failed to update role");
		}
	};

	const handleDeactivate = async (userId: string) => {
		if (!confirm("Are you sure you want to deactivate this user?")) return;
		try {
			const res = await fetch(`/api/admin/users?userId=${userId}`, {
				method: "DELETE",
			});
			if (res.ok) {
				setMessage("User deactivated successfully!");
				fetchUsers();
				setTimeout(() => setMessage(""), 3000);
			}
		} catch {
			setMessage("Failed to deactivate user");
		}
	};

	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesRole = filterRole === "all" || user.role === filterRole;
		return matchesSearch && matchesRole;
	});

	const getRoleBadgeColor = (role: string) => {
		switch (role) {
			case "admin":
				return "bg-red-100 text-red-700";
			case "bus_owner":
				return "bg-purple-100 text-purple-700";
			case "conductor":
				return "bg-blue-100 text-blue-700";
			case "driver":
				return "bg-yellow-100 text-yellow-700";
			default:
				return "bg-green-100 text-green-700";
		}
	};

	return (
		<div>
			<h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Users</h2>

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

			{/* Search & Filter */}
			<div className="flex gap-4 mb-6">
				<input
					type="text"
					placeholder="Search by name or email..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<select
					value={filterRole}
					onChange={(e) => setFilterRole(e.target.value)}
					className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="all">All Roles</option>
					<option value="passenger">Passenger</option>
					<option value="conductor">Conductor</option>
					<option value="driver">Driver</option>
					<option value="bus_owner">Bus Owner</option>
					<option value="admin">Admin</option>
				</select>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
				{["passenger", "conductor", "driver", "bus_owner", "admin"].map(
					(role) => (
						<div
							key={role}
							className="bg-white rounded-lg border p-3 text-center"
						>
							<p className="text-xl font-bold text-gray-800">
								{users.filter((u) => u.role === role).length}
							</p>
							<p className="text-xs text-gray-500 capitalize">
								{role.replace("_", " ")}
							</p>
						</div>
					)
				)}
			</div>

			{loading && (
				<p className="text-center text-gray-500 py-10">Loading users...</p>
			)}

			{/* Users Table */}
			{!loading && (
				<div className="bg-white rounded-xl shadow-sm overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-gray-50 border-b">
								<tr>
									<th className="text-left px-4 py-3 text-gray-600 font-semibold">
										Name
									</th>
									<th className="text-left px-4 py-3 text-gray-600 font-semibold">
										Email
									</th>
									<th className="text-left px-4 py-3 text-gray-600 font-semibold">
										Phone
									</th>
									<th className="text-left px-4 py-3 text-gray-600 font-semibold">
										Role
									</th>
									<th className="text-left px-4 py-3 text-gray-600 font-semibold">
										Joined
									</th>
									<th className="text-left px-4 py-3 text-gray-600 font-semibold">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{filteredUsers.length === 0 && (
									<tr>
										<td colSpan={6} className="text-center py-10 text-gray-500">
											No users found
										</td>
									</tr>
								)}
								{filteredUsers.map((user) => (
									<tr key={user.id} className="hover:bg-gray-50 transition">
										<td className="px-4 py-3 font-medium text-gray-800">
											{user.fullName}
										</td>
										<td className="px-4 py-3 text-gray-600">{user.email}</td>
										<td className="px-4 py-3 text-gray-600">{user.phone}</td>
										<td className="px-4 py-3">
											<span
												className={`text-xs font-semibold px-2 py-1 rounded-full ${getRoleBadgeColor(
													user.role
												)}`}
											>
												{user.role.replace("_", " ").toUpperCase()}
											</span>
										</td>
										<td className="px-4 py-3 text-gray-500">
											{new Date(user.createdAt).toLocaleDateString("en-US", {
												year: "numeric",
												month: "short",
												day: "numeric",
											})}
										</td>
										<td className="px-4 py-3">
											<div className="flex gap-2">
												<select
													value={user.role}
													onChange={(e) =>
														handleRoleChange(user.id, e.target.value)
													}
													className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
												>
													<option value="passenger">Passenger</option>
													<option value="conductor">Conductor</option>
													<option value="driver">Driver</option>
													<option value="bus_owner">Bus Owner</option>
													<option value="admin">Admin</option>
												</select>
												<button
													onClick={() => handleDeactivate(user.id)}
													className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 transition"
												>
													Deactivate
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
