import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import httpErrors from "http-errors";
import morgan from "morgan";
import * as path from "path";

dotenv.config();

import * as config from "./config";
import authRoutes from "./routes/auth";
import { timeMiddleware } from "./middleware/time";

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(timeMiddleware);

const staticPath = path.join(process.cwd(), "src", "public");
app.use(express.static(staticPath));

config.livereload(app, staticPath);

app.use(cookieParser());
app.set("views", path.join(process.cwd(), "src", "server", "views"));
app.set("view engine", "ejs");

app.get("/", (_req, res) => {
    // todo auth middleware express-session & pg and/orrrr jwt
    const is_authed = false;

    if (is_authed) {
        res.render("authenticated", {
            username: "user",
            lobbies: [],
        });
    } else {
        res.render("unauthenticated");
    }
});

// api routes
app.use("/api/auth", authRoutes);

app.use(
    (
        _req: express.Request,
        _res: express.Response,
        next: express.NextFunction,
    ) => {
        next(httpErrors(404));
    },
);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
