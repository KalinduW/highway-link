"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface User {
	id: string;
	fullName: string;
	email: string;
	phone: string;
	nic: string;
	role: string;
	createdAt: string;
}

function AdminDashboardContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const activeTab = searchParams.get("tab") || "overview";
	const [sidebarOpen, setSidebarOpen] = useState(true);

	const handleLogout = () => {
		localStorage.removeItem("userEmail");
		localStorage.removeItem("userName");
		router.push("/");
	};

	const navItems = [
		{ id: "overview", label: "Overview", icon: "📊" },
		{ id: "buses", label: "Buses", icon: "🚌" },
		{ id: "routes", label: "Routes", icon: "🗺️" },
		{ id: "schedules", label: "Schedules", icon: "📅" },
		{ id: "users", label: "Users", icon: "👥" },
		{ id: "reports", label: "Reports", icon: "💰" },
		{ id: "mileage", label: "Mileage", icon: "🛣️" },
		{ id: "lostfound", label: "Lost & Found", icon: "🔍" },
	];

	return (
		<div>
			{/* Top Bar */}
			<div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-30">
				<div>
					<h1 className="text-lg font-bold text-gray-800">
						{navItems.find((n) => n.id === activeTab)?.icon}{" "}
						{navItems.find((n) => n.id === activeTab)?.label}
					</h1>
					<p className="text-xs text-gray-400">HighwayLink Admin Panel</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
						A
					</div>
					<div>
						<p className="text-sm font-semibold text-gray-800">Admin</p>
						<p className="text-xs text-gray-400">System Administrator</p>
					</div>
				</div>
			</div>

			{/* Page Content */}
			<div className="p-8">
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

function Overview() {
	const [stats, setStats] = useState({
		totalBuses: 0,
		totalRoutes: 0,
		totalBookings: 0,
		totalUsers: 0,
	});

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const res = await fetch("/api/admin/reports");
				const data = await res.json();
				if (res.ok) {
					setStats({
						totalBuses: data.stats.totalBuses,
						totalRoutes: data.stats.totalRoutes,
						totalBookings: data.stats.totalBookings,
						totalUsers: data.stats.totalUsers,
					});
				}
			} catch {
				console.error("Failed to fetch stats");
			}
		};
		fetchStats();
	}, []);

	return (
		<div>
			<div className="mb-8">
				<h2 className="text-2xl font-extrabold text-gray-800 mb-1">
					Welcome back, Admin 👋
				</h2>
				<p className="text-gray-500 text-sm">
					Here's what's happening with HighwayLink today
				</p>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
				{[
					{
						label: "Total Buses",
						value: stats.totalBuses,
						icon: "🚌",
						color: "bg-blue-50 text-blue-600",
						change: "Fleet size",
					},
					{
						label: "Total Routes",
						value: stats.totalRoutes,
						icon: "🗺️",
						color: "bg-green-50 text-green-600",
						change: "Active routes",
					},
					{
						label: "Total Bookings",
						value: stats.totalBookings,
						icon: "🎫",
						color: "bg-purple-50 text-purple-600",
						change: "All time",
					},
					{
						label: "Total Users",
						value: stats.totalUsers,
						icon: "👥",
						color: "bg-orange-50 text-orange-600",
						change: "Registered",
					},
				].map((card) => (
					<Card
						key={card.label}
						className="border-0 shadow-sm hover:shadow-md transition"
					>
						<CardContent className="p-6">
							<div
								className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 ${card.color}`}
							>
								{card.icon}
							</div>
							<p className="text-3xl font-extrabold text-gray-800 mb-1">
								{card.value}
							</p>
							<p className="text-gray-600 text-sm font-medium">{card.label}</p>
							<p className="text-gray-400 text-xs mt-0.5">{card.change}</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Quick Actions */}
			<div className="mb-8">
				<h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{[
						{ label: "Add New Bus", icon: "🚌", tab: "buses" },
						{ label: "Add Route", icon: "🗺️", tab: "routes" },
						{ label: "Add Schedule", icon: "📅", tab: "schedules" },
						{ label: "View Reports", icon: "💰", tab: "reports" },
					].map((action) => (
						<button
							key={action.label}
							onClick={() => {
								const event = new CustomEvent("changeTab", {
									detail: action.tab,
								});
								window.dispatchEvent(event);
							}}
							className="bg-white border border-gray-100 rounded-2xl p-5 text-center hover:border-blue-300 hover:shadow-md transition group"
						>
							<div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
								{action.icon}
							</div>
							<p className="text-sm font-semibold text-gray-700">
								{action.label}
							</p>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

function FormCard({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<Card className="border-0 shadow-sm max-w-lg">
			<CardHeader className="pb-4">
				<CardTitle className="text-lg">{title}</CardTitle>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
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
	const [buses, setBuses] = useState<any[]>([]);

	useEffect(() => {
		fetchBuses();
	}, []);

	const fetchBuses = async () => {
		try {
			const res = await fetch("/api/admin/mileage");
			const data = await res.json();
			if (res.ok) setBuses(data.mileageData);
		} catch {
			console.error("Failed to fetch buses");
		}
	};

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
				fetchBuses();
			}
		} catch {
			setMessage("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-2xl font-extrabold text-gray-800 mb-1">
					Manage Buses
				</h2>
				<p className="text-gray-500 text-sm">Add and view your fleet</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<FormCard title="➕ Add New Bus">
					{message && (
						<div
							className={`p-3 rounded-xl mb-4 text-sm ${
								message.includes("success")
									? "bg-green-50 text-green-600 border border-green-200"
									: "bg-red-50 text-red-600 border border-red-200"
							}`}
						>
							{message}
						</div>
					)}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label className="mb-1.5 block">License Plate</Label>
							<Input
								value={form.licensePlate}
								onChange={(e) =>
									setForm({ ...form, licensePlate: e.target.value })
								}
								required
								placeholder="e.g. NB-1234"
							/>
						</div>
						<div>
							<Label className="mb-1.5 block">Bus Type</Label>
							<select
								value={form.busType}
								onChange={(e) => setForm({ ...form, busType: e.target.value })}
								className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="AC">AC</option>
								<option value="non_AC">Non AC</option>
								<option value="luxury">Luxury</option>
							</select>
						</div>
						<div>
							<Label className="mb-1.5 block">Total Seats</Label>
							<Input
								type="number"
								value={form.totalSeats}
								onChange={(e) =>
									setForm({ ...form, totalSeats: e.target.value })
								}
								required
								placeholder="e.g. 45"
							/>
						</div>
						<Button
							type="submit"
							disabled={loading}
							className="w-full rounded-xl"
						>
							{loading ? "Adding..." : "+ Add Bus"}
						</Button>
					</form>
				</FormCard>

				{/* Bus List */}
				<div>
					<h3 className="text-lg font-bold text-gray-800 mb-4">
						Your Fleet ({buses.length})
					</h3>
					<div className="space-y-3">
						{buses.map((bus) => (
							<div
								key={bus.busId}
								className="bg-white rounded-xl border border-gray-100 p-4 flex justify-between items-center shadow-sm"
							>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
										🚌
									</div>
									<div>
										<p className="font-bold text-gray-800">
											{bus.licensePlate}
										</p>
										<p className="text-xs text-gray-400">
											{bus.busType} · {bus.totalSeats} seats
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-sm font-bold text-blue-600">
										{bus.totalMileage || 0} km
									</p>
									<p className="text-xs text-gray-400">total mileage</p>
								</div>
							</div>
						))}
						{buses.length === 0 && (
							<p className="text-gray-400 text-sm text-center py-8">
								No buses added yet
							</p>
						)}
					</div>
				</div>
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
	const [routes, setRoutes] = useState<any[]>([]);

	useEffect(() => {
		fetchRoutes();
	}, []);

	const fetchRoutes = async () => {
		try {
			const res = await fetch("/api/passenger/schedules");
			const data = await res.json();
			if (res.ok) {
				const unique = Array.from(
					new Map(
						data.schedules.map((s: any) => [`${s.origin}-${s.destination}`, s])
					).values()
				);
				setRoutes(unique);
			}
		} catch {
			console.error("Failed to fetch routes");
		}
	};

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
				fetchRoutes();
			}
		} catch {
			setMessage("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-2xl font-extrabold text-gray-800 mb-1">
					Manage Routes
				</h2>
				<p className="text-gray-500 text-sm">Add and view highway routes</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<FormCard title="➕ Add New Route">
					{message && (
						<div
							className={`p-3 rounded-xl mb-4 text-sm ${
								message.includes("success")
									? "bg-green-50 text-green-600 border border-green-200"
									: "bg-red-50 text-red-600 border border-red-200"
							}`}
						>
							{message}
						</div>
					)}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label className="mb-1.5 block">Origin</Label>
							<Input
								value={form.origin}
								onChange={(e) => setForm({ ...form, origin: e.target.value })}
								required
								placeholder="e.g. Colombo"
							/>
						</div>
						<div>
							<Label className="mb-1.5 block">Destination</Label>
							<Input
								value={form.destination}
								onChange={(e) =>
									setForm({ ...form, destination: e.target.value })
								}
								required
								placeholder="e.g. Matara"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label className="mb-1.5 block">Distance</Label>
								<Input
									value={form.distance}
									onChange={(e) =>
										setForm({ ...form, distance: e.target.value })
									}
									placeholder="e.g. 160 km"
								/>
							</div>
							<div>
								<Label className="mb-1.5 block">Duration</Label>
								<Input
									value={form.duration}
									onChange={(e) =>
										setForm({ ...form, duration: e.target.value })
									}
									placeholder="e.g. 2.5 hrs"
								/>
							</div>
						</div>
						<Button
							type="submit"
							disabled={loading}
							className="w-full rounded-xl"
						>
							{loading ? "Adding..." : "+ Add Route"}
						</Button>
					</form>
				</FormCard>

				{/* Routes List */}
				<div>
					<h3 className="text-lg font-bold text-gray-800 mb-4">
						Active Routes ({routes.length})
					</h3>
					<div className="space-y-3">
						{routes.map((route: any, i) => (
							<div
								key={i}
								className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
							>
								<div className="flex items-center gap-2">
									<span className="text-lg">🗺️</span>
									<p className="font-bold text-gray-800">
										{route.origin} → {route.destination}
									</p>
								</div>
								<div className="flex gap-4 mt-2 ml-7">
									<p className="text-xs text-gray-400">💰 LKR {route.fare}</p>
									<p className="text-xs text-gray-400">🚌 {route.busType}</p>
								</div>
							</div>
						))}
						{routes.length === 0 && (
							<p className="text-gray-400 text-sm text-center py-8">
								No routes added yet
							</p>
						)}
					</div>
				</div>
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
			<div className="mb-6">
				<h2 className="text-2xl font-extrabold text-gray-800 mb-1">
					Manage Schedules
				</h2>
				<p className="text-gray-500 text-sm">
					Create trip schedules by linking buses to routes
				</p>
			</div>

			<FormCard title="➕ Add New Schedule">
				{message && (
					<div
						className={`p-3 rounded-xl mb-4 text-sm ${
							message.includes("success")
								? "bg-green-50 text-green-600 border border-green-200"
								: "bg-red-50 text-red-600 border border-red-200"
						}`}
					>
						{message}
					</div>
				)}
				<div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-700">
					💡 Get the Bus ID and Route ID from pgAdmin → your database tables
				</div>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label className="mb-1.5 block">Bus ID</Label>
						<Input
							value={form.busId}
							onChange={(e) => setForm({ ...form, busId: e.target.value })}
							required
							placeholder="Paste Bus ID from database"
						/>
					</div>
					<div>
						<Label className="mb-1.5 block">Route ID</Label>
						<Input
							value={form.routeId}
							onChange={(e) => setForm({ ...form, routeId: e.target.value })}
							required
							placeholder="Paste Route ID from database"
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label className="mb-1.5 block">Departure Time</Label>
							<Input
								type="datetime-local"
								value={form.departureTime}
								onChange={(e) =>
									setForm({ ...form, departureTime: e.target.value })
								}
								required
							/>
						</div>
						<div>
							<Label className="mb-1.5 block">Arrival Time</Label>
							<Input
								type="datetime-local"
								value={form.arrivalTime}
								onChange={(e) =>
									setForm({ ...form, arrivalTime: e.target.value })
								}
								required
							/>
						</div>
					</div>
					<div>
						<Label className="mb-1.5 block">Fare (LKR)</Label>
						<Input
							type="number"
							value={form.fare}
							onChange={(e) => setForm({ ...form, fare: e.target.value })}
							required
							placeholder="e.g. 500"
						/>
					</div>
					<Button
						type="submit"
						disabled={loading}
						className="w-full rounded-xl"
					>
						{loading ? "Adding..." : "+ Add Schedule"}
					</Button>
				</form>
			</FormCard>
		</div>
	);
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

	const getRoleBadge = (role: string) => {
		const config: Record<string, string> = {
			admin: "bg-red-100 text-red-700",
			bus_owner: "bg-purple-100 text-purple-700",
			conductor: "bg-blue-100 text-blue-700",
			driver: "bg-yellow-100 text-yellow-700",
			passenger: "bg-green-100 text-green-700",
		};
		return config[role] || "bg-gray-100 text-gray-700";
	};

	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesRole = filterRole === "all" || user.role === filterRole;
		return matchesSearch && matchesRole;
	});

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-2xl font-extrabold text-gray-800 mb-1">
					Manage Users
				</h2>
				<p className="text-gray-500 text-sm">
					View and manage all registered users
				</p>
			</div>

			{message && (
				<div
					className={`p-3 rounded-xl mb-4 text-sm ${
						message.includes("success")
							? "bg-green-50 text-green-600 border border-green-200"
							: "bg-red-50 text-red-600 border border-red-200"
					}`}
				>
					{message}
				</div>
			)}

			{/* Role Stats */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
				{["passenger", "conductor", "driver", "bus_owner", "admin"].map(
					(role) => (
						<div
							key={role}
							className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm"
						>
							<p className="text-xl font-extrabold text-gray-800">
								{users.filter((u) => u.role === role).length}
							</p>
							<p className="text-xs text-gray-500 capitalize mt-0.5">
								{role.replace("_", " ")}
							</p>
						</div>
					)
				)}
			</div>

			{/* Search & Filter */}
			<div className="flex gap-4 mb-6">
				<Input
					placeholder="Search by name or email..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="flex-1"
				/>
				<select
					value={filterRole}
					onChange={(e) => setFilterRole(e.target.value)}
					className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="all">All Roles</option>
					<option value="passenger">Passenger</option>
					<option value="conductor">Conductor</option>
					<option value="driver">Driver</option>
					<option value="bus_owner">Bus Owner</option>
					<option value="admin">Admin</option>
				</select>
			</div>

			{/* Users Table */}
			<Card className="border-0 shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="bg-gray-50 border-b">
							<tr>
								<th className="text-left px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">
									User
								</th>
								<th className="text-left px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">
									Phone
								</th>
								<th className="text-left px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">
									Role
								</th>
								<th className="text-left px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">
									Joined
								</th>
								<th className="text-left px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{loading && (
								<tr>
									<td colSpan={5} className="text-center py-10 text-gray-400">
										Loading users...
									</td>
								</tr>
							)}
							{!loading && filteredUsers.length === 0 && (
								<tr>
									<td colSpan={5} className="text-center py-10 text-gray-400">
										No users found
									</td>
								</tr>
							)}
							{filteredUsers.map((user) => (
								<tr key={user.id} className="hover:bg-gray-50 transition">
									<td className="px-6 py-4">
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
												{user.fullName
													.split(" ")
													.map((n) => n[0])
													.join("")
													.slice(0, 2)
													.toUpperCase()}
											</div>
											<div>
												<p className="font-semibold text-gray-800">
													{user.fullName}
												</p>
												<p className="text-gray-400 text-xs">{user.email}</p>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 text-gray-600">{user.phone}</td>
									<td className="px-6 py-4">
										<span
											className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getRoleBadge(
												user.role
											)}`}
										>
											{user.role.replace("_", " ").toUpperCase()}
										</span>
									</td>
									<td className="px-6 py-4 text-gray-400 text-xs">
										{new Date(user.createdAt).toLocaleDateString("en-US", {
											year: "numeric",
											month: "short",
											day: "numeric",
										})}
									</td>
									<td className="px-6 py-4">
										<div className="flex gap-2">
											<select
												value={user.role}
												onChange={(e) =>
													handleRoleChange(user.id, e.target.value)
												}
												className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
											>
												<option value="passenger">Passenger</option>
												<option value="conductor">Conductor</option>
												<option value="driver">Driver</option>
												<option value="bus_owner">Bus Owner</option>
												<option value="admin">Admin</option>
											</select>
											<button
												onClick={() => handleDeactivate(user.id)}
												className="text-xs bg-red-50 text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition font-medium"
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
			</Card>
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

function MileageRedirect() {
	const router = useRouter();
	useEffect(() => {
		router.push("/dashboard/admin/mileage");
	}, []);
	return <p className="text-gray-500">Loading mileage...</p>;
}

function LostFoundRedirect() {
	const router = useRouter();
	useEffect(() => {
		router.push("/dashboard/admin/lostfound");
	}, []);
	return <p className="text-gray-500">Loading Lost & Found...</p>;
}

export default function AdminDashboard() {
	return (
		<Suspense fallback={<div className="p-8 text-gray-500">Loading...</div>}>
			<AdminDashboardContent />
		</Suspense>
	);
}
