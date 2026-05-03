"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LostFoundItem {
	id: string;
	description: string;
	foundLocation: string;
	status: string;
	contactInfo: string;
	reportedAt: string;
	reportedBy: string;
}

export default function LostFoundPage() {
	const [items, setItems] = useState<LostFoundItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("browse");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");
	const [form, setForm] = useState({
		description: "",
		foundLocation: "",
		contactInfo: "",
		email: "",
	});
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		fetchItems();
		const storedEmail = localStorage.getItem("userEmail");
		if (storedEmail) setForm((f) => ({ ...f, email: storedEmail }));
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setMessage("");
		setSubmitting(true);

		try {
			const res = await fetch("/api/lostfound", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			const data = await res.json();
			if (!res.ok) {
				setError(data.error || "Failed to report item");
			} else {
				setMessage("Item reported successfully!");
				setForm({
					description: "",
					foundLocation: "",
					contactInfo: "",
					email: form.email,
				});
				fetchItems();
				setTimeout(() => {
					setMessage("");
					setActiveTab("browse");
				}, 2000);
			}
		} catch {
			setError("Something went wrong");
		} finally {
			setSubmitting(false);
		}
	};

	const getStatusConfig = (status: string) => {
		switch (status) {
			case "found":
				return {
					color: "bg-green-100 text-green-700 border-green-200",
					dot: "bg-green-500",
					label: "Found",
				};
			case "claimed":
				return {
					color: "bg-gray-100 text-gray-600 border-gray-200",
					dot: "bg-gray-400",
					label: "Claimed",
				};
			default:
				return {
					color: "bg-yellow-100 text-yellow-700 border-yellow-200",
					dot: "bg-yellow-500",
					label: "Reported",
				};
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
		<div className="min-h-screen bg-gray-50">
			{/* Navbar */}
			<nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50">
				<Link href="/" className="flex items-center gap-2">
					<span className="text-2xl">🚌</span>
					<span className="text-xl font-bold text-blue-600">HighwayLink</span>
				</Link>
				<div className="flex items-center gap-3">
					<Link href="/login">
						<Button variant="outline" size="sm" className="rounded-full">
							Login
						</Button>
					</Link>
					<Link href="/register">
						<Button size="sm" className="rounded-full">
							Register
						</Button>
					</Link>
				</div>
			</nav>

			{/* Hero */}
			<div className="bg-gradient-to-br from-blue-600 to-blue-500 text-white py-12 px-6 text-center">
				<div className="max-w-2xl mx-auto">
					<div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
						🔍
					</div>
					<h1 className="text-3xl font-extrabold mb-2">Lost & Found</h1>
					<p className="text-blue-100 text-lg">
						Lost something on a highway bus? Report it here or search for your
						item.
					</p>
				</div>
			</div>

			<div className="max-w-4xl mx-auto px-6 py-10">
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
							label: "Items Found",
							value: items.filter((i) => i.status === "found").length,
							icon: "✅",
							color: "bg-green-50 text-green-600",
						},
						{
							label: "Items Claimed",
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

				{/* Tabs */}
				<div className="flex gap-2 mb-6 bg-white border border-gray-100 rounded-xl p-1 w-fit">
					{[
						{ id: "browse", label: "🔍 Browse Items" },
						{ id: "report", label: "📋 Report Item" },
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
								activeTab === tab.id
									? "bg-blue-600 text-white shadow-sm"
									: "text-gray-600 hover:bg-gray-50"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>

				{/* Browse Tab */}
				{activeTab === "browse" && (
					<div>
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

						{loading && (
							<div className="text-center py-20">
								<div className="text-4xl mb-3 animate-pulse">🔍</div>
								<p className="text-gray-500">Loading items...</p>
							</div>
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
									<p className="text-gray-400 text-sm mb-6">
										No lost items have been reported yet
									</p>
									<Button
										onClick={() => setActiveTab("report")}
										className="rounded-full px-6"
									>
										Report an Item
									</Button>
								</CardContent>
							</Card>
						)}

						<div className="space-y-4">
							{filteredItems.map((item) => {
								const statusConfig = getStatusConfig(item.status);
								return (
									<Card
										key={item.id}
										className="border-0 shadow-sm hover:shadow-md transition"
									>
										<CardContent className="p-6">
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-2">
														<div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
															🎒
														</div>
														<div>
															<p className="font-bold text-gray-800">
																{item.description}
															</p>
															<span
																className={`text-xs font-semibold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${statusConfig.color}`}
															>
																<span
																	className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
																></span>
																{statusConfig.label}
															</span>
														</div>
													</div>

													<div className="ml-14 space-y-1">
														{item.foundLocation && (
															<p className="text-gray-500 text-sm flex items-center gap-2">
																<span>📍</span> {item.foundLocation}
															</p>
														)}
														<p className="text-gray-500 text-sm flex items-center gap-2">
															<span>📞</span> {item.contactInfo}
														</p>
														{item.reportedBy && (
															<p className="text-gray-500 text-sm flex items-center gap-2">
																<span>👤</span> Reported by: {item.reportedBy}
															</p>
														)}
														<p className="text-gray-400 text-xs flex items-center gap-2">
															<span>🗓</span>
															{new Date(item.reportedAt).toLocaleDateString(
																"en-US",
																{
																	year: "numeric",
																	month: "long",
																	day: "numeric",
																}
															)}
														</p>
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					</div>
				)}

				{/* Report Tab */}
				{activeTab === "report" && (
					<Card className="border-0 shadow-sm max-w-lg mx-auto">
						<CardContent className="p-8">
							<div className="flex items-center gap-3 mb-6">
								<div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
									📋
								</div>
								<div>
									<h2 className="font-extrabold text-gray-800 text-lg">
										Report a Lost Item
									</h2>
									<p className="text-gray-400 text-sm">
										Fill in the details of the lost item
									</p>
								</div>
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

							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<Label className="text-gray-700 font-medium mb-1.5 block">
										Item Description <span className="text-red-500">*</span>
									</Label>
									<Input
										value={form.description}
										onChange={(e) =>
											setForm({ ...form, description: e.target.value })
										}
										placeholder="e.g. Black leather wallet with ID cards"
										required
										className="h-11"
									/>
								</div>

								<div>
									<Label className="text-gray-700 font-medium mb-1.5 block">
										Where was it lost/found?
									</Label>
									<Input
										value={form.foundLocation}
										onChange={(e) =>
											setForm({ ...form, foundLocation: e.target.value })
										}
										placeholder="e.g. Bus NB-1234, Seat S12, Colombo terminal"
										className="h-11"
									/>
								</div>

								<div>
									<Label className="text-gray-700 font-medium mb-1.5 block">
										Your Contact Number <span className="text-red-500">*</span>
									</Label>
									<Input
										value={form.contactInfo}
										onChange={(e) =>
											setForm({ ...form, contactInfo: e.target.value })
										}
										placeholder="e.g. 071 234 5678"
										required
										className="h-11"
									/>
								</div>

								<div>
									<Label className="text-gray-700 font-medium mb-1.5 block">
										Your Email (optional)
									</Label>
									<Input
										type="email"
										value={form.email}
										onChange={(e) =>
											setForm({ ...form, email: e.target.value })
										}
										placeholder="Enter your registered email"
										className="h-11"
									/>
								</div>

								<Button
									type="submit"
									disabled={submitting}
									className="w-full h-11 rounded-xl font-semibold"
								>
									{submitting ? "Submitting..." : "📋 Submit Report"}
								</Button>
							</form>

							{/* Tips */}
							<div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
								<p className="text-blue-700 text-xs font-semibold mb-2">
									💡 Tips for a better report
								</p>
								<ul className="space-y-1 text-blue-600 text-xs">
									<li>→ Include as many details as possible about the item</li>
									<li>→ Mention the bus number or route if you remember</li>
									<li>→ Add your seat number if you know it</li>
									<li>→ Provide an active contact number</li>
								</ul>
							</div>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Footer */}
			<footer className="bg-gray-900 text-gray-400 py-8 px-6 mt-16">
				<div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
					<div className="flex items-center gap-2">
						<span className="text-xl">🚌</span>
						<span className="text-white font-bold">HighwayLink</span>
					</div>
					<p className="text-sm">© 2025 HighwayLink. All rights reserved.</p>
				</div>
			</footer>
		</div>
	);
}
