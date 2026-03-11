import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/db";
import { v4 as uuidv4 } from "uuid";

const router = Router();
const SAAS_JWT_SECRET = process.env.SAAS_JWT_SECRET || "super-secret-saas-key-aina-2026";

// Optional: Ensure a mock tenant exists for the first SaaS users in dev mode
const getOrCreateDefaultTenant = async () => {
    let tenant = await prisma.tenant.findFirst({
        where: { domain: "aina-saas.local" }
    });
    if (!tenant) {
        tenant = await prisma.tenant.create({
            data: {
                id: uuidv4(),
                name: "Aïna SaaS Early Adopters",
                domain: "aina-saas.local",
                tierPlan: "Pro"
            }
        });
    }
    return tenant;
};

router.post("/register", async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const tenant = await getOrCreateDefaultTenant();
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                id: uuidv4(),
                tenantId: tenant.id,
                email,
                name,
                passwordHash: hashedPassword,
                role: "admin",
            }
        });

        // Generate JWT
        const token = jwt.sign(
            { id: newUser.id, tenantId: newUser.tenantId, name: newUser.name, email: newUser.email },
            SAAS_JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/login", async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, tenantId: user.tenantId, name: user.name, email: user.email },
            SAAS_JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
