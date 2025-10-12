import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema({
	// Customer Information
	customer: {
		name: { type: String, required: true },
		email: { type: String, required: true },
		phone: { type: String },
		company: { type: String }
	},
	
	// Origin Information
	origin: {
		address: { type: String, required: true },
		city: { type: String, required: true },
		state: { type: String, required: true },
		zipCode: { type: String, required: true },
		country: { type: String, required: true, default: "US" }
	},
	
	// Destination Information
	destination: {
		address: { type: String, required: true },
		city: { type: String, required: true },
		state: { type: String, required: true },
		zipCode: { type: String, required: true },
		country: { type: String, required: true, default: "US" }
	},
	
	// Package Information
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
	
	// Service Requirements
	serviceType: {
		type: String,
		required: true,
		enum: ["air", "ocean", "ground", "express"]
	},
	
	urgency: {
		type: String,
		required: true,
		enum: ["standard", "urgent", "asap"]
	},
	
	preferredDeliveryDate: {
		type: Date
	},
	
	// Quote Status
	status: {
		type: String,
		required: true,
		enum: ["pending", "quoted", "accepted", "declined", "expired"],
		default: "pending"
	},
	
	// Quote Details (filled by admin)
	quotedPrice: {
		type: Number,
		default: 0
	},
	
	estimatedDelivery: {
		type: Date
	},
	
	quotedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	
	quotedAt: {
		type: Date
	},
	
	// Additional Information
	specialInstructions: {
		type: String,
		default: ""
	},
	
	adminNotes: {
		type: String,
		default: ""
	},
	
	// Tracking
	quoteNumber: {
		type: String,
		unique: true,
		required: true
	},
	
	createdAt: {
		type: Date,
		default: Date.now
	},
	
	updatedAt: {
		type: Date,
		default: Date.now
	},
	
	expiresAt: {
		type: Date,
		default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from creation
	}
});

// Update the updatedAt field before saving
quoteSchema.pre('save', function(next) {
	this.updatedAt = Date.now();
	next();
});

// Add index for faster quote number queries
quoteSchema.index({ quoteNumber: 1 });
quoteSchema.index({ "customer.email": 1 });
quoteSchema.index({ status: 1 });

const Quote = mongoose.model("Quote", quoteSchema);

export default Quote;