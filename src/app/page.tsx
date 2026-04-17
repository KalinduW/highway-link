"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
	const router = useRouter();
	const [search, setSearch] = useState({
		origin: "",
		destination: "",
		date: "",
	});

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		router.push(
			`/buses?origin=${search.origin}&destination=${search.destination}&date=${search.date}`
		);
	};

	return (
		<div className="min-h-screen bg-white">
			{/* Navbar */}
			<nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
				<h1 className="text-2xl font-bold text-blue-600">HighwayLink</h1>
				<div className="flex gap-4">
					<Link
						href="/login"
						className="text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
					>
						Login
					</Link>
					<Link
						href="/register"
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
					>
						Register
					</Link>
				</div>
			</nav>

			{/* Hero Section */}
			<div className="bg-blue-600 text-white py-20 px-6 text-center">
				<h2 className="text-4xl font-bold mb-4">
					Travel Smarter on Sri Lanka's Highways
				</h2>
				<p className="text-blue-100 text-lg mb-10">
					Book seats, track buses in real time, and travel with confidence.
				</p>

				{/* Search Form */}
				<div className="max-w-3xl mx-auto bg-white rounded-xl p-6 shadow-lg">
					<form
						onSubmit={handleSearch}
						className="flex flex-col md:flex-row gap-4"
					>
						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-700 mb-1 text-left">
								From
							</label>
							<input
								type="text"
								value={search.origin}
								onChange={(e) =>
									setSearch({ ...search, origin: e.target.value })
								}
								required
								placeholder="e.g. Colombo"
								className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-700 mb-1 text-left">
								To
							</label>
							<input
								type="text"
								value={search.destination}
								onChange={(e) =>
									setSearch({ ...search, destination: e.target.value })
								}
								required
								placeholder="e.g. Matara"
								className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-700 mb-1 text-left">
								Date
							</label>
							<input
								type="date"
								value={search.date}
								onChange={(e) => setSearch({ ...search, date: e.target.value })}
								required
								className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div className="flex items-end">
							<button
								type="submit"
								className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
							>
								Search
							</button>
						</div>
					</form>
				</div>
			</div>

			{/* Features Section */}
			<div className="py-16 px-6 max-w-5xl mx-auto">
				<h3 className="text-2xl font-bold text-center text-gray-800 mb-10">
					Why Choose HighwayLink?
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="text-center p-6 bg-blue-50 rounded-xl">
						<div className="text-4xl mb-4">🎫</div>
						<h4 className="text-lg font-semibold text-gray-800 mb-2">
							Easy Booking
						</h4>
						<p className="text-gray-600 text-sm">
							Book your seat online in minutes. Choose your preferred seat and
							get a QR-coded digital ticket instantly.
						</p>
					</div>

					<div className="text-center p-6 bg-blue-50 rounded-xl">
						<div className="text-4xl mb-4">📍</div>
						<h4 className="text-lg font-semibold text-gray-800 mb-2">
							Real-Time Tracking
						</h4>
						<p className="text-gray-600 text-sm">
							Track your bus live on the map. Know exactly when your bus will
							arrive and plan your journey better.
						</p>
					</div>

					<div className="text-center p-6 bg-blue-50 rounded-xl">
						<div className="text-4xl mb-4">📱</div>
						<h4 className="text-lg font-semibold text-gray-800 mb-2">
							SMS Notifications
						</h4>
						<p className="text-gray-600 text-sm">
							Receive instant SMS alerts for booking confirmations, schedule
							changes, and boarding reminders.
						</p>
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="bg-gray-800 text-white text-center py-6 text-sm">
				<p>© 2025 HighwayLink. Smart Highway Bus Management System.</p>
			</footer>
		</div>
	);
}
