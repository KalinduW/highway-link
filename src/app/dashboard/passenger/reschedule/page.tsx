"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Schedule {
	scheduleId: string;
	departureTime: string;
	arrivalTime: string;
	fare: string;
	origin: string;
	destination: string;
	busType: string;
	licensePlate: string;
}

function RescheduleContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const bookingId = searchParams.get("bookingId");

	const [schedules, setSchedules] = useState<Schedule[]>([]);
	const [loading, setLoading] = useState(true);
	const [processing, setProcessing] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchSchedules = async () => {
			try {
				const res = await fetch("/api/passenger/schedules");
				const data = await res.json();
				if (res.ok) {
					setSchedules(data.schedules);
				}
			} catch {
				setError("Failed to load schedules");
			} finally {
				setLoading(false);
			}
		};
		fetchSchedules();
	}, []);

	const handleReschedule = async (newScheduleId: string) => {
		setProcessing(true);
		setError("");
		setMessage("");

		try {
			const res = await fetch("/api/passenger/reschedule", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ bookingId, newScheduleId }),
			});
			const data = await res.json();
			if (!res.ok) {
				setError(data.error || "Failed to reschedule");
			} else {
				setMessage("Booking rescheduled successfully! Redirecting...");
				setTimeout(() => router.push("/dashboard/passenger"), 2000);
			}
		} catch {
			setError("Something went wrong");
		} finally {
			setProcessing(false);
		}
	};

	const formatTime = (dateStr: string) => {
		return new Date(dateStr).toLocaleString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="max-w-2xl mx-auto px-6 py-10">
			<div className="mb-8">
				<h1 className="text-2xl font-bold text-gray-800">Reschedule Booking</h1>
				<p className="text-gray-500 text-sm">
					Select a new schedule for your booking
				</p>
			</div>

			{message && (
				<div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 text-sm font-medium">
					{message}
				</div>
			)}

			{error && (
				<div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
					{error}
				</div>
			)}

			{loading && (
				<p className="text-center text-gray-500 py-10">Loading schedules...</p>
			)}

			{!loading && schedules.length === 0 && (
				<Card>
					<CardContent className="py-10 text-center">
						<p className="text-gray-500">No available schedules found.</p>
					</CardContent>
				</Card>
			)}

			<div className="space-y-4">
				{schedules.map((schedule) => (
					<Card key={schedule.scheduleId}>
						<CardContent className="pt-6">
							<div className="flex justify-between items-start">
								<div>
									<p className="font-semibold text-gray-800 mb-1">
										{schedule.origin} → {schedule.destination}
									</p>
									<p className="text-gray-500 text-sm mb-1">
										🕐 {formatTime(schedule.departureTime)}
									</p>
									<p className="text-gray-500 text-sm mb-2">
										🚌 {schedule.busType} — {schedule.licensePlate}
									</p>
									<p className="text-blue-600 font-bold">LKR {schedule.fare}</p>
								</div>
								<Button
									onClick={() => handleReschedule(schedule.scheduleId)}
									disabled={processing}
									size="sm"
								>
									Select
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

export default function ReschedulePage() {
	const router = useRouter();
	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
				<Link href="/" className="text-2xl font-bold text-blue-600">
					HighwayLink
				</Link>
				<Button variant="outline" size="sm" onClick={() => router.back()}>
					← Back
				</Button>
			</nav>
			<Suspense
				fallback={
					<div className="text-center py-20 text-gray-500">Loading...</div>
				}
			>
				<RescheduleContent />
			</Suspense>
		</div>
	);
}
