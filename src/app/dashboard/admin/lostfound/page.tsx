"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface LostFoundItem {
	id: string;
	description: string;
	foundLocation: string;
	status: string;
	contactInfo: string;
	reportedAt: string;
	reportedBy: string;
}

export default function AdminLostFoundPage() {
	const [items, setItems] = useState<LostFoundItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");
	const [message, setMessage] = useState("");

	useEffect(() => {
		fetchItems();
	}, []);

	const fetchItems = async () => {
		try {
			const res = await fetch("/api/lostfound");
			const data = await res.json();
			if (res.ok) setItems(data.items);
		} catch {
			console.error("Failed to fetch items");
		} finally {
			setLoading(false);
		}
	};

	const handleStatusUpdate = async (itemId: string, status: string) => {
		try {
			const res = await fetch("/api/lostfound", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ itemId, status }),
			});
			if (res.ok) {
				setMessage("Status updated successfully!");
				fetchItems();
				setTimeout(() => setMessage(""), 3000);
			}
		} catch {
			setMessage("Failed to update status");
		}
	};

	const handleDelete = async (itemId: string) => {
		if (!confirm("Are you sure you want to delete this item?")) return;
		try {
			const res = await fetch(`/api/lostfound?itemId=${itemId}`, {
				method: "DELETE",
			});
			if (res.ok) {
				setMessage("Item deleted successfully!");
				fetchItems();
				setTimeout(() => setMessage(""), 3000);
			}
		} catch {
			setMessage("Failed to delete item");
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "found":
				return "bg-green-100 text-green-700 border-green-200";
			case "claimed":
				return "bg-gray-100 text-gray-700 border-gray-200";
			default:
				return "bg-yellow-100 text-yellow-700 border-yellow-200";
		}
	};

	const filteredItems = items.filter((item) => {
		const matchesSearch =
			item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(item.foundLocation &&
				item.foundLocation.toLowerCase().includes(searchTerm.toLowerCase()));
		const matchesStatus =
			filterStatus === "all" || item.status === filterStatus;
		return matchesSearch && matchesStatus;
	});

	return (
		<div>
			{/* Top Bar */}
			<div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-30">
				<div>
					<h1 className="text-lg font-bold text-gray-800">🔍 Lost & Found</h1>
					<p className="text-xs text-gray-400">HighwayLink Admin Panel</p>
				</div>
				<Button variant="outline" size="sm" onClick={() => window.print()}>
					🖨️ Print Report
				</Button>
			</div>

			<div className="p-8">
				{/* Stats */}
				<div className="grid grid-cols-3 gap-4 mb-8">
					{[
						{
							label: "Total Reports",
							value: items.length,
							icon: "📋",
							color: "bg-blue-50 text-blue-600",
						},
						{
							label: "Found",
							value: items.filter((i) => i.status === "found").length,
							icon: "✅",
							color: "bg-green-50 text-green-600",
						},
						{
							label: "Claimed",
							value: items.filter((i) => i.status === "claimed").length,
							icon: "🎉",
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
					<div
						className={`p-3 rounded-xl mb-6 text-sm border ${
							message.includes("deleted") || message.includes("success")
								? "bg-green-50 border-green-200 text-green-600"
								: "bg-red-50 border-red-200 text-red-600"
						}`}
					>
						{message}
					</div>
				)}

				{/* Info Note */}
				<div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700 flex items-center gap-2">
					<span>ℹ️</span>
					<p>
						Items are reported by passengers, drivers and conductors. You can
						update their status or delete them.
					</p>
				</div>

				{/* Search & Filter */}
				<div className="flex gap-4 mb-6">
					<Input
						placeholder="Search by description or location..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="flex-1"
					/>
					<select
						value={filterStatus}
						onChange={(e) => setFilterStatus(e.target.value)}
						className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="all">All Status</option>
						<option value="reported">Reported</option>
						<option value="found">Found</option>
						<option value="claimed">Claimed</option>
					</select>
				</div>

				{/* Items */}
				{loading && (
					<p className="text-center text-gray-500 py-10">Loading items...</p>
				)}

				{!loading && filteredItems.length === 0 && (
					<Card className="border-0 shadow-sm">
						<CardContent className="py-16 text-center">
							<div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
								🔍
							</div>
							<h3 className="text-lg font-bold text-gray-800 mb-2">
								No items found
							</h3>
							<p className="text-gray-400 text-sm">
								No lost items have been reported yet
							</p>
						</CardContent>
					</Card>
				)}

				<div className="space-y-4">
					{filteredItems.map((item) => (
						<Card
							key={item.id}
							className="border-0 shadow-sm hover:shadow-md transition"
						>
							<CardContent className="p-6">
								<div className="flex justify-between items-start">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<p className="font-bold text-gray-800">
												{item.description}
											</p>
											<span
												className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusColor(
													item.status
												)}`}
											>
												{item.status.toUpperCase()}
											</span>
										</div>
										{item.foundLocation && (
											<p className="text-gray-500 text-sm mb-1">
												📍 {item.foundLocation}
											</p>
										)}
										<p className="text-gray-500 text-sm mb-1">
											📞 {item.contactInfo}
										</p>
										{item.reportedBy && (
											<p className="text-gray-500 text-sm mb-1">
												👤 Reported by: {item.reportedBy}
											</p>
										)}
										<p className="text-gray-400 text-xs mt-2">
											{new Date(item.reportedAt).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</p>
									</div>

									{/* Actions */}
									<div className="flex flex-col gap-2 ml-4">
										{item.status === "reported" && (
											<button
												onClick={() => handleStatusUpdate(item.id, "found")}
												className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 transition font-medium border border-green-200"
											>
												✅ Mark Found
											</button>
										)}
										{item.status === "found" && (
											<button
												onClick={() => handleStatusUpdate(item.id, "claimed")}
												className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition font-medium border border-purple-200"
											>
												🎉 Mark Claimed
											</button>
										)}
										{item.status === "claimed" && (
											<span className="text-xs text-gray-400 font-medium">
												Resolved ✓
											</span>
										)}
										<button
											onClick={() => handleDelete(item.id)}
											className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-100 transition font-medium border border-red-200"
										>
											🗑️ Delete
										</button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
