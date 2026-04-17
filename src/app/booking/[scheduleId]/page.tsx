"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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
	const [showEmailInput, setShowEmailInput] = useState(false);

	useEffect(() => {
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

		fetchSeats();
	}, [scheduleId]);

	const handleSeatClick = (seat: Seat) => {
		if (seat.isBooked) return;
		setSelectedSeat(seat);
		setShowEmailInput(true);
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
				setSuccess("Booking confirmed! 🎉");
				setQrCode(data.qrCode);
				setShowEmailInput(false);
				// Refresh seats
				const seatsRes = await fetch(
					`/api/booking/seats?scheduleId=${scheduleId}`
				);
				const seatsData = await seatsRes.json();
				setSeats(seatsData.seats);
				setSelectedSeat(null);
			}
		} catch {
			setError("Something went wrong");
		} finally {
			setBooking(false);
		}
	};

	// Split seats into rows of 4
	const rows = [];
	for (let i = 0; i < seats.length; i += 4) {
		rows.push(seats.slice(i, i + 4));
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Navbar */}
			<nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
				<Link href="/" className="text-2xl font-bold text-blue-600">
					HighwayLink
				</Link>
				<button
					onClick={() => router.back()}
					className="text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition text-sm"
				>
					← Back
				</button>
			</nav>

			<div className="max-w-2xl mx-auto px-6 py-10">
				<h2 className="text-2xl font-bold text-gray-800 mb-2">
					Select Your Seat
				</h2>
				<p className="text-gray-500 text-sm mb-8">
					Click on an available seat to select it
				</p>

				{/* Legend */}
				<div className="flex gap-6 mb-6">
					<div className="flex items-center gap-2">
						<div className="w-6 h-6 bg-green-100 border-2 border-green-400 rounded"></div>
						<span className="text-sm text-gray-600">Available</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-6 h-6 bg-blue-500 border-2 border-blue-600 rounded"></div>
						<span className="text-sm text-gray-600">Selected</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-6 h-6 bg-gray-300 border-2 border-gray-400 rounded"></div>
						<span className="text-sm text-gray-600">Booked</span>
					</div>
				</div>

				{loading && (
					<div className="text-center py-20 text-gray-500">
						Loading seats...
					</div>
				)}

				{error && !success && (
					<div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
						{error}
					</div>
				)}

				{success && (
					<div className="bg-green-50 text-green-600 p-6 rounded-xl mb-6 text-center">
						<p className="text-xl font-bold mb-2">{success}</p>
						<p className="text-sm text-gray-600 mb-4">Your QR Code:</p>
						<div className="bg-white border border-gray-200 rounded-lg p-4 font-mono text-sm break-all">
							{qrCode}
						</div>
						<p className="text-xs text-gray-500 mt-3">
							Save this code — you'll need it for boarding
						</p>
					</div>
				)}

				{/* Bus Front */}
				{!loading && (
					<div className="bg-white rounded-xl shadow-sm p-6">
						<div className="bg-gray-100 rounded-lg p-3 text-center text-sm text-gray-500 mb-6">
							🚌 Front of Bus / Driver
						</div>

						{/* Seat Grid */}
						<div className="space-y-3">
							{rows.map((row, rowIndex) => (
								<div key={rowIndex} className="flex gap-3 justify-center">
									{row.map((seat, seatIndex) => (
										<div key={seat.id} className="flex gap-3">
											<button
												onClick={() => handleSeatClick(seat)}
												disabled={seat.isBooked}
												className={`w-12 h-12 rounded-lg text-xs font-semibold border-2 transition ${
													seat.isBooked
														? "bg-gray-300 border-gray-400 cursor-not-allowed text-gray-500"
														: selectedSeat?.id === seat.id
														? "bg-blue-500 border-blue-600 text-white"
														: "bg-green-100 border-green-400 text-green-700 hover:bg-green-200"
												}`}
											>
												{seat.seatNumber}
											</button>
											{/* Aisle gap after 2nd seat */}
											{seatIndex === 1 && <div className="w-6"></div>}
										</div>
									))}
								</div>
							))}
						</div>

						<div className="bg-gray-100 rounded-lg p-3 text-center text-sm text-gray-500 mt-6">
							Back of Bus
						</div>
					</div>
				)}

				{/* Email Input & Confirm */}
				{showEmailInput && selectedSeat && (
					<div className="bg-white rounded-xl shadow-sm p-6 mt-6">
						<h3 className="text-lg font-semibold text-gray-800 mb-1">
							Confirm Booking
						</h3>
						<p className="text-gray-500 text-sm mb-4">
							Selected seat: <strong>{selectedSeat.seatNumber}</strong> (
							{selectedSeat.seatType})
						</p>
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Your Email Address
							</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Enter your registered email"
								className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						{error && (
							<div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
								{error}
							</div>
						)}
						<button
							onClick={handleBooking}
							disabled={booking || !email}
							className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
						>
							{booking ? "Confirming..." : "Confirm Booking"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
