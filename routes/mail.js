import express from "express";
import { adminAuth } from "../utils/middleware.js";
import { User } from "../models/user.js";
import { sendBulkEmail } from "../utils/mailer.js";

const router = express.Router();

// Admin route: Send email to specific users
router.post("/send", adminAuth, async (req, res) => {
	try {
		const { recipients, subject, message, sendToAll = false } = req.body;
		
		if (!subject || !message) {
			return res.status(400).json({ message: "Subject and message are required" });
		}
		
		let emailList = [];
		
		if (sendToAll) {
			// Send to all users except admins
			const users = await User.find({ isAdmin: false }, 'email firstName lastName');
			emailList = users.map(user => ({
				email: user.email,
				name: `${user.firstName} ${user.lastName}`
			}));
		} else {
			// Send to specific recipients
			if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
				return res.status(400).json({ message: "Recipients are required when not sending to all" });
			}
			
			// Validate recipient emails exist in database
			const users = await User.find({ 
				email: { $in: recipients },
				isAdmin: false 
			}, 'email firstName lastName');
			
			emailList = users.map(user => ({
				email: user.email,
				name: `${user.firstName} ${user.lastName}`
			}));
			
			// Check for invalid emails
			const validEmails = emailList.map(item => item.email);
			const invalidEmails = recipients.filter(email => !validEmails.includes(email));
			
			if (invalidEmails.length > 0) {
				return res.status(400).json({ 
					message: "Some email addresses are not valid customers",
					invalidEmails
				});
			}
		}
		
		if (emailList.length === 0) {
			return res.status(400).json({ message: "No valid recipients found" });
		}
		
		// Send emails
		const results = await sendBulkEmail(emailList, subject, message);
		
		res.json({
			message: `Email campaign sent successfully to ${emailList.length} recipients`,
			totalSent: emailList.length,
			results
		});
		
	} catch (error) {
		console.error("Mail send error:", error);
		res.status(500).json({ message: "Failed to send email campaign" });
	}
});

// Admin route: Get email templates
router.get("/templates", adminAuth, async (req, res) => {
	try {
		const templates = [
			{
				id: 1,
				name: "Welcome Email",
				subject: "Welcome to Shyppin - Your Global Freight Partner",
				message: `Dear {{name}},

Welcome to Shyppin! We're excited to have you as part of our global freight network.

Our services include:
- Fast and reliable air freight
- Cost-effective ocean shipping
- Ground transportation solutions
- Real-time tracking for all shipments

Get started by requesting a quote at our website or contact our support team.

Best regards,
The Shyppin Team`
			},
			{
				id: 2,
				name: "Service Update",
				subject: "Important Service Update - Shyppin",
				message: `Dear {{name}},

We wanted to inform you about some important updates to our services.

[Insert your service update information here]

If you have any questions, please don't hesitate to contact our support team.

Best regards,
The Shyppin Team`
			},
			{
				id: 3,
				name: "Promotional Offer",
				subject: "Special Freight Rates - Limited Time Offer",
				message: `Dear {{name}},

We're pleased to offer you special discounted rates on our freight services!

Limited time offer:
- 15% off air freight services
- 20% off ocean freight for bulk shipments
- Free tracking and insurance on all orders

Contact us today to take advantage of these great rates.

Best regards,
The Shyppin Team`
			}
		];
		
		res.json(templates);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Admin route: Get customer emails for campaigns
router.get("/customers", adminAuth, async (req, res) => {
	try {
		const customers = await User.find(
			{ isAdmin: false }, 
			'email firstName lastName createdAt'
		).sort({ createdAt: -1 });
		
		const emailList = customers.map(customer => ({
			email: customer.email,
			name: `${customer.firstName} ${customer.lastName}`,
			joinedAt: customer.createdAt
		}));
		
		res.json({
			total: emailList.length,
			customers: emailList
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

export default router;