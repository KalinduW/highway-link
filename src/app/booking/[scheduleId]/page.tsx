"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from "qrcode.react";

interface Seat {
	id: string;
	seatNumber: string;
	seatType: string;
	isBooked: boolean;
}

export default function BookingPage() {
	const { scheduleId } = useParams();
	const router = useRouter();

	const [seats, setSeats] = useState<Seat[]>([]);
	const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
	const [loading, setLoading] = useState(true);
	const [booking, setBooking] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [qrCode, setQrCode] = useState("");
	const [email, setEmail] = useState("");
	const [showConfirm, setShowConfirm] = useState(false);

	useEffect(() => {
		const storedEmail = localStorage.getItem("userEmail");
		if (storedEmail) setEmail(storedEmail);
		fetchSeats();
	}, [scheduleId]);

	const fetchSeats = async () => {
		try {
			const res = await fetch(`/api/booking/seats?scheduleId=${scheduleId}`);
			const data = await res.json();
			if (!res.ok) {
				setError(data.error || "Failed to load seats");
			} else {
				setSeats(data.seats);
			}
		} catch {
			setError("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	const handleSeatClick = (seat: Seat) => {
		if (seat.isBooked) return;
		setSelectedSeat(seat);
		setShowConfirm(true);
		setError("");
		setSuccess("");
	};

	const handleBooking = async () => {
		if (!selectedSeat || !email) return;
		setBooking(true);
		setError("");

		try {
			const res = await fetch("/api/booking/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					scheduleId,
					seatId: selectedSeat.id,
					passengerEmail: email,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Booking failed");
			} else {
				setSuccess("Booking confirmed!");
				setQrCode(data.qrCode);
				setShowConfirm(false);
				fetchSeats();
				setSelectedSeat(null);
			}
		} catch {
			setError("Something went wrong");
		} finally {
			setBooking(false);
		}
	};

	// Build bus layout from seats
	const buildLayout = () => {
		if (seats.length === 0)
			return { frontSeat: null, regularRows: [], lastRow: [] };

		// S1 is front seat
		const frontSeat = seats[0];

		// Remaining seats
		const remaining = seats.slice(1);

		// Last 5 are the last row
		const hasLastRow = remaining.length >= 5;
		const lastRow = hasLastRow ? remaining.slice(-5) : [];
		const regularSeats = hasLastRow ? remaining.slice(0, -5) : remaining;

		// Split regular seats into rows of 4
		const regularRows: Seat[][] = [];
		for (let i = 0; i < regularSeats.length; i += 4) {
			regularRows.push(regularSeats.slice(i, i + 4));
		}

		return { frontSeat, regularRows, lastRow };
	};

	const { frontSeat, regularRows, lastRow } = buildLayout();

	const getSeatLabel = (seat: Seat) => {
		if (seat.seatType === "window") return "W";
		if (seat.seatType === "aisle") return "A";
		return "M";
	};

	const getSeatStyle = (seat: Seat) => {
		if (seat.isBooked) {
			return "bg-gray-200 border-gray-300 cursor-not-allowed text-gray-400";
		}
		if (selectedSeat?.id === seat.id) {
			return "bg-blue-500 border-blue-600 text-white shadow-lg scale-110";
		}
		return "bg-green-100 border-green-400 text-green-700 hover:bg-green-200 hover:scale-105";
	};

	const SeatButton = ({ seat }: { seat: Seat }) => (
		<button
			onClick={() => handleSeatClick(seat)}
			disabled={seat.isBooked}
			title={`${seat.seatNumber} - ${seat.seatType}`}
			className={`w-11 h-11 rounded-xl text-xs font-bold border-2 transition-all flex flex-col items-center justify-center ${getSeatStyle(
				seat
			)}`}
		>
			<span>{seat.seatNumber.replace("S", "")}</span>
			<span className="text-[8px] opacity-70">{getSeatLabel(seat)}</span>
		</button>
	);

	const availableCount = seats.filter((s) => !s.isBooked).length;
	const bookedCount = seats.filter((s) => s.isBooked).length;

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Navbar */}
			<nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50">
				<Link href="/" className="flex items-center gap-2">
					<span className="text-2xl">🚌</span>
					<span className="text-xl font-bold text-blue-600">HighwayLink</span>
				</Link>
				<Button
					variant="outline"
					size="sm"
					className="rounded-full"
					onClick={() => router.back()}
				>
					← Back
				</Button>
			</nav>

			<div className="max-w-3xl mx-auto px-6 py-10">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-2xl font-extrabold text-gray-800 mb-1">
						Select Your Seat
					</h1>
					<p className="text-gray-400 text-sm">
						Click on an available seat to select it
					</p>
				</div>

				{/* Success */}
				{success && qrCode && (
					<Card className="border-0 shadow-sm ring-2 ring-green-400 mb-6 overflow-hidden">
						<div className="bg-green-500 px-6 py-4 flex items-center gap-3">
							<span className="text-3xl">🎉</span>
							<div>
								<p className="text-white font-extrabold text-lg">
									Booking Confirmed!
								</p>
								<p className="text-green-100 text-sm">
									Your seat has been reserved successfully
								</p>
							</div>
						</div>
						<CardContent className="p-6">
							<div className="flex flex-col md:flex-row gap-6 items-center">
								<div className="flex flex-col items-center">
									<p className="text-sm font-semibold text-gray-600 mb-3">
										Your Boarding Pass
									</p>
									<div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
										<QRCodeSVG value={qrCode} size={160} />
									</div>
									<p className="text-xs text-gray-400 mt-3">
										Show this to the conductor
									</p>
								</div>
								<div className="flex-1 space-y-3">
									<div className="bg-gray-50 rounded-xl p-4">
										<p className="text-xs text-gray-400 mb-1">QR Code</p>
										<p className="font-mono text-xs text-gray-600 break-all">
											{qrCode}
										</p>
									</div>
									<div className="flex gap-2">
										<Button
											className="flex-1 rounded-full"
											onClick={() => window.print()}
										>
											🖨️ Print Ticket
										</Button>
										<Button
											variant="outline"
											className="flex-1 rounded-full"
											onClick={() => router.push("/dashboard/passenger")}
										>
											View Dashboard
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Seat Map */}
					<div className="md:col-span-2">
						<Card className="border-0 shadow-sm">
							<CardContent className="p-6">
								{/* Legend */}
								<div className="flex gap-4 mb-6 flex-wrap">
									{[
										{
											color: "bg-green-100 border-green-400",
											label: "Available",
										},
										{ color: "bg-blue-500 border-blue-600", label: "Selected" },
										{ color: "bg-gray-200 border-gray-300", label: "Booked" },
									].map((item) => (
										<div key={item.label} className="flex items-center gap-2">
											<div
												className={`w-5 h-5 rounded border-2 ${item.color}`}
											></div>
											<span className="text-xs text-gray-500">
												{item.label}
											</span>
										</div>
									))}
									<div className="flex items-center gap-3 text-xs text-gray-400 ml-auto">
										<span>W=Window</span>
										<span>A=Aisle</span>
										<span>M=Middle</span>
									</div>
								</div>

								{loading && (
									<div className="text-center py-10">
										<p className="text-gray-400 animate-pulse">
											Loading seats...
										</p>
									</div>
								)}

								{!loading && (
									<div className="space-y-3">
										{/* Front Row — S1 + Driver */}
										<div className="flex justify-center gap-2 mb-2">
											<div className="flex gap-2">
												{/* S1 Seat */}
												{frontSeat && <SeatButton seat={frontSeat} />}

												{/* Driver seat — not selectable */}
												<div className="w-11 h-11 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-not-allowed">
													<span className="text-lg">🚗</span>
													<span className="text-[8px] text-gray-400">
														Driver
													</span>
												</div>
											</div>
										</div>

										{/* Divider */}
										<div className="border-t-2 border-dashed border-gray-200 my-2"></div>

										{/* Regular Rows */}
										{regularRows.map((row, rowIndex) => (
											<div
												key={rowIndex}
												className="flex justify-center items-center gap-2"
											>
												{/* Row number */}
												<span className="text-xs text-gray-300 w-5 text-center">
													{rowIndex + 1}
												</span>

												{/* Left 2 seats */}
												<div className="flex gap-2">
													{row.slice(0, 2).map((seat) => (
														<SeatButton key={seat.id} seat={seat} />
													))}
												</div>

												{/* Aisle */}
												<div className="w-8 flex items-center justify-center">
													<div className="h-8 border-l-2 border-dashed border-gray-200"></div>
												</div>

												{/* Right 2 seats */}
												<div className="flex gap-2">
													{row.slice(2, 4).map((seat) => (
														<SeatButton key={seat.id} seat={seat} />
													))}
												</div>

												{/* Row number right */}
												<span className="text-xs text-gray-300 w-5 text-center">
													{rowIndex + 1}
												</span>
											</div>
										))}

										{/* Last Row — 5 seats */}
										{lastRow.length > 0 && (
											<>
												<div className="border-t-2 border-dashed border-gray-200 my-2"></div>
												<div className="flex justify-center gap-2">
													{lastRow.map((seat) => (
														<SeatButton key={seat.id} seat={seat} />
													))}
												</div>
											</>
										)}

										{/* Bus Back */}
										<div className="bg-gray-100 rounded-xl p-3 text-center text-gray-500 text-sm font-medium mt-4">
											Back of Bus
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Right Panel */}
					<div className="space-y-4">
						{/* Seat Stats */}
						<Card className="border-0 shadow-sm">
							<CardContent className="p-5">
								<h3 className="font-bold text-gray-800 mb-4">
									Seat Availability
								</h3>
								<div className="space-y-3">
									<div className="flex justify-between items-center">
										<div className="flex items-center gap-2">
											<div className="w-3 h-3 rounded-full bg-green-400"></div>
											<span className="text-sm text-gray-600">Available</span>
										</div>
										<span className="font-bold text-gray-800">
											{availableCount}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<div className="flex items-center gap-2">
											<div className="w-3 h-3 rounded-full bg-gray-300"></div>
											<span className="text-sm text-gray-600">Booked</span>
										</div>
										<span className="font-bold text-gray-800">
											{bookedCount}
										</span>
									</div>
									<Separator />
									<div className="flex justify-between items-center">
										<span className="text-sm font-semibold text-gray-700">
											Total
										</span>
										<span className="font-bold text-gray-800">
											{seats.length}
										</span>
									</div>
								</div>

								{/* Occupancy Bar */}
								<div className="mt-4">
									<div className="flex justify-between text-xs text-gray-400 mb-1">
										<span>Occupancy</span>
										<span>
											{seats.length > 0
												? Math.round((bookedCount / seats.length) * 100)
												: 0}
											%
										</span>
									</div>
									<div className="bg-gray-100 rounded-full h-2">
										<div
											className="bg-blue-500 h-2 rounded-full transition-all"
											style={{
												width: `${
													seats.length > 0
														? (bookedCount / seats.length) * 100
														: 0
												}%`,
											}}
										/>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Confirm Booking */}
						{showConfirm && selectedSeat && (
							<Card className="border-0 shadow-sm ring-2 ring-blue-400">
								<CardContent className="p-5">
									<h3 className="font-bold text-gray-800 mb-4">
										✅ Confirm Booking
									</h3>

									<div className="bg-blue-50 rounded-xl p-3 mb-4">
										<p className="text-xs text-gray-500 mb-0.5">
											Selected Seat
										</p>
										<p className="font-extrabold text-blue-600 text-2xl">
											{selectedSeat.seatNumber}
										</p>
										<p className="text-xs text-gray-400 capitalize">
											{selectedSeat.seatType === "aisle"
												? "Aisle"
												: selectedSeat.seatType === "window"
												? "Window"
												: "Middle"}{" "}
											seat
										</p>
									</div>

									<div className="mb-4">
										<label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
											Your Email
										</label>
										<input
											type="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											placeholder="Enter your registered email"
											className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>

									{error && (
										<div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-xs">
											⚠️ {error}
										</div>
									)}

									<div className="flex gap-2">
										<Button
											onClick={handleBooking}
											disabled={booking || !email}
											className="flex-1 rounded-full"
										>
											{booking ? "Booking..." : "Confirm →"}
										</Button>
										<Button
											variant="outline"
											className="rounded-full"
											onClick={() => {
												setShowConfirm(false);
												setSelectedSeat(null);
											}}
										>
											✕
										</Button>
									</div>
								</CardContent>
							</Card>
						)}

						{/* No seat selected */}
						{!showConfirm && !success && (
							<Card className="border-0 shadow-sm">
								<CardContent className="p-5 text-center">
									<div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-2xl">
										💺
									</div>
									<p className="text-gray-600 font-medium text-sm mb-1">
										No seat selected
									</p>
									<p className="text-gray-400 text-xs">
										Click on a green seat on the map to select it
									</p>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
