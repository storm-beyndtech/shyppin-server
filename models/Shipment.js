import mongoose from "mongoose";

const trackingEventSchema = new mongoose.Schema({
	timestamp: {
		type: Date,
		default: Date.now
	},
	location: {
		type: String,
		required: true
	},
	status: {
		type: String,
		required: true,
		enum: ["picked-up", "in-transit", "arrived", "out-for-delivery", "delivered", "delayed", "exception"]
	},
	description: {
		type: String,
		required: true
	}
});

const shipmentSchema = new mongoose.Schema({
	trackingNumber: {
		type: String,
		required: true,
		unique: true
	},
	sender: {
		name: { type: String, required: true },
		address: { type: String, required: true },
		city: { type: String, required: true },
		state: { type: String, required: true },
		zipCode: { type: String, required: true },
		country: { type: String, required: true, default: "US" },
		phone: { type: String },
		email: { type: String }
	},
	recipient: {
		name: { type: String, required: true },
		address: { type: String, required: true },
		city: { type: String, required: true },
		state: { type: String, required: true },
		zipCode: { type: String, required: true },
		country: { type: String, required: true, default: "US" },
		phone: { type: String },
		email: { type: String }
	},
	package: {
		weight: { type: Number, required: true }, // in pounds
		dimensions: {
			length: { type: Number, required: true }, // in inches
			width: { type: Number, required: true },
			height: { type: Number, required: true }
		},
		declaredValue: { type: Number, default: 0 }, // in USD
		description: { type: String, required: true },
		fragile: { type: Boolean, default: false },
		hazardous: { type: Boolean, default: false }
	},
	service: {
		type: { 
			type: String, 
			required: true,
			enum: ["standard", "express", "overnight", "international"]
		},
		cost: { type: Number, required: true },
		estimatedDelivery: { type: Date, required: true }
	},
	status: {
		type: String,
		required: true,
		enum: ["pending", "picked-up", "in-transit", "out-for-delivery", "delivered", "delayed", "exception"],
		default: "pending"
	},
	currentLocation: {
		type: String,
		default: ""
	},
	driver: {
		name: { type: String },
		vehicle: { type: String },
		phone: { type: String }
	},
	trackingEvents: [trackingEventSchema],
	notes: [{
		timestamp: { type: Date, default: Date.now },
		note: { type: String },
		addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
	}],
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
});

// Update the updatedAt field before saving
shipmentSchema.pre('save', function(next) {
	this.updatedAt = Date.now();
	next();
});

// Add index for faster tracking number queries
shipmentSchema.index({ trackingNumber: 1 });

const Shipment = mongoose.model("Shipment", shipmentSchema);

export default Shipment;