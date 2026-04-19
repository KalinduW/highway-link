"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
	const [activeTab, setActiveTab] = useState("bookings");
	const [selectedQR, setSelectedQR] = useState<string | null>(null);

	useEffect(() => {
		const storedEmail = localStorage.getItem("userEmail");
		if (!storedEmail) {
			router.push("/login");
			return;
		}
		setEmail(storedEmail);
		fetchBookings(storedEmail);
	}, []);

	const fetchBookings = async (userEmail: string) => {
		try {
			const res = await fetch(`/api/passenger/bookings?email=${userEmail}`);
			const data = await res.json();
			if (res.ok) {
				setBookings(data.bookings);
			}
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

	const getStatusColor = (status: string) => {
		switch (status) {
			case "confirmed":
				return "bg-green-100 text-green-700";
			case "cancelled":
				return "bg-red-100 text-red-700";
			case "pending":
				return "bg-yellow-100 text-yellow-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("userEmail");
		localStorage.removeItem("userName");
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
					<span className="text-gray-600 text-sm">{email}</span>
					<Button variant="outline" size="sm" onClick={handleLogout}>
						Logout
					</Button>
				</div>
			</nav>

			<div className="max-w-4xl mx-auto px-6 py-10">
				{/* Welcome */}
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
					<p className="text-gray-500 text-sm">
						Manage your bookings and account
					</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
					<Card>
						<CardContent className="pt-6">
							<div className="text-3xl mb-1">🎫</div>
							<p className="text-2xl font-bold text-gray-800">
								{bookings.length}
							</p>
							<p className="text-gray-500 text-sm">Total Bookings</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="text-3xl mb-1">✅</div>
							<p className="text-2xl font-bold text-gray-800">
								{bookings.filter((b) => b.bookingStatus === "confirmed").length}
							</p>
							<p className="text-gray-500 text-sm">Confirmed</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="text-3xl mb-1">❌</div>
							<p className="text-2xl font-bold text-gray-800">
								{bookings.filter((b) => b.bookingStatus === "cancelled").length}
							</p>
							<p className="text-gray-500 text-sm">Cancelled</p>
						</CardContent>
					</Card>
				</div>

				{/* Tabs */}
				<div className="flex gap-4 mb-6">
					{["bookings", "lostfound"].map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
								activeTab === tab
									? "bg-blue-600 text-white"
									: "bg-white text-gray-600 hover:bg-gray-100"
							}`}
						>
							{tab === "bookings" ? "🎫 My Bookings" : "🔍 Lost & Found"}
						</button>
					))}
				</div>

				{/* Bookings Tab */}
				{activeTab === "bookings" && (
					<div className="space-y-4">
						{loading && (
							<p className="text-center text-gray-500 py-10">
								Loading bookings...
							</p>
						)}
						{!loading && bookings.length === 0 && (
							<Card>
								<CardContent className="py-10 text-center">
									<p className="text-4xl mb-3">🎫</p>
									<p className="text-gray-600 font-medium">No bookings yet</p>
									<p className="text-gray-400 text-sm mb-4">
										Search for a bus and book your first seat
									</p>
									<Button onClick={() => router.push("/")}>Search Buses</Button>
								</CardContent>
							</Card>
						)}
						{!loading &&
							bookings.map((booking) => (
								<Card key={booking.id}>
									<CardContent className="pt-6">
										<div className="flex justify-between items-start">
											<div>
												<p className="font-semibold text-gray-800 mb-1">
													Booking #{booking.id.slice(0, 8).toUpperCase()}
												</p>
												<p className="text-gray-500 text-sm mb-2">
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
												<span
													className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(
														booking.bookingStatus
													)}`}
												>
													{booking.bookingStatus.toUpperCase()}
												</span>
											</div>
											<div className="flex gap-2 flex-wrap">
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														setSelectedQR(
															selectedQR === booking.qrCode
																? null
																: booking.qrCode
														)
													}
												>
													{selectedQR === booking.qrCode
														? "Hide QR"
														: "Show QR"}
												</Button>
												{booking.bookingStatus !== "cancelled" && (
													<>
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																router.push(
																	`/dashboard/passenger/reschedule?bookingId=${booking.id}`
																)
															}
														>
															Reschedule
														</Button>
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																router.push(
																	`/booking/${booking.scheduleId}?bookingId=${booking.id}&changeSeat=true`
																)
															}
														>
															Change Seat
														</Button>
														<Button
															variant="destructive"
															size="sm"
															onClick={() => handleCancel(booking.id)}
														>
															Cancel
														</Button>
													</>
												)}
											</div>
										</div>

										{selectedQR === booking.qrCode && (
											<>
												<Separator className="my-4" />
												<div className="flex flex-col items-center">
													<p className="text-sm text-gray-500 mb-3">
														Show this to the conductor
													</p>
													<QRCodeSVG value={booking.qrCode} size={180} />
													<p className="text-xs text-gray-400 mt-3 font-mono">
														{booking.qrCode}
													</p>
													<Button
														variant="outline"
														size="sm"
														className="mt-3"
														onClick={() => window.print()}
													>
														Print Ticket
													</Button>
												</div>
											</>
										)}
									</CardContent>
								</Card>
							))}
					</div>
				)}

				{/* Lost & Found Tab */}
				{activeTab === "lostfound" && (
					<Card>
						<CardHeader>
							<CardTitle>Lost & Found</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-500 text-sm">
								Lost & Found feature coming soon.
							</p>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
