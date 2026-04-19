import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
	try {
		const allUsers = await db
			.select({
				id: users.id,
				fullName: users.fullName,
				email: users.email,
				phone: users.phone,
				nic: users.nic,
				role: users.role,
				createdAt: users.createdAt,
			})
			.from(users);

		return NextResponse.json({ users: allUsers });
	} catch (error) {
		console.error("Users error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function PATCH(req: NextRequest) {
	try {
		const { userId, role } = await req.json();

		if (!userId || !role) {
			return NextResponse.json(
				{ error: "User ID and role are required" },
				{ status: 400 }
			);
		}

		const updatedUser = await db
			.update(users)
			.set({ role })
			.where(eq(users.id, userId))
			.returning();

		return NextResponse.json({
			message: "User role updated successfully",
			user: updatedUser[0],
		});
	} catch (error) {
		console.error("Update user error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		await db
			.update(users)
			.set({ deletedAt: new Date() })
			.where(eq(users.id, userId));

		return NextResponse.json({
			message: "User deactivated successfully",
		});
	} catch (error) {
		console.error("Delete user error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
