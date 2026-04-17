"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
				// Redirect based on role
				const role = data.user.role;
				if (role === "admin" || role === "bus_owner") {
					router.push("/dashboard/admin");
				} else if (role === "conductor") {
					router.push("/dashboard/conductor");
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
		<div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
			<div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
				<h2 className="text-3xl font-bold text-center text-blue-600 mb-2">
					HighwayLink
				</h2>
				<p className="text-center text-gray-500 mb-6">Login to your account</p>

				{error && (
					<div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Email Address
						</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Enter your email"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Password
						</label>
						<input
							type="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							required
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Enter your password"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
					>
						{loading ? "Logging in..." : "Login"}
					</button>
				</form>

				<p className="text-center text-sm text-gray-500 mt-4">
					Don't have an account?{" "}
					<Link href="/register" className="text-blue-600 hover:underline">
						Register here
					</Link>
				</p>
			</div>
		</div>
	);
}
