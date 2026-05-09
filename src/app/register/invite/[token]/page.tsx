"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function InviteRegisterPage() {
	const { token } = useParams();
	const router = useRouter();

	const [invite, setInvite] = useState<{
		role: string;
		station: string | null;
		expiresAt: string;
	} | null>(null);
	const [inviteError, setInviteError] = useState("");
	const [validating, setValidating] = useState(true);

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

	useEffect(() => {
		validateInvite();
	}, [token]);

	const validateInvite = async () => {
		try {
			const res = await fetch(`/api/invites/validate?token=${token}`);
			const data = await res.json();
			if (!res.ok) {
				setInviteError(data.error || "Invalid invite link");
			} else {
				setInvite(data);
			}
		} catch {
			setInviteError("Something went wrong");
		} finally {
			setValidating(false);
		}
	};

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
					token,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Registration failed");
			} else {
				router.push("/login?registered=true");
			}
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const getRoleConfig = (role: string) => {
		switch (role) {
			case "conductor":
				return {
					icon: "🎫",
					label: "Conductor",
					color: "bg-blue-50 border-blue-200 text-blue-700",
				};
			case "driver":
				return {
					icon: "🚗",
					label: "Driver",
					color: "bg-green-50 border-green-200 text-green-700",
				};
			case "timekeeper":
				return {
					icon: "⏱️",
					label: "Timekeeper",
					color: "bg-orange-50 border-orange-200 text-orange-700",
				};
			case "bus_owner":
				return {
					icon: "🚌",
					label: "Bus Owner",
					color: "bg-purple-50 border-purple-200 text-purple-700",
				};
			default:
				return {
					icon: "👤",
					label: role,
					color: "bg-gray-50 border-gray-200 text-gray-700",
				};
		}
	};

	if (validating) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="text-4xl mb-3 animate-pulse">🔗</div>
					<p className="text-gray-500">Validating invite link...</p>
				</div>
			</div>
		);
	}

	if (inviteError) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
				<Card className="max-w-md w-full border-0 shadow-sm">
					<CardContent className="p-8 text-center">
						<div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
							❌
						</div>
						<h2 className="text-xl font-extrabold text-gray-800 mb-2">
							Invalid Invite Link
						</h2>
						<p className="text-red-500 text-sm mb-6">{inviteError}</p>
						<Link href="/login">
							<Button className="rounded-full px-6">Go to Login</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	const roleConfig = getRoleConfig(invite?.role || "");

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			{/* Navbar */}
			<nav className="bg-white border-b px-8 py-4 flex justify-between items-center">
				<Link href="/" className="flex items-center gap-2">
					<span className="text-2xl">🚌</span>
					<span className="text-xl font-bold text-blue-600">HighwayLink</span>
				</Link>
			</nav>

			<div className="flex-1 flex items-center justify-center px-4 py-12">
				<div className="w-full max-w-md">
					{/* Header */}
					<div className="text-center mb-8">
						<div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
							🔗
						</div>
						<h1 className="text-3xl font-extrabold text-gray-800 mb-2">
							You've Been Invited!
						</h1>
						<p className="text-gray-500 text-sm">
							Complete your registration to join HighwayLink
						</p>
					</div>

					{/* Role Badge */}
					<div
						className={`border rounded-2xl p-4 mb-6 flex items-center gap-4 ${roleConfig.color}`}
					>
						<span className="text-3xl">{roleConfig.icon}</span>
						<div>
							<p className="font-bold">
								You're registering as a {roleConfig.label}
							</p>
							{invite?.station && (
								<p className="text-sm opacity-75">
									Station: <strong>{invite.station}</strong>
								</p>
							)}
							<p className="text-xs opacity-60 mt-0.5">
								Link expires:{" "}
								{new Date(invite?.expiresAt || "").toLocaleDateString("en-US", {
									month: "long",
									day: "numeric",
									year: "numeric",
								})}
							</p>
						</div>
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
									{loading ? "Creating account..." : "Complete Registration →"}
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
				</div>
			</div>
		</div>
	);
}
