import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

export const auth = async (req, res, next) => {
	try {
		const token = req.header("x-auth-token");
		
		if (!token) {
			return res.status(401).json({ message: "No token, authorization denied" });
		}
		
		const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
		const user = await User.findById(decoded._id);
		
		if (!user) {
			return res.status(401).json({ message: "Token is not valid" });
		}
		
		req.user = user;
		next();
	} catch (error) {
		res.status(401).json({ message: "Token is not valid" });
	}
};

export const adminAuth = async (req, res, next) => {
	try {
		await auth(req, res, () => {
			if (req.user && req.user.isAdmin) {
				next();
			} else {
				res.status(403).json({ message: "Access denied. Admin privileges required." });
			}
		});
	} catch (error) {
		res.status(401).json({ message: "Token is not valid" });
	}
};