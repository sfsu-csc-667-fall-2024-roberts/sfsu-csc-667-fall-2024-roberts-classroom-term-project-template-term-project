import express from "express";

const router = express.Router();

router.get("/", (_request, response) => {
  response.render("root", { title: "Team P's site" });
});

router.get("/login", (_request, response) => {
  response.render("login", { title: "Login" });
});

router.get("/signup", (_request, response) => {
  response.render("signup", { title: "Register" });
});

router.get("/lobby", (_request, response) => {
  response.render("lobby", { title: "Lobby" });
});

router.get("/gamepage", (_request, response) => {
  response.render("gamepage", { title: "Game Page" });
});

export default router;
