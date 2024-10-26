import * as path from "path";
import express from "express";
import { timeMiddleware } from "./middleware/time";
import rootRoutes from "./routes/root";
import httpErrors from "http-errors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));

app.use(timeMiddleware);

app.use(express.static(path.join(process.cwd(), "src", "public")));

app.use(cookieParser());

app.set("views", path.join(process.cwd(), "src", "server", "views"));

app.set("view engine", "ejs");

app.use("/", rootRoutes);

app.use((_request, _response, next) => {
  next(httpErrors(404));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
