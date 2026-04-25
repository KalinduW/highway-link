"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({ email: "", password: "" });
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Login failed");
			} else {
				localStorage.setItem("userEmail", data.user.email);
				localStorage.setItem("userName", data.user.fullName);

				const role = data.user.role;
				if (role === "admin" || role === "bus_owner") {
					router.push("/dashboard/admin");
				} else if (role === "conductor") {
					router.push("/dashboard/conductor");
				} else if (role === "driver") {
					router.push("/dashboard/driver");
				} else {
					router.push("/dashboard/passenger");
				}
			}
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			{/* Navbar */}
			<nav className="bg-white border-b px-8 py-4 flex justify-between items-center">
				<Link href="/" className="flex items-center gap-2">
					<span className="text-2xl">🚌</span>
					<span className="text-xl font-bold text-blue-600">HighwayLink</span>
				</Link>
				<Link href="/register">
					<Button variant="outline" size="sm" className="rounded-full px-5">
						Create Account
					</Button>
				</Link>
			</nav>

			{/* Main */}
			<div className="flex-1 flex items-center justify-center px-4 py-12">
				<div className="w-full max-w-md">
					{/* Header */}
					<div className="text-center mb-8">
						<div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
							🔐
						</div>
						<h1 className="text-3xl font-extrabold text-gray-800 mb-2">
							Welcome back
						</h1>
						<p className="text-gray-500">Login to manage your bookings</p>
					</div>

					<Card className="shadow-lg border-0">
						<CardContent className="p-8">
							{error && (
								<div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm flex items-center gap-2">
									<span>⚠️</span> {error}
								</div>
							)}

							<form onSubmit={handleSubmit} className="space-y-5">
								<div>
									<Label className="text-gray-700 font-medium mb-1.5 block">
										Email Address
									</Label>
									<Input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										required
										placeholder="Enter your email"
										className="h-11"
									/>
								</div>

								<div>
									<div className="flex justify-between items-center mb-1.5">
										<Label className="text-gray-700 font-medium">
											Password
										</Label>
									</div>
									<Input
										type="password"
										name="password"
										value={formData.password}
										onChange={handleChange}
										required
										placeholder="Enter your password"
										className="h-11"
									/>
								</div>

								<Button
									type="submit"
									disabled={loading}
									className="w-full h-11 text-base font-semibold rounded-xl"
								>
									{loading ? "Logging in..." : "Login →"}
								</Button>
							</form>

							<div className="mt-6 pt-6 border-t border-gray-100 text-center">
								<p className="text-gray-500 text-sm">
									Don't have an account?{" "}
									<Link
										href="/register"
										className="text-blue-600 font-semibold hover:underline"
									>
										Register here
									</Link>
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Role Info */}
					<div className="mt-6 grid grid-cols-2 gap-3">
						{[
							{ icon: "👤", label: "Passenger", desc: "Book & track trips" },
							{ icon: "🚌", label: "Bus Owner", desc: "Manage your fleet" },
							{ icon: "🎫", label: "Conductor", desc: "Verify tickets" },
							{ icon: "🚗", label: "Driver", desc: "View your trips" },
						].map((role) => (
							<div
								key={role.label}
								className="bg-white border border-gray-100 rounded-xl p-3 text-center"
							>
								<p className="text-lg mb-0.5">{role.icon}</p>
								<p className="text-xs font-semibold text-gray-700">
									{role.label}
								</p>
								<p className="text-xs text-gray-400">{role.desc}</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
