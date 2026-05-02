import {
	pgTable,
	uuid,
	text,
	timestamp,
	pgEnum,
	integer,
	decimal,
} from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", [
	"passenger",
	"conductor",
	"driver",
	"bus_owner",
	"admin",
]);
export const busTypeEnum = pgEnum("bus_type", ["AC", "non_AC", "luxury"]);
export const seatTypeEnum = pgEnum("seat_type", ["window", "aisle", "middle"]);
export const seatStatusEnum = pgEnum("seat_status", ["available", "booked"]);
export const bookingStatusEnum = pgEnum("booking_status", [
	"pending",
	"confirmed",
	"cancelled",
	"rescheduled",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
	"pending",
	"paid",
	"failed",
	"refunded",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
	"card",
	"cash",
	"online",
]);
export const scheduleStatusEnum = pgEnum("schedule_status", [
	"scheduled",
	"active",
	"completed",
	"cancelled",
]);
export const lostFoundStatusEnum = pgEnum("lost_found_status", [
	"reported",
	"found",
	"claimed",
]);

// Users table
export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	fullName: text("full_name").notNull(),
	nic: text("nic").notNull(),
	email: text("email").notNull().unique(),
	phone: text("phone").notNull(),
	passwordHash: text("password_hash").notNull(),
	role: roleEnum("role").notNull().default("passenger"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	deletedAt: timestamp("deleted_at"),
});

// Address table
export const addresses = pgTable("addresses", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id")
		.references(() => users.id)
		.notNull(),
	address: text("address"),
	city: text("city"),
	district: text("district"),
	province: text("province"),
	postalCode: text("postal_code"),
});

// Bus table
export const buses = pgTable("buses", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id")
		.references(() => users.id)
		.notNull(),
	licensePlate: text("license_plate").notNull().unique(),
	busType: busTypeEnum("bus_type").notNull(),
	totalSeats: integer("total_seats").notNull(),
	totalMileage: integer("total_mileage").notNull().default(0),
	createdAt: timestamp("created_at").defaultNow(),
});

// Seat table
export const seats = pgTable("seats", {
	id: uuid("id").defaultRandom().primaryKey(),
	busId: uuid("bus_id")
		.references(() => buses.id)
		.notNull(),
	seatNumber: text("seat_number").notNull(),
	seatType: seatTypeEnum("seat_type").notNull(),
	status: seatStatusEnum("status").notNull().default("available"),
});

// Route table
export const routes = pgTable("routes", {
	id: uuid("id").defaultRandom().primaryKey(),
	origin: text("origin").notNull(),
	destination: text("destination").notNull(),
	distance: text("distance"),
	duration: text("duration"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Schedule table
export const schedules = pgTable("schedules", {
	id: uuid("id").defaultRandom().primaryKey(),
	busId: uuid("bus_id")
		.references(() => buses.id)
		.notNull(),
	routeId: uuid("route_id")
		.references(() => routes.id)
		.notNull(),
	userId: uuid("user_id")
		.references(() => users.id)
		.notNull(),
	conductorId: uuid("conductor_id").references(() => users.id),
	departureTime: timestamp("departure_time").notNull(),
	arrivalTime: timestamp("arrival_time").notNull(),
	fare: text("fare").notNull(),
	status: scheduleStatusEnum("status").notNull().default("scheduled"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Booking table
export const bookings = pgTable("bookings", {
	id: uuid("id").defaultRandom().primaryKey(),
	passengerId: uuid("passenger_id")
		.references(() => users.id)
		.notNull(),
	scheduleId: uuid("schedule_id")
		.references(() => schedules.id)
		.notNull(),
	seatId: uuid("seat_id")
		.references(() => seats.id)
		.notNull(),
	paymentId: uuid("payment_id"),
	qrCode: text("qr_code"),
	bookingStatus: bookingStatusEnum("booking_status")
		.notNull()
		.default("pending"),
	bookingTime: timestamp("booking_time").defaultNow(),
	createdAt: timestamp("created_at").defaultNow(),
});

// Payment table
export const payments = pgTable("payments", {
	id: uuid("id").defaultRandom().primaryKey(),
	bookingId: uuid("booking_id")
		.references(() => bookings.id)
		.notNull(),
	userId: uuid("user_id")
		.references(() => users.id)
		.notNull(),
	amount: text("amount").notNull(),
	transactionId: text("transaction_id"),
	paymentStatus: paymentStatusEnum("payment_status")
		.notNull()
		.default("pending"),
	paymentMethod: paymentMethodEnum("payment_method").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Lost and Found table
export const lostFoundItems = pgTable("lost_found_items", {
	id: uuid("id").defaultRandom().primaryKey(),
	description: text("description").notNull(),
	reportedBy: uuid("reported_by").references(() => users.id),
	foundLocation: text("found_location"),
	status: lostFoundStatusEnum("status").notNull().default("reported"),
	contactInfo: text("contact_info"),
	reportedAt: timestamp("reported_at").defaultNow(),
});

// Notification table
export const notifications = pgTable("notifications", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id")
		.references(() => users.id)
		.notNull(),
	message: text("message").notNull(),
	channel: text("channel").notNull(),
	sentAt: timestamp("sent_at").defaultNow(),
	status: text("status").notNull().default("sent"),
});
