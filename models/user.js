import mongoose from "mongoose";
import jwt from "jsonwebtoken";

export const userSchema = new mongoose.Schema({
	firstName: { type: String, maxLength: 30, required: true },
	lastName: { type: String, maxLength: 30, required: true },
	fullName: {
		type: String,
		maxLength: 60,
		default: "",
	},
	username: {
		type: String,
		required: true,
		minLength: 3,
		maxLength: 20,
	},
	email: {
		type: String,
		required: true,
		minLength: 5,
		maxLength: 225,
	},
	phone: {
		type: String,
		maxLength: 15,
		default: "",
	},
	dob: { type: String, default: "" },
	streetAddress: { type: String, maxLength: 100, default: "" },
	city: {
		type: String,
		maxLength: 50,
		default: "",
	},
	state: {
		type: String,
		maxLength: 50,
		default: "",
	},
	zipCode: {
		type: String,
		maxLength: 50,
		default: "",
	},
	country: {
		type: String,
		maxLength: 50,
		default: "United States",
	},

	password: {
		type: String,
		required: true,
		minLength: 5,
		maxLength: 1000,
	},
	profileImage: {
		type: String,
		default: "",
		maxLength: 500,
	},
	isAdmin: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

userSchema.methods.genAuthToken = function () {
	return jwt.sign(
		{ _id: this._id, username: this.username, isAdmin: this.isAdmin },
		process.env.JWT_PRIVATE_KEY,
	);
};

userSchema.pre("save", function (next) {
	this.fullName = `${this.firstName && this.firstName} ${this.lastName && this.lastName}`;
	next();
});

export const User = mongoose.model("User", userSchema);
