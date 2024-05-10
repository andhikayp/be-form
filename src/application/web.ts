import express from "express";
import { logger } from "./logging";

import { publicRouter } from "../route/public-api";
import { errorMiddleware } from "../middleware/error-middleware";

const port = 3000;
export const web = express();
web.use(express.json());
web.use(publicRouter);
web.use(errorMiddleware);

web.listen(port, () => {
  logger.info(`Server is running at port: ${port}`);
});
