import * as dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";
import { createConnection } from "typeorm";
import app from './config/express';
import { env, port } from './config/variables';

const APP_PORT = port || '3000';

export const startServer = () => {
  createConnection()
  .then(() => {
    app.listen(APP_PORT, () => console.info(`Server started: Port ${APP_PORT}, Env ${env} 🍺`));
  })
  .catch(err => console.log(err));
}

startServer();
