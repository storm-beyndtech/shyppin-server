import express from "express";
import Shipment from "../models/Shipment.js";
import { auth } from "../utils/middleware.js";

const router = express.Router();

// Get all shipments (admin only)
router.get("/", auth, async (req, res) => {
	try {
		const shipments = await Shipment.find().sort({ createdAt: -1 });
		res.json(shipments);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get shipment by tracking number
router.get("/track/:trackingNumber", async (req, res) => {
	try {
		const { trackingNumber } = req.params;
		const shipment = await Shipment.findOne({ trackingNumber });
		
		if (!shipment) {
			return res.status(404).json({ message: "Shipment not found" });
		}
		
		res.json(shipment);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Create new shipment (admin only)
router.post("/", auth, async (req, res) => {
	try {
		const shipmentData = req.body;
		
		// Generate tracking number
		const trackingNumber = `SHP${Date.now()}${Math.floor(Math.random() * 1000)}`;
		
		const shipment = new Shipment({
			...shipmentData,
			trackingNumber,
			createdBy: req.user._id
		});
		
		await shipment.save();
		res.status(201).json(shipment);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

// Update entire shipment (admin only)
router.put("/:id", auth, async (req, res) => {
	try {
		const { id } = req.params;
		const updateData = req.body;
		
		const shipment = await Shipment.findByIdAndUpdate(
			id,
			{ ...updateData, updatedAt: new Date() },
			{ new: true, runValidators: true }
		);
		
		if (!shipment) {
			return res.status(404).json({ message: "Shipment not found" });
		}
		
		res.json(shipment);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

// Update shipment status
router.put("/:id/status", auth, async (req, res) => {
	try {
		const { id } = req.params;
		const { status, location, description } = req.body;
		
		const shipment = await Shipment.findById(id);
		if (!shipment) {
			return res.status(404).json({ message: "Shipment not found" });
		}
		
		// Add tracking event
		const trackingEvent = {
			timestamp: new Date(),
			location,
			status,
			description
		};
		
		shipment.status = status;
		shipment.currentLocation = location;
		shipment.trackingEvents.push(trackingEvent);
		
		await shipment.save();
		res.json(shipment);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

// Delete shipment (admin only)
router.delete("/:id", auth, async (req, res) => {
	try {
		const { id } = req.params;
		const shipment = await Shipment.findByIdAndDelete(id);
		
		if (!shipment) {
			return res.status(404).json({ message: "Shipment not found" });
		}
		
		res.json({ message: "Shipment deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

export default router;