import * as dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";
import { createConnection } from "typeorm";
import app from './config/express';
import { env, port } from './config/variables';

export const startServer = () => {
  createConnection()
  .then(() => {
    app.listen(port, () => console.info(`Server started: Port ${port}, Env ${env} 🍺`));
  })
  .catch(err => console.log(err));
}

startServer();
