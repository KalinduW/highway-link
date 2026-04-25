"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
	const [form, setForm] = useState({
		description: "",
		foundLocation: "",
		contactInfo: "",
		email: "",
	});

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
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "found":
				return "bg-green-100 text-green-700";
			case "claimed":
				return "bg-gray-100 text-gray-700";
			default:
				return "bg-yellow-100 text-yellow-700";
		}
	};

	const filteredItems = items.filter(
		(item) =>
			item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(item.foundLocation &&
				item.foundLocation.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Navbar */}
			<nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
				<Link href="/" className="text-2xl font-bold text-blue-600">
					HighwayLink
				</Link>
				<div className="flex gap-4">
					<Link href="/login">
						<Button variant="outline" size="sm">
							Login
						</Button>
					</Link>
					<Link href="/register">
						<Button size="sm">Register</Button>
					</Link>
				</div>
			</nav>

			<div className="max-w-4xl mx-auto px-6 py-10">
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-gray-800">Lost & Found</h1>
					<p className="text-gray-500 text-sm">
						Report or search for lost items on highway buses
					</p>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-3 gap-4 mb-8">
					{[
						{ label: "Total Reports", value: items.length, icon: "📋" },
						{
							label: "Found",
							value: items.filter((i) => i.status === "found").length,
							icon: "✅",
						},
						{
							label: "Claimed",
							value: items.filter((i) => i.status === "claimed").length,
							icon: "🎉",
						},
					].map((card) => (
						<Card key={card.label}>
							<CardContent className="pt-6">
								<div className="text-2xl mb-1">{card.icon}</div>
								<p className="text-xl font-bold text-gray-800">{card.value}</p>
								<p className="text-gray-500 text-xs">{card.label}</p>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Tabs */}
				<div className="flex gap-4 mb-6">
					{[
						{ id: "browse", label: "🔍 Browse Items" },
						{ id: "report", label: "📋 Report Item" },
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
								activeTab === tab.id
									? "bg-blue-600 text-white"
									: "bg-white text-gray-600 hover:bg-gray-100"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>

				{/* Browse Tab */}
				{activeTab === "browse" && (
					<div>
						<Input
							placeholder="Search by description or location..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="mb-6"
						/>

						{loading && (
							<p className="text-center text-gray-500 py-10">
								Loading items...
							</p>
						)}

						{!loading && filteredItems.length === 0 && (
							<Card>
								<CardContent className="py-10 text-center">
									<p className="text-4xl mb-3">🔍</p>
									<p className="text-gray-600 font-medium">No items found</p>
									<p className="text-gray-400 text-sm mb-4">
										No lost items reported yet
									</p>
									<Button onClick={() => setActiveTab("report")}>
										Report an Item
									</Button>
								</CardContent>
							</Card>
						)}

						<div className="space-y-4">
							{filteredItems.map((item) => (
								<Card key={item.id}>
									<CardContent className="pt-6">
										<div className="flex justify-between items-start mb-3">
											<div className="flex-1">
												<p className="font-semibold text-gray-800 mb-1">
													{item.description}
												</p>
												{item.foundLocation && (
													<p className="text-gray-500 text-sm mb-1">
														📍 Found at: {item.foundLocation}
													</p>
												)}
												<p className="text-gray-500 text-sm mb-1">
													📞 Contact: {item.contactInfo}
												</p>
												{item.reportedBy && (
													<p className="text-gray-500 text-sm">
														👤 Reported by: {item.reportedBy}
													</p>
												)}
											</div>
											<div className="text-right ml-4">
												<span
													className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(
														item.status
													)}`}
												>
													{item.status.toUpperCase()}
												</span>
												<p className="text-gray-400 text-xs mt-2">
													{new Date(item.reportedAt).toLocaleDateString(
														"en-US",
														{
															year: "numeric",
															month: "short",
															day: "numeric",
														}
													)}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				)}

				{/* Report Tab */}
				{activeTab === "report" && (
					<Card>
						<CardHeader>
							<CardTitle>Report a Lost Item</CardTitle>
						</CardHeader>
						<CardContent>
							{message && (
								<div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
									{message}
								</div>
							)}
							{error && (
								<div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
									{error}
								</div>
							)}
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<Label htmlFor="description">Item Description</Label>
									<Input
										id="description"
										value={form.description}
										onChange={(e) =>
											setForm({ ...form, description: e.target.value })
										}
										placeholder="e.g. Black leather wallet with ID cards"
										required
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="foundLocation">
										Where was it found/lost?
									</Label>
									<Input
										id="foundLocation"
										value={form.foundLocation}
										onChange={(e) =>
											setForm({ ...form, foundLocation: e.target.value })
										}
										placeholder="e.g. Bus NB-1234, Seat S12, Colombo terminal"
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="contactInfo">Your Contact Number</Label>
									<Input
										id="contactInfo"
										value={form.contactInfo}
										onChange={(e) =>
											setForm({ ...form, contactInfo: e.target.value })
										}
										placeholder="e.g. 071 234 5678"
										required
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="email">Your Email (optional)</Label>
									<Input
										id="email"
										type="email"
										value={form.email}
										onChange={(e) =>
											setForm({ ...form, email: e.target.value })
										}
										placeholder="Enter your registered email"
										className="mt-1"
									/>
								</div>
								<Button type="submit" className="w-full">
									Submit Report
								</Button>
							</form>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
