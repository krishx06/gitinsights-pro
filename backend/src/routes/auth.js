import express from "express";
import { loginWithGitHub, githubCallback, getMe } from "../controllers/authController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/login", loginWithGitHub);
router.get("/callback", githubCallback);
router.get("/me", authenticateJWT, getMe);


export default router;

