import express from "express";
import Quote from "../models/Quote.js";
import { auth, adminAuth } from "../utils/middleware.js";

const router = express.Router();

// Public route: Submit quote request
router.post("/request", async (req, res) => {
	try {
		const quoteData = req.body;
		
		// Generate quote number
		const quoteNumber = `QTE${Date.now()}${Math.floor(Math.random() * 1000)}`;
		
		const quote = new Quote({
			...quoteData,
			quoteNumber
		});
		
		await quote.save();
		res.status(201).json({ 
			message: "Quote request submitted successfully",
			quoteNumber: quote.quoteNumber,
			quote
		});
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

// Public route: Get quote by quote number
router.get("/track/:quoteNumber", async (req, res) => {
	try {
		const { quoteNumber } = req.params;
		const quote = await Quote.findOne({ quoteNumber });
		
		if (!quote) {
			return res.status(404).json({ message: "Quote not found" });
		}
		
		res.json(quote);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Admin route: Get all quotes
router.get("/", adminAuth, async (req, res) => {
	try {
		const { status, page = 1, limit = 20 } = req.query;
		const query = status ? { status } : {};
		
		const quotes = await Quote.find(query)
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.populate('quotedBy', 'firstName lastName email');
			
		const total = await Quote.countDocuments(query);
		
		res.json({
			quotes,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / limit)
			}
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Admin route: Get quote by ID
router.get("/:id", adminAuth, async (req, res) => {
	try {
		const quote = await Quote.findById(req.params.id)
			.populate('quotedBy', 'firstName lastName email');
		
		if (!quote) {
			return res.status(404).json({ message: "Quote not found" });
		}
		
		res.json(quote);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Admin route: Update quote (provide pricing)
router.put("/:id", adminAuth, async (req, res) => {
	try {
		const { id } = req.params;
		const { quotedPrice, estimatedDelivery, status, adminNotes } = req.body;
		
		const quote = await Quote.findById(id);
		if (!quote) {
			return res.status(404).json({ message: "Quote not found" });
		}
		
		// Update quote fields
		if (quotedPrice !== undefined) quote.quotedPrice = quotedPrice;
		if (estimatedDelivery) quote.estimatedDelivery = new Date(estimatedDelivery);
		if (status) quote.status = status;
		if (adminNotes !== undefined) quote.adminNotes = adminNotes;
		
		// Set quotedBy and quotedAt when status changes to 'quoted'
		if (status === 'quoted' && quote.status !== 'quoted') {
			quote.quotedBy = req.user._id;
			quote.quotedAt = new Date();
		}
		
		await quote.save();
		await quote.populate('quotedBy', 'firstName lastName email');
		
		res.json(quote);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

// Admin route: Delete quote
router.delete("/:id", adminAuth, async (req, res) => {
	try {
		const { id } = req.params;
		const quote = await Quote.findByIdAndDelete(id);
		
		if (!quote) {
			return res.status(404).json({ message: "Quote not found" });
		}
		
		res.json({ message: "Quote deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Admin route: Get quote statistics
router.get("/stats/overview", adminAuth, async (req, res) => {
	try {
		const stats = await Quote.aggregate([
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 }
				}
			}
		]);
		
		const total = await Quote.countDocuments();
		const thisMonth = await Quote.countDocuments({
			createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
		});
		
		res.json({
			total,
			thisMonth,
			byStatus: stats.reduce((acc, item) => {
				acc[item._id] = item.count;
				return acc;
			}, {})
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

export default router;