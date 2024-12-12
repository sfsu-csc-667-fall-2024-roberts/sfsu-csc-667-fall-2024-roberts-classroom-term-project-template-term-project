import * as path from "path";
import express from "express";
import { timeMiddleware } from "./middleware/time";
import rootRoutes from "./routes/root";
import httpErrors from "http-errors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectLiveReload from "connect-livereload";
import livereload from "livereload";
import * as configuration from "./config";
import * as routes from "./routes";
import * as middleware from "./middleware";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));

app.use(timeMiddleware);

app.use(express.static(path.join(process.cwd(), "src", "public")));

app.use(cookieParser());

app.set("views", path.join(process.cwd(), "src", "server", "views"));

app.set("view engine", "ejs");

//app.use("/", rootRoutes);
app.use("/",routes.root);
app.use("/auth",routes.auth);

app.use((_request, _response, next) => {
  next(httpErrors(404));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const staticPath = path.join(process.cwd(), "src", "public");
app.use(express.static(staticPath));


configuration.configureLiveReload(app, staticPath);
configuration.configureSession(app);
/*if (process.env.NODE_ENV === "development") {
  const reloadServer = livereload.createServer();
  reloadServer.watch(staticPath);
  reloadServer.server.once("connection", () => {
    setTimeout(() => {
      reloadServer.refresh("/");
}, 100); });
  app.use(connectLiveReload());
}*/
