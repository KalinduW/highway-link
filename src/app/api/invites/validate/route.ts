import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inviteLinks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const token = searchParams.get("token");

		if (!token) {
			return NextResponse.json({ error: "Token is required" }, { status: 400 });
		}

		const invite = await db
			.select()
			.from(inviteLinks)
			.where(eq(inviteLinks.token, token));

		if (invite.length === 0) {
			return NextResponse.json(
				{ error: "Invalid invite link" },
				{ status: 404 }
			);
		}

		const inviteData = invite[0];

		// Check if already used
		if (inviteData.isUsed === 1) {
			return NextResponse.json(
				{ error: "This invite link has already been used" },
				{ status: 400 }
			);
		}

		// Check if expired
		if (new Date() > new Date(inviteData.expiresAt)) {
			return NextResponse.json(
				{ error: "This invite link has expired" },
				{ status: 400 }
			);
		}

		return NextResponse.json({
			valid: true,
			role: inviteData.role,
			station: inviteData.station,
			expiresAt: inviteData.expiresAt,
		});
	} catch (error) {
		console.error("Validate invite error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
