import express from "express";
import {Users} from "../db";

const router = express.Router();

router.get("/signup", (_request, response) => {
    response.render("auth/signup", { title: "Auth: Register" });
  });

router.post("/signup", async (request, response) => {
    const { username, email, password } = request.body;
    try {
      const user = await Users.register(username, email, password);
      // @ts-expect-error TODO: Define the session type for the user object
      request.session.user = user;
      response.redirect("/gamepage");
    } catch (error) {
      console.error(error);
      request.flash("error", "Failed to register user");
      response.redirect("/auth/signup");
    }
  });

  router.get("/login", (_request, response) => {
    response.render("auth/login", { title: "Auth: Login" });
  });

  router.post("/login", async (request, response) => {
    const { email, password } = request.body;
    try {
      const user = await Users.login(email, password);
      // @ts-expect-error TODO: Define the session type for the user object
      request.session.user = user;
      response.redirect("/gamepage");
    } catch (error) {
      console.error(error);
      request.flash("error", error as string);
      response.redirect("/auth/login");
    }
  });
  router.get("/logout", (request, response) => {
    request.session.destroy(() => {
      response.redirect("/");
    });
  });


export default router;