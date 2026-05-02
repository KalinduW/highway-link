"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import LocationInput from "@/components/LocationInput";

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
		<div className="min-h-screen bg-white flex flex-col">
			{/* Navbar */}
			<nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50">
				<div className="flex items-center gap-2">
					<span className="text-3xl">🚌</span>
					<h1 className="text-xl font-bold text-blue-600 tracking-tight">
						HighwayLink
					</h1>
				</div>
				<div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
					<Link href="/lostfound" className="hover:text-blue-600 transition">
						Lost & Found
					</Link>
					<Link href="/login" className="hover:text-blue-600 transition">
						Login
					</Link>
					<Link href="/register">
						<Button size="sm" className="rounded-full px-5">
							Get Started
						</Button>
					</Link>
				</div>
			</nav>

			{/* Hero Section */}
			<div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white overflow-hidden">
				{/* Background circles */}
				<div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-20 translate-x-32 -translate-y-16" />
				<div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-800 rounded-full opacity-20 -translate-x-16 translate-y-16" />

				<div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
					<div className="inline-flex items-center gap-2 bg-blue-500 bg-opacity-40 border border-blue-400 rounded-full px-4 py-1.5 text-sm mb-6">
						<span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
						Now available on all major highway routes
					</div>

					<h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
						Sri Lanka's Smartest
						<br />
						<span className="text-yellow-300">Bus Booking</span> Platform
					</h2>
					<p className="text-blue-100 text-xl mb-12 max-w-2xl mx-auto">
						Book seats, track buses in real time, and manage your journey — all
						in one place.
					</p>

					{/* Search Box */}
					<Card className="max-w-3xl mx-auto shadow-2xl border-0">
						<CardContent className="p-6">
							<form onSubmit={handleSearch}>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
									<div className="text-left">
										<LocationInput
											label="From"
											value={search.origin}
											onChange={(value) =>
												setSearch({ ...search, origin: value })
											}
											placeholder="e.g. Colombo"
											required
										/>
									</div>
									<div className="text-left">
										<LocationInput
											label="To"
											value={search.destination}
											onChange={(value) =>
												setSearch({ ...search, destination: value })
											}
											placeholder="e.g. Matara"
											required
										/>
									</div>
									<div className="text-left">
										<Label className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1.5 block">
											Date
										</Label>
										<Input
											type="date"
											value={search.date}
											onChange={(e) =>
												setSearch({ ...search, date: e.target.value })
											}
											required
											className="h-11"
										/>
									</div>
								</div>
								<Button
									type="submit"
									className="w-full h-11 text-base font-semibold rounded-lg"
								>
									🔍 Search Available Buses
								</Button>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Stats Bar */}
			<div className="bg-gray-900 text-white py-6 px-6">
				<div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
					{[
						{ value: "50+", label: "Highway Routes" },
						{ value: "200+", label: "Daily Trips" },
						{ value: "10,000+", label: "Happy Passengers" },
						{ value: "99%", label: "On-Time Rate" },
					].map((stat) => (
						<div key={stat.label}>
							<p className="text-2xl font-bold text-yellow-400">{stat.value}</p>
							<p className="text-gray-400 text-sm">{stat.label}</p>
						</div>
					))}
				</div>
			</div>

			{/* Popular Routes */}
			<div className="py-16 px-6 bg-gray-50">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-10">
						<h3 className="text-3xl font-bold text-gray-800 mb-2">
							Popular Routes
						</h3>
						<p className="text-gray-500">
							Click a route to auto-fill the search
						</p>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{[
							{
								from: "Colombo",
								to: "Matara",
								duration: "2.5 hrs",
								price: "LKR 350",
								color: "blue",
							},
							{
								from: "Colombo",
								to: "Kandy",
								duration: "3 hrs",
								price: "LKR 400",
								color: "green",
							},
							{
								from: "Colombo",
								to: "Galle",
								duration: "2 hrs",
								price: "LKR 300",
								color: "purple",
							},
							{
								from: "Colombo",
								to: "Jaffna",
								duration: "8 hrs",
								price: "LKR 900",
								color: "orange",
							},
						].map((route) => (
							<button
								key={route.to}
								onClick={() =>
									setSearch({
										...search,
										origin: route.from,
										destination: route.to,
									})
								}
								className="bg-white border-2 border-gray-100 hover:border-blue-400 rounded-2xl p-5 text-left transition hover:shadow-lg group"
							>
								<div className="flex items-center gap-1 mb-3">
									<span className="text-sm font-bold text-gray-800">
										{route.from}
									</span>
									<span className="text-gray-400 text-sm mx-1">→</span>
									<span className="text-sm font-bold text-blue-600">
										{route.to}
									</span>
								</div>
								<p className="text-gray-400 text-xs mb-1">⏱ {route.duration}</p>
								<p className="text-green-600 text-xs font-semibold">
									From {route.price}
								</p>
							</button>
						))}
					</div>
				</div>
			</div>

			{/* How It Works */}
			<div className="py-16 px-6 bg-white">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-12">
						<h3 className="text-3xl font-bold text-gray-800 mb-2">
							How It Works
						</h3>
						<p className="text-gray-500">Book your seat in 3 simple steps</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{[
							{
								step: "01",
								icon: "🔍",
								title: "Search Your Route",
								desc: "Enter your origin, destination and travel date to see all available buses.",
							},
							{
								step: "02",
								icon: "💺",
								title: "Choose Your Seat",
								desc: "Pick your preferred seat from our interactive seat map and confirm your booking.",
							},
							{
								step: "03",
								icon: "📱",
								title: "Get Your QR Ticket",
								desc: "Receive a QR-coded digital ticket instantly. Show it to the conductor for boarding.",
							},
						].map((step) => (
							<div key={step.step} className="relative text-center">
								<div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
									{step.icon}
								</div>
								<span className="absolute top-0 right-8 text-6xl font-extrabold text-gray-100 -z-10">
									{step.step}
								</span>
								<h4 className="text-lg font-bold text-gray-800 mb-2">
									{step.title}
								</h4>
								<p className="text-gray-500 text-sm leading-relaxed">
									{step.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Features */}
			<div className="py-16 px-6 bg-gray-50">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-12">
						<h3 className="text-3xl font-bold text-gray-800 mb-2">
							Everything You Need
						</h3>
						<p className="text-gray-500">
							Powerful features for passengers and operators
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[
							{
								icon: "🎫",
								title: "Easy Booking",
								desc: "Book seats online in minutes with our interactive seat map.",
							},
							{
								icon: "📍",
								title: "Real-Time Tracking",
								desc: "Track your bus live on GPS. Know exactly when it arrives.",
							},
							{
								icon: "📱",
								title: "SMS Notifications",
								desc: "Get instant SMS alerts for bookings and schedule changes.",
							},
							{
								icon: "🔄",
								title: "Easy Rescheduling",
								desc: "Change your travel date or seat anytime before departure.",
							},
							{
								icon: "🔍",
								title: "Lost & Found",
								desc: "Report lost items and get notified when they are found.",
							},
							{
								icon: "🔒",
								title: "Secure & Safe",
								desc: "Your data and payments are fully encrypted and protected.",
							},
						].map((feature) => (
							<div
								key={feature.title}
								className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-blue-200 transition group"
							>
								<div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-blue-100 transition">
									{feature.icon}
								</div>
								<h4 className="text-base font-bold text-gray-800 mb-2">
									{feature.title}
								</h4>
								<p className="text-gray-500 text-sm leading-relaxed">
									{feature.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Testimonials */}
			<div className="py-16 px-6 bg-white">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-12">
						<h3 className="text-3xl font-bold text-gray-800 mb-2">
							What Passengers Say
						</h3>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[
							{
								name: "Kamal Perera",
								route: "Colombo → Matara",
								text: "Finally a proper bus booking system for Sri Lanka! No more waiting at bus stands.",
								rating: "⭐⭐⭐⭐⭐",
							},
							{
								name: "Nimal Silva",
								route: "Colombo → Kandy",
								text: "The QR ticket system is so convenient. Conductor scanned it in seconds.",
								rating: "⭐⭐⭐⭐⭐",
							},
							{
								name: "Priya Fernando",
								route: "Colombo → Galle",
								text: "Real-time tracking is amazing. I knew exactly when the bus would arrive.",
								rating: "⭐⭐⭐⭐⭐",
							},
						].map((t) => (
							<div
								key={t.name}
								className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
							>
								<p className="text-sm mb-1">{t.rating}</p>
								<p className="text-gray-700 text-sm leading-relaxed mb-4">
									"{t.text}"
								</p>
								<div>
									<p className="font-bold text-gray-800 text-sm">{t.name}</p>
									<p className="text-gray-400 text-xs">{t.route}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* CTA */}
			<div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-20 px-6 text-center">
				<h3 className="text-4xl font-extrabold mb-4">
					Ready to Travel Smarter?
				</h3>
				<p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
					Join thousands of passengers already using HighwayLink across Sri
					Lanka.
				</p>
				<div className="flex justify-center gap-4 flex-wrap">
					<Link href="/register">
						<Button
							size="lg"
							className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-bold px-8 rounded-full"
						>
							Get Started Free
						</Button>
					</Link>
					<Link href="/login">
						<Button
							size="lg"
							variant="outline"
							className="border-white text-blue-600 hover:bg-blue-600 rounded-full px-8"
						>
							Login
						</Button>
					</Link>
				</div>
			</div>

			{/* Footer */}
			<footer className="bg-gray-900 text-gray-400 py-12 px-6">
				<div className="max-w-5xl mx-auto">
					<div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
						<div>
							<div className="flex items-center gap-2 mb-3">
								<span className="text-2xl">🚌</span>
								<span className="text-white font-bold text-lg">
									HighwayLink
								</span>
							</div>
							<p className="text-sm max-w-xs leading-relaxed">
								Sri Lanka's smartest highway bus management and booking
								platform.
							</p>
						</div>
						<div className="flex gap-12">
							<div>
								<p className="text-white font-semibold text-sm mb-3">
									Platform
								</p>
								<div className="space-y-2 text-sm">
									<Link
										href="/login"
										className="block hover:text-white transition"
									>
										Login
									</Link>
									<Link
										href="/register"
										className="block hover:text-white transition"
									>
										Register
									</Link>
									<Link
										href="/lostfound"
										className="block hover:text-white transition"
									>
										Lost & Found
									</Link>
								</div>
							</div>
							<div>
								<p className="text-white font-semibold text-sm mb-3">
									Dashboards
								</p>
								<div className="space-y-2 text-sm">
									<Link
										href="/dashboard/passenger"
										className="block hover:text-white transition"
									>
										Passenger
									</Link>
									<Link
										href="/dashboard/admin"
										className="block hover:text-white transition"
									>
										Admin
									</Link>
									<Link
										href="/dashboard/conductor"
										className="block hover:text-white transition"
									>
										Conductor
									</Link>
								</div>
							</div>
						</div>
					</div>
					<div className="border-t border-gray-800 pt-6 text-center text-sm">
						© 2025 HighwayLink. Smart Highway Bus Management System. All rights
						reserved.
					</div>
				</div>
			</footer>
		</div>
	);
}
