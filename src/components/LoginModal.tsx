"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginModalProps {
	isOpen: boolean;
	onClose: () => void;
	redirectTo?: string;
	message?: string;
}

export default function LoginModal({
	isOpen,
	onClose,
	redirectTo,
	message,
}: LoginModalProps) {
	const router = useRouter();
	const { login } = useAuth();
	const [formData, setFormData] = useState({ email: "", password: "" });
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	if (!isOpen) return null;

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
				login({
					email: data.user.email,
					name: data.user.fullName,
					role: data.user.role,
				});
				onClose();
				if (redirectTo) {
					router.push(redirectTo);
				} else {
					const role = data.user.role;
					if (role === "admin") router.push("/dashboard/admin");
					else if (role === "bus_owner") router.push("/dashboard/busowner");
					else if (role === "conductor") router.push("/dashboard/conductor");
					else if (role === "driver") router.push("/dashboard/driver");
					else if (role === "timekeeper") router.push("/dashboard/timekeeper");
					else router.push("/dashboard/passenger");
				}
			}
		} catch {
			setError("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 z-10">
				{/* Close Button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition text-xl"
				>
					✕
				</button>

				{/* Header */}
				<div className="text-center mb-6">
					<div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
						🔐
					</div>
					<h2 className="text-2xl font-extrabold text-gray-800 mb-1">
						Login Required
					</h2>
					{message && <p className="text-gray-500 text-sm">{message}</p>}
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
						<span>⚠️</span> {error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label className="text-gray-700 font-medium mb-1.5 block">
							Email Address
						</Label>
						<Input
							type="email"
							value={formData.email}
							onChange={(e) =>
								setFormData({ ...formData, email: e.target.value })
							}
							required
							placeholder="Enter your email"
							className="h-11"
							autoFocus
						/>
					</div>

					<div>
						<Label className="text-gray-700 font-medium mb-1.5 block">
							Password
						</Label>
						<Input
							type="password"
							value={formData.password}
							onChange={(e) =>
								setFormData({ ...formData, password: e.target.value })
							}
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
						{loading ? "Logging in..." : "Login to Book →"}
					</Button>
				</form>

				<div className="mt-6 pt-4 border-t border-gray-100 text-center space-y-2">
					<p className="text-gray-500 text-sm">
						Don't have an account?{" "}
						<button
							onClick={() => {
								onClose();
								router.push(
									`/register${
										redirectTo
											? `?redirect=${encodeURIComponent(redirectTo)}`
											: ""
									}`
								);
							}}
							className="text-blue-600 font-semibold hover:underline"
						>
							Register here
						</button>
					</p>
				</div>
			</div>
		</div>
	);
}
