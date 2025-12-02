import express from "express";
import { syncRepos, getRepos, toggleFavorite, getCompareData, getRepoAnalytics } from "../controllers/repoController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateJWT);

router.get("/", getRepos);
router.post("/sync", syncRepos);
router.patch("/:id/favorite", toggleFavorite);
router.get("/:id/compare", getCompareData);
router.get("/analytics/activity", getRepoAnalytics);

export default router;
