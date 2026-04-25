"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from "qrcode.react";

interface Booking {
	id: string;
	qrCode: string;
	bookingStatus: string;
	bookingTime: string;
	scheduleId: string;
}

export default function PassengerDashboard() {
	const router = useRouter();
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [email, setEmail] = useState("");
	const [userName, setUserName] = useState("");
	const [activeTab, setActiveTab] = useState("bookings");
	const [selectedQR, setSelectedQR] = useState<string | null>(null);

	useEffect(() => {
		const storedEmail = localStorage.getItem("userEmail");
		const storedName = localStorage.getItem("userName");
		if (!storedEmail) {
			router.push("/login");
			return;
		}
		setEmail(storedEmail);
		setUserName(storedName || "");
		fetchBookings(storedEmail);
	}, []);

	const fetchBookings = async (userEmail: string) => {
		try {
			const res = await fetch(`/api/passenger/bookings?email=${userEmail}`);
			const data = await res.json();
			if (res.ok) setBookings(data.bookings);
		} catch {
			console.error("Failed to fetch bookings");
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = async (bookingId: string) => {
		if (!confirm("Are you sure you want to cancel this booking?")) return;
		try {
			const res = await fetch("/api/passenger/cancel", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ bookingId }),
			});
			const data = await res.json();
			if (!res.ok) {
				alert(data.error || "Failed to cancel booking");
			} else {
				alert("Booking cancelled successfully");
				fetchBookings(email);
			}
		} catch {
			alert("Something went wrong");
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("userEmail");
		localStorage.removeItem("userName");
		router.push("/");
	};

	const getStatusConfig = (status: string) => {
		switch (status) {
			case "confirmed":
				return {
					color: "bg-green-100 text-green-700 border-green-200",
					dot: "bg-green-500",
					label: "Confirmed",
				};
			case "cancelled":
				return {
					color: "bg-red-100 text-red-700 border-red-200",
					dot: "bg-red-500",
					label: "Cancelled",
				};
			case "rescheduled":
				return {
					color: "bg-blue-100 text-blue-700 border-blue-200",
					dot: "bg-blue-500",
					label: "Rescheduled",
				};
			default:
				return {
					color: "bg-yellow-100 text-yellow-700 border-yellow-200",
					dot: "bg-yellow-500",
					label: "Pending",
				};
		}
	};

	const initials = userName
		? userName
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "U";

	const confirmedCount = bookings.filter(
		(b) => b.bookingStatus === "confirmed"
	).length;
	const cancelledCount = bookings.filter(
		(b) => b.bookingStatus === "cancelled"
	).length;

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Navbar */}
			<nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50">
				<Link href="/" className="flex items-center gap-2">
					<span className="text-2xl">🚌</span>
					<span className="text-xl font-bold text-blue-600">HighwayLink</span>
				</Link>
				<div className="flex items-center gap-4">
					<div className="hidden md:flex items-center gap-3">
						<div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
							{initials}
						</div>
						<div className="text-right">
							<p className="text-sm font-semibold text-gray-800">{userName}</p>
							<p className="text-xs text-gray-400">{email}</p>
						</div>
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
				{/* Welcome Banner */}
				<div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 mb-8 text-white flex justify-between items-center">
					<div>
						<p className="text-blue-100 text-sm mb-1">Welcome back,</p>
						<h1 className="text-2xl font-extrabold">
							{userName || "Passenger"} 👋
						</h1>
						<p className="text-blue-100 text-sm mt-1">
							{confirmedCount} active booking{confirmedCount !== 1 ? "s" : ""}
						</p>
					</div>
					<Button
						onClick={() => router.push("/")}
						className="bg-white text-blue-600 hover:bg-blue-50 font-semibold rounded-full px-5"
					>
						+ Book New Trip
					</Button>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-3 gap-4 mb-8">
					{[
						{
							label: "Total Bookings",
							value: bookings.length,
							icon: "🎫",
							color: "bg-blue-50 text-blue-600",
						},
						{
							label: "Confirmed",
							value: confirmedCount,
							icon: "✅",
							color: "bg-green-50 text-green-600",
						},
						{
							label: "Cancelled",
							value: cancelledCount,
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
						{ id: "bookings", label: "🎫 My Bookings" },
						{ id: "lostfound", label: "🔍 Lost & Found" },
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

				{/* Bookings Tab */}
				{activeTab === "bookings" && (
					<div className="space-y-4">
						{loading && (
							<div className="text-center py-20">
								<div className="text-4xl mb-3 animate-pulse">🎫</div>
								<p className="text-gray-500">Loading your bookings...</p>
							</div>
						)}

						{!loading && bookings.length === 0 && (
							<Card className="border-0 shadow-sm">
								<CardContent className="py-16 text-center">
									<div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
										🎫
									</div>
									<h3 className="text-lg font-bold text-gray-800 mb-2">
										No bookings yet
									</h3>
									<p className="text-gray-400 text-sm mb-6">
										Search for a bus and book your first seat
									</p>
									<Button
										onClick={() => router.push("/")}
										className="rounded-full px-6"
									>
										Search Buses
									</Button>
								</CardContent>
							</Card>
						)}

						{!loading &&
							bookings.map((booking) => {
								const statusConfig = getStatusConfig(booking.bookingStatus);
								return (
									<Card
										key={booking.id}
										className="border-0 shadow-sm hover:shadow-md transition"
									>
										<CardContent className="p-6">
											<div className="flex justify-between items-start mb-4">
												<div>
													<div className="flex items-center gap-2 mb-1">
														<p className="font-bold text-gray-800">
															Booking #{booking.id.slice(0, 8).toUpperCase()}
														</p>
														<span
															className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusConfig.color} flex items-center gap-1`}
														>
															<span
																className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
															></span>
															{statusConfig.label}
														</span>
													</div>
													<p className="text-gray-400 text-sm">
														📅{" "}
														{new Date(booking.bookingTime).toLocaleDateString(
															"en-US",
															{
																weekday: "long",
																year: "numeric",
																month: "long",
																day: "numeric",
															}
														)}
													</p>
												</div>
											</div>

											<Separator className="mb-4" />

											{/* Action Buttons */}
											<div className="flex gap-2 flex-wrap">
												<Button
													variant="outline"
													size="sm"
													className="rounded-full"
													onClick={() =>
														setSelectedQR(
															selectedQR === booking.qrCode
																? null
																: booking.qrCode
														)
													}
												>
													{selectedQR === booking.qrCode
														? "🙈 Hide QR"
														: "📱 Show QR"}
												</Button>

												{booking.bookingStatus !== "cancelled" && (
													<>
														<Button
															variant="outline"
															size="sm"
															className="rounded-full"
															onClick={() =>
																router.push(
																	`/dashboard/passenger/reschedule?bookingId=${booking.id}`
																)
															}
														>
															🔄 Reschedule
														</Button>
														<Button
															variant="outline"
															size="sm"
															className="rounded-full"
															onClick={() =>
																router.push(
																	`/booking/${booking.scheduleId}?bookingId=${booking.id}&changeSeat=true`
																)
															}
														>
															💺 Change Seat
														</Button>
														<Button
															size="sm"
															className="rounded-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
															variant="outline"
															onClick={() => handleCancel(booking.id)}
														>
															✕ Cancel
														</Button>
													</>
												)}
											</div>

											{/* QR Code */}
											{selectedQR === booking.qrCode && (
												<>
													<Separator className="my-4" />
													<div className="flex flex-col items-center bg-gray-50 rounded-2xl p-6">
														<p className="text-sm font-semibold text-gray-600 mb-1">
															Your Boarding Pass
														</p>
														<p className="text-xs text-gray-400 mb-4">
															Show this QR code to the conductor
														</p>
														<div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
															<QRCodeSVG value={booking.qrCode} size={180} />
														</div>
														<p className="text-xs text-gray-400 mt-3 font-mono bg-white px-3 py-1 rounded-full border">
															{booking.qrCode.slice(0, 30)}...
														</p>
														<Button
															variant="outline"
															size="sm"
															className="mt-4 rounded-full"
															onClick={() => window.print()}
														>
															🖨️ Print Ticket
														</Button>
													</div>
												</>
											)}
										</CardContent>
									</Card>
								);
							})}
					</div>
				)}

				{/* Lost & Found Tab */}
				{activeTab === "lostfound" && (
					<Card className="border-0 shadow-sm">
						<CardContent className="py-16 text-center">
							<div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
								🔍
							</div>
							<h3 className="text-lg font-bold text-gray-800 mb-2">
								Lost & Found
							</h3>
							<p className="text-gray-400 text-sm mb-6">
								Report or search for lost items on highway buses
							</p>
							<Button
								onClick={() => router.push("/lostfound")}
								className="rounded-full px-6"
							>
								Go to Lost & Found
							</Button>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
