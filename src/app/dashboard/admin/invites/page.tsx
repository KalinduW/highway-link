"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Invite {
	id: string;
	token: string;
	role: string;
	station: string | null;
	isUsed: number;
	expiresAt: string;
	createdAt: string;
	createdByName: string;
}

export default function AdminInvitesPage() {
	const [invites, setInvites] = useState<Invite[]>([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [generatedLink, setGeneratedLink] = useState("");
	const [copied, setCopied] = useState(false);
	const [form, setForm] = useState({
		role: "conductor",
		station: "",
	});
	const [generating, setGenerating] = useState(false);

	useEffect(() => {
		fetchInvites();
	}, []);

	const fetchInvites = async () => {
		try {
			const res = await fetch("/api/admin/invites");
			const data = await res.json();
			if (res.ok) setInvites(data.invites);
		} catch {
			console.error("Failed to fetch invites");
		} finally {
			setLoading(false);
		}
	};

	const handleGenerate = async () => {
		if (form.role === "timekeeper" && !form.station) {
			setError("Station is required for timekeepers");
			return;
		}

		setGenerating(true);
		setError("");
		setMessage("");
		setGeneratedLink("");

		try {
			const adminEmail = localStorage.getItem("userEmail");
			const res = await fetch("/api/admin/invites", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					role: form.role,
					station: form.station || null,
					adminEmail,
				}),
			});
			const data = await res.json();
			if (!res.ok) {
				setError(data.error || "Failed to generate invite");
			} else {
				setGeneratedLink(data.link);
				setMessage("Invite link generated successfully!");
				fetchInvites();
			}
		} catch {
			setError("Something went wrong");
		} finally {
			setGenerating(false);
		}
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(generatedLink);
		setCopied(true);
		setTimeout(() => setCopied(false), 3000);
	};

	const handleDelete = async (inviteId: string) => {
		if (!confirm("Are you sure you want to delete this invite?")) return;
		try {
			const res = await fetch(`/api/admin/invites?inviteId=${inviteId}`, {
				method: "DELETE",
			});
			if (res.ok) {
				setMessage("Invite deleted successfully!");
				fetchInvites();
				setTimeout(() => setMessage(""), 3000);
			}
		} catch {
			setError("Failed to delete invite");
		}
	};

	const getRoleConfig = (role: string) => {
		switch (role) {
			case "conductor":
				return { icon: "🎫", color: "bg-blue-100 text-blue-700" };
			case "driver":
				return { icon: "🚗", color: "bg-green-100 text-green-700" };
			case "timekeeper":
				return { icon: "⏱️", color: "bg-orange-100 text-orange-700" };
			case "bus_owner":
				return { icon: "🚌", color: "bg-purple-100 text-purple-700" };
			default:
				return { icon: "👤", color: "bg-gray-100 text-gray-700" };
		}
	};

	const activeInvites = invites.filter(
		(i) => i.isUsed === 0 && new Date(i.expiresAt) > new Date()
	);
	const usedInvites = invites.filter((i) => i.isUsed === 1);
	const expiredInvites = invites.filter(
		(i) => i.isUsed === 0 && new Date(i.expiresAt) <= new Date()
	);

	return (
		<div>
			{/* Top Bar */}
			<div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-30">
				<div>
					<h1 className="text-lg font-bold text-gray-800">
						🔗 Invite Management
					</h1>
					<p className="text-xs text-gray-400">HighwayLink Admin Panel</p>
				</div>
			</div>

			<div className="p-8">
				{/* Stats */}
				<div className="grid grid-cols-3 gap-4 mb-8">
					{[
						{
							label: "Active Invites",
							value: activeInvites.length,
							icon: "✅",
							color: "bg-green-50 text-green-600",
						},
						{
							label: "Used Invites",
							value: usedInvites.length,
							icon: "🎉",
							color: "bg-blue-50 text-blue-600",
						},
						{
							label: "Expired Invites",
							value: expiredInvites.length,
							icon: "❌",
							color: "bg-red-50 text-red-600",
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

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Generate Invite */}
					<Card className="border-0 shadow-sm">
						<CardHeader>
							<CardTitle className="text-lg">➕ Generate Invite Link</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">
									Role
								</label>
								<select
									value={form.role}
									onChange={(e) =>
										setForm({ ...form, role: e.target.value, station: "" })
									}
									className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="conductor">🎫 Conductor</option>
									<option value="driver">🚗 Driver</option>
									<option value="timekeeper">⏱️ Timekeeper</option>
									<option value="bus_owner">🚌 Bus Owner</option>
								</select>
							</div>

							{form.role === "timekeeper" && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1.5">
										Station <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={form.station}
										onChange={(e) =>
											setForm({ ...form, station: e.target.value })
										}
										placeholder="e.g. Colombo"
										className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>
							)}

							<div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-600">
								ℹ️ The invite link will expire after <strong>7 days</strong> or
								after it is used once.
							</div>

							<Button
								onClick={handleGenerate}
								disabled={generating}
								className="w-full rounded-xl"
							>
								{generating ? "Generating..." : "🔗 Generate Invite Link"}
							</Button>

							{/* Generated Link */}
							{generatedLink && (
								<div className="bg-green-50 border border-green-200 rounded-xl p-4">
									<p className="text-green-700 text-xs font-semibold mb-2">
										✅ Invite link generated! Share this with the person:
									</p>
									<div className="bg-white border border-green-200 rounded-lg p-3 mb-3">
										<p className="font-mono text-xs text-gray-600 break-all">
											{generatedLink}
										</p>
									</div>
									<Button
										onClick={handleCopy}
										variant="outline"
										size="sm"
										className="w-full rounded-full border-green-300 text-green-700 hover:bg-green-100"
									>
										{copied ? "✅ Copied!" : "📋 Copy Link"}
									</Button>
								</div>
							)}
						</CardContent>
					</Card>

					{/* How It Works */}
					<Card className="border-0 shadow-sm">
						<CardHeader>
							<CardTitle className="text-lg">📋 How It Works</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{[
								{
									step: "01",
									icon: "🎭",
									title: "Select Role",
									desc: "Choose the role you want to invite someone for (conductor, driver, timekeeper, bus owner).",
								},
								{
									step: "02",
									icon: "🔗",
									title: "Generate Link",
									desc: "Click Generate to create a unique invite link that expires in 7 days.",
								},
								{
									step: "03",
									icon: "📤",
									title: "Share Link",
									desc: "Copy the link and send it to the person via WhatsApp, email, or SMS.",
								},
								{
									step: "04",
									icon: "✅",
									title: "They Register",
									desc: "The person opens the link and registers. Their role is automatically assigned.",
								},
							].map((item) => (
								<div key={item.step} className="flex gap-4">
									<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
										{item.step}
									</div>
									<div>
										<p className="font-semibold text-gray-800 text-sm">
											{item.icon} {item.title}
										</p>
										<p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				</div>

				{/* Invites List */}
				<Card className="border-0 shadow-sm mt-8">
					<CardHeader>
						<CardTitle className="text-lg">All Invite Links</CardTitle>
					</CardHeader>
					<CardContent>
						{loading && (
							<p className="text-center text-gray-400 py-8">
								Loading invites...
							</p>
						)}
						{!loading && invites.length === 0 && (
							<p className="text-center text-gray-400 py-8">
								No invite links generated yet
							</p>
						)}
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="bg-gray-50 border-b">
									<tr>
										<th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">
											Role
										</th>
										<th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">
											Station
										</th>
										<th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">
											Status
										</th>
										<th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">
											Expires
										</th>
										<th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">
											Created
										</th>
										<th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-50">
									{invites.map((invite) => {
										const roleConfig = getRoleConfig(invite.role);
										const isExpired = new Date(invite.expiresAt) <= new Date();
										const inviteLink = `${window.location.origin}/register/invite/${invite.token}`;
										return (
											<tr
												key={invite.id}
												className="hover:bg-gray-50 transition"
											>
												<td className="px-4 py-3">
													<span
														className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleConfig.color}`}
													>
														{roleConfig.icon}{" "}
														{invite.role.replace("_", " ").toUpperCase()}
													</span>
												</td>
												<td className="px-4 py-3 text-gray-600">
													{invite.station || "—"}
												</td>
												<td className="px-4 py-3">
													{invite.isUsed === 1 ? (
														<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
															✅ Used
														</span>
													) : isExpired ? (
														<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
															❌ Expired
														</span>
													) : (
														<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
															🟢 Active
														</span>
													)}
												</td>
												<td className="px-4 py-3 text-gray-500 text-xs">
													{new Date(invite.expiresAt).toLocaleDateString(
														"en-US",
														{
															month: "short",
															day: "numeric",
															year: "numeric",
														}
													)}
												</td>
												<td className="px-4 py-3 text-gray-500 text-xs">
													{new Date(invite.createdAt).toLocaleDateString(
														"en-US",
														{
															month: "short",
															day: "numeric",
														}
													)}
												</td>
												<td className="px-4 py-3">
													<div className="flex gap-2">
														{invite.isUsed === 0 && !isExpired && (
															<button
																onClick={() => {
																	navigator.clipboard.writeText(inviteLink);
																	setMessage("Link copied!");
																	setTimeout(() => setMessage(""), 2000);
																}}
																className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition font-medium"
															>
																📋 Copy
															</button>
														)}
														<button
															onClick={() => handleDelete(invite.id)}
															className="text-xs bg-red-50 text-red-500 px-2.5 py-1 rounded-lg hover:bg-red-100 transition font-medium"
														>
															🗑️ Delete
														</button>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
