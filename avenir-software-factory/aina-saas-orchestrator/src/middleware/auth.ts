import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        tenantId: string;
        name: string;
        preferred_username?: string;
    };
}

const SAAS_JWT_SECRET = process.env.SAAS_JWT_SECRET || "super-secret-saas-key-aina-2026";

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];

        if (token && token !== "mock-token") {
            try {
                // Verify custom SaaS JWT instead of MSAL logic
                const decoded = jwt.verify(token, SAAS_JWT_SECRET) as any;

                req.user = {
                    id: decoded.id || decoded.oid || decoded.sub, // Keep Msal fallbacks if mixed used
                    tenantId: decoded.tenantId || decoded.tid,
                    name: decoded.name,
                    preferred_username: decoded.email || decoded.preferred_username,
                };

                console.log(`[Auth] User Identified: ${req.user.name} (${req.user.id})`);
                return next();
            } catch (err: any) {
                console.warn("[Auth] Failed to verify SaaS token. Fallback to mock.", err.message);
            }
        }
    }

    // Fallback if token is 'mock-token' or invalid
    console.log(`[Auth] Warning: No valid SaaS token found, using Local Mock IDs.`);
    req.user = {
        // Les ID générés dans le seed Prisma !
        id: "0b820766-9a83-4d16-b84b-ac8643986f75",   // Mock User ID
        tenantId: "f26a10f4-93b0-44f9-a6ac-0234c9582654", // Mock Tenant ID
        name: "Mock Local Dev User"
    };

    return next();
};
