"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function AdminSidebar() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const activeTab = searchParams.get("tab") || "overview";

	const handleLogout = () => {
		localStorage.removeItem("userEmail");
		localStorage.removeItem("userName");
		router.push("/");
	};

	const navItems = [
		{
			id: "overview",
			label: "Overview",
			icon: "📊",
			path: "/dashboard/admin?tab=overview",
		},
		{
			id: "buses",
			label: "Buses",
			icon: "🚌",
			path: "/dashboard/admin?tab=buses",
		},
		{
			id: "routes",
			label: "Routes",
			icon: "🗺️",
			path: "/dashboard/admin?tab=routes",
		},
		{
			id: "schedules",
			label: "Schedules",
			icon: "📅",
			path: "/dashboard/admin?tab=schedules",
		},
		{
			id: "users",
			label: "Users",
			icon: "👥",
			path: "/dashboard/admin?tab=users",
		},
		{
			id: "reports",
			label: "Reports",
			icon: "💰",
			path: "/dashboard/admin/reports",
		},
		{
			id: "mileage",
			label: "Mileage",
			icon: "🛣️",
			path: "/dashboard/admin/mileage",
		},
		{
			id: "lostfound",
			label: "Lost & Found",
			icon: "🔍",
			path: "/dashboard/admin/lostfound",
		},
	];

	const isActive = (item: (typeof navItems)[0]) => {
		if (item.id === "reports") return pathname === "/dashboard/admin/reports";
		if (item.id === "mileage") return pathname === "/dashboard/admin/mileage";
		if (item.id === 'lostfound') return pathname === '/dashboard/admin/lostfound';
		return pathname === "/dashboard/admin" && activeTab === item.id;
	};

	return (
		<div className="w-64 bg-white border-r min-h-screen flex flex-col fixed left-0 top-0 z-40">
			{/* Logo */}
			<div className="px-6 py-5 border-b">
				<Link href="/" className="flex items-center gap-2">
					<span className="text-2xl">🚌</span>
					<span className="text-lg font-extrabold text-blue-600">
						HighwayLink
					</span>
				</Link>
				<p className="text-xs text-gray-400 mt-0.5 ml-8">Admin Dashboard</p>
			</div>

			{/* Nav */}
			<nav className="flex-1 px-4 py-4 space-y-1">
				{navItems.map((item) => (
					<Link
						key={item.id}
						href={item.path}
						className={`w-full text-left px-4 py-2.5 rounded-xl transition text-sm font-medium flex items-center gap-3 ${
							isActive(item)
								? "bg-blue-600 text-white shadow-sm"
								: "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
						}`}
					>
						<span className="text-base">{item.icon}</span>
						{item.label}
					</Link>
				))}
			</nav>

			{/* Bottom */}
			<div className="px-4 py-4 border-t">
				<button
					onClick={handleLogout}
					className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition flex items-center gap-3"
				>
					<span>🚪</span> Logout
				</button>
			</div>
		</div>
	);
}

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-gray-50 flex">
			<Suspense
				fallback={<div className="w-64 bg-white border-r min-h-screen" />}
			>
				<AdminSidebar />
			</Suspense>
			<div className="flex-1 ml-64">{children}</div>
		</div>
	);
}
