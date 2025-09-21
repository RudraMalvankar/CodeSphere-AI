import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

// Helper: extract bearer token safely from headers/cookies
function extractToken(req) {
    // Priority: Authorization header > cookie
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && typeof authHeader === 'string') {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
            return parts[1];
        }
    }
    if (req.cookies && req.cookies.token && req.cookies.token.trim()) {
        return req.cookies.token.trim();
    }
    return null;
}

export const authUser = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            return res.status(401).json({ error: "Missing authentication token" });
        }

        // Check blacklist (logout / revoked)
        let isBlackListed = false;
        try {
            isBlackListed = await redisClient.get(token);
        } catch (redisErr) {
            console.warn('Redis not reachable for blacklist check:', redisErr.message);
        }
        if (isBlackListed) {
            res.cookie('token', '', { maxAge: 0 });
            return res.status(401).json({ error: "Token revoked" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (verifyErr) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Authentication middleware unexpected error:', error);
        res.status(401).json({ error: "Authentication failed" });
    }
};