"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RegisterContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect");
	const [formData, setFormData] = useState({
		fullName: "",
		nic: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (formData.password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		setLoading(true);

		try {
			const res = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					fullName: formData.fullName,
					nic: formData.nic,
					email: formData.email,
					phone: formData.phone,
					password: formData.password,
					role: "passenger",
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Registration failed");
			} else {
				router.push(
					`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`
				);
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
				<Link href="/login">
					<Button variant="outline" size="sm" className="rounded-full px-5">
						Login
					</Button>
				</Link>
			</nav>

			{/* Main */}
			<div className="flex-1 flex items-center justify-center px-4 py-12">
				<div className="w-full max-w-md">
					{/* Header */}
					<div className="text-center mb-8">
						<div className="w-16 h-16 bg-white border-2 border-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
							👤
						</div>
						<h1 className="text-3xl font-extrabold text-gray-800 mb-2">
							Create your account
						</h1>
						<p className="text-gray-500">
							Join thousands of passengers on HighwayLink
						</p>
					</div>

					<Card className="shadow-lg border-0">
						<CardContent className="p-8">
							{error && (
								<div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm flex items-center gap-2">
									<span>⚠️</span> {error}
								</div>
							)}

							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<Label className="text-gray-700 font-medium mb-1.5 block">
										Full Name
									</Label>
									<Input
										type="text"
										name="fullName"
										value={formData.fullName}
										onChange={handleChange}
										required
										placeholder="Enter your full name"
										className="h-11"
									/>
								</div>

								<div>
									<Label className="text-gray-700 font-medium mb-1.5 block">
										NIC Number
									</Label>
									<Input
										type="text"
										name="nic"
										value={formData.nic}
										onChange={handleChange}
										required
										placeholder="Enter your NIC number"
										className="h-11"
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label className="text-gray-700 font-medium mb-1.5 block">
											Email
										</Label>
										<Input
											type="email"
											name="email"
											value={formData.email}
											onChange={handleChange}
											required
											placeholder="Your email"
											className="h-11"
										/>
									</div>
									<div>
										<Label className="text-gray-700 font-medium mb-1.5 block">
											Phone
										</Label>
										<Input
											type="tel"
											name="phone"
											value={formData.phone}
											onChange={handleChange}
											required
											placeholder="07X XXX XXXX"
											className="h-11"
										/>
									</div>
								</div>

								<div>
									<Label className="text-gray-700 font-medium mb-1.5 block">
										Password
									</Label>
									<Input
										type="password"
										name="password"
										value={formData.password}
										onChange={handleChange}
										required
										placeholder="Create a password"
										className="h-11"
									/>
								</div>

								<div>
									<Label className="text-gray-700 font-medium mb-1.5 block">
										Confirm Password
									</Label>
									<Input
										type="password"
										name="confirmPassword"
										value={formData.confirmPassword}
										onChange={handleChange}
										required
										placeholder="Confirm your password"
										className="h-11"
									/>
								</div>

								<Button
									type="submit"
									disabled={loading}
									className="w-full h-11 text-base font-semibold rounded-xl mt-2"
								>
									{loading ? "Creating account..." : "Create Account →"}
								</Button>
							</form>

							<div className="mt-6 pt-6 border-t border-gray-100 text-center">
								<p className="text-gray-500 text-sm">
									Already have an account?{" "}
									<Link
										href="/login"
										className="text-blue-600 font-semibold hover:underline"
									>
										Login here
									</Link>
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Benefits */}
					<div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">
						<p className="text-sm font-semibold text-blue-700 mb-3">
							✅ What you get with HighwayLink
						</p>
						<div className="space-y-2">
							{[
								"Book seats on any highway bus instantly",
								"Get QR-coded digital tickets",
								"Track your bus in real time",
								"Reschedule or cancel anytime",
							].map((benefit) => (
								<div
									key={benefit}
									className="flex items-center gap-2 text-sm text-blue-600"
								>
									<span className="text-blue-400">→</span>
									{benefit}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function RegisterPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-gray-50 flex items-center justify-center">
					Loading...
				</div>
			}
		>
			<RegisterContent />
		</Suspense>
	);
}
