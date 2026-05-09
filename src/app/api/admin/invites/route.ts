import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inviteLinks, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function GET() {
	try {
		const allInvites = await db
			.select({
				id: inviteLinks.id,
				token: inviteLinks.token,
				role: inviteLinks.role,
				station: inviteLinks.station,
				isUsed: inviteLinks.isUsed,
				expiresAt: inviteLinks.expiresAt,
				createdAt: inviteLinks.createdAt,
				createdByName: users.fullName,
			})
			.from(inviteLinks)
			.innerJoin(users, eq(inviteLinks.createdBy, users.id));

		return NextResponse.json({ invites: allInvites });
	} catch (error) {
		console.error("Get invites error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const { role, station, adminEmail } = await req.json();

		if (!role || !adminEmail) {
			return NextResponse.json(
				{ error: "Role and admin email are required" },
				{ status: 400 }
			);
		}

		if (role === "timekeeper" && !station) {
			return NextResponse.json(
				{ error: "Station is required for timekeepers" },
				{ status: 400 }
			);
		}

		// Get admin user
		const admin = await db
			.select()
			.from(users)
			.where(eq(users.email, adminEmail));

		if (admin.length === 0) {
			return NextResponse.json({ error: "Admin not found" }, { status: 404 });
		}

		// Generate unique token
		const token = crypto.randomBytes(32).toString("hex");

		// Set expiry to 7 days from now
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7);

		const newInvite = await db
			.insert(inviteLinks)
			.values({
				token,
				role,
				station: station || null,
				createdBy: admin[0].id,
				expiresAt,
			})
			.returning();

		return NextResponse.json({
			message: "Invite link created successfully",
			invite: newInvite[0],
			link: `${
				process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
			}/register/invite/${token}`,
		});
	} catch (error) {
		console.error("Create invite error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const inviteId = searchParams.get("inviteId");

		if (!inviteId) {
			return NextResponse.json(
				{ error: "Invite ID is required" },
				{ status: 400 }
			);
		}

		await db.delete(inviteLinks).where(eq(inviteLinks.id, inviteId));

		return NextResponse.json({ message: "Invite deleted successfully" });
	} catch (error) {
		console.error("Delete invite error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
