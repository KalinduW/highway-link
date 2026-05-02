"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface VerifyResult {
	valid: boolean;
	message: string;
	passenger?: {
		fullName: string;
		email: string;
		phone: string;
	};
	booking?: {
		id: string;
		seatNumber: string;
		bookingStatus: string;
		bookingTime: string;
	};
}

export default function ConductorDashboard() {
	const router = useRouter();
	const [qrInput, setQrInput] = useState("");
	const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("verify");
	const [scanCount, setScanCount] = useState(0);
	const [validCount, setValidCount] = useState(0);
	const [invalidCount, setInvalidCount] = useState(0);

	const handleVerify = async () => {
		if (!qrInput.trim()) return;
		setLoading(true);
		setVerifyResult(null);

		try {
			const res = await fetch("/api/conductor/verify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ qrCode: qrInput.trim() }),
			});
			const data = await res.json();
			setVerifyResult(data);
			setScanCount((prev) => prev + 1);
			if (data.valid) {
				setValidCount((prev) => prev + 1);
			} else {
				setInvalidCount((prev) => prev + 1);
			}
			setQrInput("");
		} catch {
			setVerifyResult({
				valid: false,
				message: "Something went wrong. Please try again.",
			});
			setInvalidCount((prev) => prev + 1);
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("userEmail");
		router.push("/");
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") handleVerify();
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Navbar */}
			<nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50">
				<Link href="/" className="flex items-center gap-2">
					<span className="text-2xl">🚌</span>
					<span className="text-xl font-bold text-blue-600">HighwayLink</span>
				</Link>
				<div className="flex items-center gap-4">
					<div className="hidden md:flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5">
						<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
						<span className="text-blue-700 text-sm font-medium">
							Conductor Portal
						</span>
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
				{/* Header */}
				<div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 mb-8 text-white">
					<div className="flex justify-between items-start">
						<div>
							<p className="text-blue-100 text-sm mb-1">Conductor Dashboard</p>
							<h1 className="text-2xl font-extrabold mb-1">
								Ticket Verification
							</h1>
							<p className="text-blue-100 text-sm">
								Scan or enter QR codes to verify passenger tickets
							</p>
						</div>
						<span className="text-5xl">🎫</span>
					</div>
				</div>

				{/* Session Stats */}
				<div className="grid grid-cols-3 gap-4 mb-8">
					{[
						{
							label: "Total Scanned",
							value: scanCount,
							icon: "📱",
							color: "bg-blue-50 text-blue-600",
						},
						{
							label: "Valid",
							value: validCount,
							icon: "✅",
							color: "bg-green-50 text-green-600",
						},
						{
							label: "Invalid",
							value: invalidCount,
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

				{/* Tabs */}
				<div className="flex gap-2 mb-6 bg-white border border-gray-100 rounded-xl p-1 w-fit">
					{[
						{ id: "verify", label: "📷 Verify Ticket" },
						{ id: "instructions", label: "📋 Instructions" },
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

				{/* Verify Tab */}
				{activeTab === "verify" && (
					<div className="space-y-6">
						{/* Input Card */}
						<Card className="border-0 shadow-sm">
							<CardContent className="p-6">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
										📱
									</div>
									<div>
										<h3 className="font-bold text-gray-800">Enter QR Code</h3>
										<p className="text-gray-400 text-xs">
											Type or paste the passenger's QR code and press Enter
										</p>
									</div>
								</div>
								<div className="flex gap-3">
									<Input
										value={qrInput}
										onChange={(e) => setQrInput(e.target.value)}
										onKeyDown={handleKeyDown}
										placeholder="Paste QR code here or press Enter to verify..."
										className="flex-1 h-11"
										autoFocus
									/>
									<Button
										onClick={handleVerify}
										disabled={loading || !qrInput.trim()}
										className="h-11 px-6 rounded-xl"
									>
										{loading ? "Verifying..." : "Verify →"}
									</Button>
								</div>
								<p className="text-xs text-gray-400 mt-2">
									💡 Tip: Press Enter after pasting the QR code to verify
									quickly
								</p>
							</CardContent>
						</Card>

						{/* Result */}
						{verifyResult && (
							<Card
								className={`border-0 shadow-sm overflow-hidden ${
									verifyResult.valid
										? "ring-2 ring-green-400"
										: "ring-2 ring-red-400"
								}`}
							>
								{/* Result Header */}
								<div
									className={`px-6 py-4 flex items-center gap-4 ${
										verifyResult.valid ? "bg-green-500" : "bg-red-500"
									}`}
								>
									<span className="text-4xl">
										{verifyResult.valid ? "✅" : "❌"}
									</span>
									<div>
										<p className="text-white font-extrabold text-xl">
											{verifyResult.valid ? "VALID TICKET" : "INVALID TICKET"}
										</p>
										<p className="text-white text-sm opacity-90">
											{verifyResult.message}
										</p>
									</div>
								</div>

								{/* Passenger Details */}
								{verifyResult.valid && verifyResult.passenger && (
									<CardContent className="p-6">
										<div className="grid grid-cols-2 gap-6">
											<div>
												<p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-3">
													Passenger Details
												</p>
												<div className="flex items-center gap-3 mb-3">
													<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
														{verifyResult.passenger.fullName
															.split(" ")
															.map((n) => n[0])
															.join("")
															.slice(0, 2)
															.toUpperCase()}
													</div>
													<div>
														<p className="font-bold text-gray-800">
															{verifyResult.passenger.fullName}
														</p>
														<p className="text-gray-500 text-xs">
															{verifyResult.passenger.email}
														</p>
													</div>
												</div>
												<p className="text-gray-600 text-sm flex items-center gap-2">
													<span>📞</span> {verifyResult.passenger.phone}
												</p>
											</div>

											{verifyResult.booking && (
												<div>
													<p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-3">
														Booking Details
													</p>
													<div className="space-y-2">
														<div className="bg-gray-50 rounded-xl p-3">
															<p className="text-xs text-gray-400 mb-0.5">
																Seat Number
															</p>
															<p className="font-bold text-gray-800 text-lg">
																{verifyResult.booking.seatNumber}
															</p>
														</div>
														<div className="bg-gray-50 rounded-xl p-3">
															<p className="text-xs text-gray-400 mb-0.5">
																Booked On
															</p>
															<p className="font-semibold text-gray-700 text-sm">
																{new Date(
																	verifyResult.booking.bookingTime
																).toLocaleDateString("en-US", {
																	year: "numeric",
																	month: "long",
																	day: "numeric",
																})}
															</p>
														</div>
														<div className="bg-green-50 rounded-xl p-3">
															<p className="text-xs text-gray-400 mb-0.5">
																Status
															</p>
															<p className="font-bold text-green-600">
																✅ USED — Passenger Boarded
															</p>
														</div>
													</div>
												</div>
											)}
										</div>
									</CardContent>
								)}
							</Card>
						)}
					</div>
				)}

				{/* Instructions Tab */}
				{activeTab === "instructions" && (
					<Card className="border-0 shadow-sm">
						<CardHeader>
							<CardTitle className="text-base">How to Verify Tickets</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{[
								{
									step: "01",
									icon: "📱",
									title: "Ask for QR Code",
									desc: "Ask the passenger to show their QR code from the HighwayLink app or printed ticket.",
								},
								{
									step: "02",
									icon: "⌨️",
									title: "Enter the Code",
									desc: "Type or paste the QR code text into the input field on the Verify tab.",
								},
								{
									step: "03",
									icon: "🔍",
									title: "Verify",
									desc: "Click the Verify button or press Enter to check if the ticket is valid.",
								},
								{
									step: "04",
									icon: "✅",
									title: "Check Result",
									desc: "A green result means valid. A red result means invalid or already used.",
								},
								{
									step: "05",
									icon: "👤",
									title: "Confirm Identity",
									desc: "Check that the passenger name and seat number match before allowing boarding.",
								},
							].map((item) => (
								<div
									key={item.step}
									className="flex gap-4 p-4 bg-gray-50 rounded-xl"
								>
									<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
										{item.step}
									</div>
									<div>
										<p className="font-semibold text-gray-800 text-sm mb-0.5">
											{item.icon} {item.title}
										</p>
										<p className="text-gray-500 text-sm">{item.desc}</p>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
