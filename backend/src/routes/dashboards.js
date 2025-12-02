import express from "express";
import { authenticateJWT } from "../middleware/authMiddleware.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Get all dashboards for user
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const dashboards = await prisma.dashboard.findMany({
      where: { userId: req.user.userId },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(dashboards);
  } catch (error) {
    console.error("Failed to fetch dashboards:", error);
    res.status(500).json({ error: "Failed to fetch dashboards" });
  }
});

// Get single dashboard
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const dashboard = await prisma.dashboard.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user.userId 
      }
    });
    
    if (!dashboard) {
      return res.status(404).json({ error: "Dashboard not found" });
    }
    
    res.json(dashboard);
  } catch (error) {
    console.error("Failed to fetch dashboard:", error);
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

// Create dashboard
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const { name, widgets } = req.body;
    
    if (!name || !widgets) {
      return res.status(400).json({ error: "Name and widgets are required" });
    }
    
    const dashboard = await prisma.dashboard.create({
      data: {
        name,
        widgets,
        userId: req.user.userId
      }
    });
    
    res.json(dashboard);
  } catch (error) {
    console.error("Failed to create dashboard:", error);
    res.status(500).json({ error: "Failed to create dashboard" });
  }
});

// Update dashboard
router.put("/:id", authenticateJWT, async (req, res) => {
  try {
    const { name, widgets } = req.body;
    
    // Check if dashboard exists and belongs to user
    const existing = await prisma.dashboard.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user.userId 
      }
    });
    
    if (!existing) {
      return res.status(404).json({ error: "Dashboard not found" });
    }
    
    const dashboard = await prisma.dashboard.update({
      where: { id: req.params.id },
      data: { 
        name, 
        widgets, 
        updatedAt: new Date() 
      }
    });
    
    res.json(dashboard);
  } catch (error) {
    console.error("Failed to update dashboard:", error);
    res.status(500).json({ error: "Failed to update dashboard" });
  }
});

// Delete dashboard
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    // Check if dashboard exists and belongs to user
    const existing = await prisma.dashboard.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user.userId 
      }
    });
    
    if (!existing) {
      return res.status(404).json({ error: "Dashboard not found" });
    }
    
    await prisma.dashboard.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: "Dashboard deleted successfully" });
  } catch (error) {
    console.error("Failed to delete dashboard:", error);
    res.status(500).json({ error: "Failed to delete dashboard" });
  }
});

export default router;