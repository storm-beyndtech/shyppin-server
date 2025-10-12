import express from "express";
import { sendContactEmail } from "../utils/mailer.js";

const router = express.Router();

// Public route: Submit contact form
router.post("/", async (req, res) => {
	try {
		const { name, email, phone, subject, message } = req.body;
		
		if (!name || !email || !subject || !message) {
			return res.status(400).json({ message: "Name, email, subject, and message are required" });
		}

		// Send contact email to admin
		const emailResult = await sendContactEmail({
			name,
			email,
			phone: phone || 'Not provided',
			subject,
			message
		});

		if (emailResult.success) {
			res.json({ 
				message: "Contact form submitted successfully. We'll get back to you within 24 hours.",
				success: true
			});
		} else {
			res.status(500).json({ 
				message: "Failed to send message. Please try again later.",
				success: false
			});
		}
	} catch (error) {
		console.error("Contact form error:", error);
		res.status(500).json({ message: "Internal server error" });
	}
});

export default router;