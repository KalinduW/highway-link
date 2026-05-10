import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "HighwayLink - Smart Highway Bus Management System",
	description:
		"Book seats, track buses in real time, and travel with confidence.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<AuthProvider>{children}</AuthProvider>
			</body>
		</html>
	);
}
