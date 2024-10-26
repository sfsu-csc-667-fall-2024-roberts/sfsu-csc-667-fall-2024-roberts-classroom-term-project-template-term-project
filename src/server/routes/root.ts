import express from "express";

const router = express.Router();

router.get("/", (_request, response) => {
  response.render("root", { title: "Team P's site" });
});

export default router;
