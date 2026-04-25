import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lostFoundItems, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
	try {
		const items = await db
			.select({
				id: lostFoundItems.id,
				description: lostFoundItems.description,
				foundLocation: lostFoundItems.foundLocation,
				status: lostFoundItems.status,
				contactInfo: lostFoundItems.contactInfo,
				reportedAt: lostFoundItems.reportedAt,
				reportedBy: users.fullName,
			})
			.from(lostFoundItems)
			.leftJoin(users, eq(lostFoundItems.reportedBy, users.id));

		return NextResponse.json({ items });
	} catch (error) {
		console.error("Lost found error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const { description, foundLocation, contactInfo, email } = await req.json();

		if (!description || !contactInfo) {
			return NextResponse.json(
				{ error: "Description and contact info are required" },
				{ status: 400 }
			);
		}

		let reportedById = null;

		if (email) {
			const user = await db.select().from(users).where(eq(users.email, email));
			if (user.length > 0) reportedById = user[0].id;
		}

		const newItem = await db
			.insert(lostFoundItems)
			.values({
				description,
				foundLocation,
				contactInfo,
				reportedBy: reportedById,
				status: "reported",
			})
			.returning();

		return NextResponse.json(
			{ message: "Item reported successfully", item: newItem[0] },
			{ status: 201 }
		);
	} catch (error) {
		console.error("Report item error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function PATCH(req: NextRequest) {
	try {
		const { itemId, status } = await req.json();

		if (!itemId || !status) {
			return NextResponse.json(
				{ error: "Item ID and status are required" },
				{ status: 400 }
			);
		}

		const updatedItem = await db
			.update(lostFoundItems)
			.set({ status })
			.where(eq(lostFoundItems.id, itemId))
			.returning();

		return NextResponse.json({
			message: "Item status updated successfully",
			item: updatedItem[0],
		});
	} catch (error) {
		console.error("Update item error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
