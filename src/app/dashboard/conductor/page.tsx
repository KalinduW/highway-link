"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
		} catch {
			setVerifyResult({
				valid: false,
				message: "Something went wrong. Please try again.",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("userEmail");
		router.push("/");
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Navbar */}
			<nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
				<Link href="/" className="text-2xl font-bold text-blue-600">
					HighwayLink
				</Link>
				<div className="flex items-center gap-4">
					<span className="text-sm text-gray-500">Conductor Portal</span>
					<Button variant="outline" size="sm" onClick={handleLogout}>
						Logout
					</Button>
				</div>
			</nav>

			<div className="max-w-2xl mx-auto px-6 py-10">
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-gray-800">
						Conductor Dashboard
					</h1>
					<p className="text-gray-500 text-sm">
						Verify passenger tickets during boarding
					</p>
				</div>

				{/* Tabs */}
				<div className="flex gap-4 mb-6">
					{["verify", "instructions"].map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
								activeTab === tab
									? "bg-blue-600 text-white"
									: "bg-white text-gray-600 hover:bg-gray-100"
							}`}
						>
							{tab === "verify" ? "📷 Verify Ticket" : "📋 Instructions"}
						</button>
					))}
				</div>

				{activeTab === "verify" && (
					<div className="space-y-6">
						{/* QR Input */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Enter QR Code</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="qrcode">QR Code</Label>
									<Input
										id="qrcode"
										value={qrInput}
										onChange={(e) => setQrInput(e.target.value)}
										placeholder="Paste or type QR code here"
										className="mt-1"
									/>
								</div>
								<Button
									onClick={handleVerify}
									disabled={loading || !qrInput.trim()}
									className="w-full"
								>
									{loading ? "Verifying..." : "Verify Ticket"}
								</Button>
							</CardContent>
						</Card>

						{/* Result */}
						{verifyResult && (
							<Card
								className={
									verifyResult.valid
										? "border-green-400 bg-green-50"
										: "border-red-400 bg-red-50"
								}
							>
								<CardContent className="pt-6">
									<div className="flex items-center gap-3 mb-4">
										<span className="text-3xl">
											{verifyResult.valid ? "✅" : "❌"}
										</span>
										<div>
											<p
												className={`font-bold text-lg ${
													verifyResult.valid ? "text-green-700" : "text-red-700"
												}`}
											>
												{verifyResult.valid ? "VALID TICKET" : "INVALID TICKET"}
											</p>
											<p
												className={`text-sm ${
													verifyResult.valid ? "text-green-600" : "text-red-600"
												}`}
											>
												{verifyResult.message}
											</p>
										</div>
									</div>

									{verifyResult.valid && verifyResult.passenger && (
										<>
											<Separator className="my-4" />
											<div className="space-y-3">
												<div>
													<p className="text-xs text-gray-500 uppercase font-semibold mb-1">
														Passenger Details
													</p>
													<p className="font-semibold text-gray-800">
														{verifyResult.passenger.fullName}
													</p>
													<p className="text-gray-600 text-sm">
														{verifyResult.passenger.email}
													</p>
													<p className="text-gray-600 text-sm">
														{verifyResult.passenger.phone}
													</p>
												</div>
												{verifyResult.booking && (
													<div>
														<p className="text-xs text-gray-500 uppercase font-semibold mb-1">
															Booking Details
														</p>
														<p className="text-gray-800 text-sm">
															Seat:{" "}
															<strong>{verifyResult.booking.seatNumber}</strong>
														</p>
														<p className="text-gray-800 text-sm">
															Booked on:{" "}
															{new Date(
																verifyResult.booking.bookingTime
															).toLocaleDateString("en-US", {
																year: "numeric",
																month: "long",
																day: "numeric",
															})}
														</p>
														<span className="inline-block mt-1 text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
															{verifyResult.booking.bookingStatus.toUpperCase()}
														</span>
													</div>
												)}
											</div>
										</>
									)}
								</CardContent>
							</Card>
						)}
					</div>
				)}

				{activeTab === "instructions" && (
					<Card>
						<CardHeader>
							<CardTitle>How to Verify Tickets</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-sm text-gray-600">
							<div className="flex gap-3">
								<span className="text-blue-600 font-bold">1.</span>
								<p>
									Ask the passenger to show their QR code from the HighwayLink
									app or printed ticket.
								</p>
							</div>
							<div className="flex gap-3">
								<span className="text-blue-600 font-bold">2.</span>
								<p>
									Type or paste the QR code text into the input field above.
								</p>
							</div>
							<div className="flex gap-3">
								<span className="text-blue-600 font-bold">3.</span>
								<p>Click "Verify Ticket" to check if the ticket is valid.</p>
							</div>
							<div className="flex gap-3">
								<span className="text-blue-600 font-bold">4.</span>
								<p>
									A green result means the ticket is valid. A red result means
									it is invalid or already used.
								</p>
							</div>
							<div className="flex gap-3">
								<span className="text-blue-600 font-bold">5.</span>
								<p>
									Check that the passenger name and seat number match before
									allowing boarding.
								</p>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
