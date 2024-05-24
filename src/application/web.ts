import express from "express";
import cors from "cors";

import { logger } from "./logging";
import { publicRouter } from "../route/public-api";
import { apiRouter } from "../route/api";
import { errorMiddleware } from "../middleware/error-middleware";

const port = 3001;
export const web = express();
web.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
web.use(express.json());
web.use(publicRouter);
web.use(apiRouter);
web.use(errorMiddleware);

web.listen(port, () => {
  logger.info(`Server is running at port: ${port}`);
});
