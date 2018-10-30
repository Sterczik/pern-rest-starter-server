import * as dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";
import { createConnection } from "typeorm";
import app from './config/express';
import { env, port } from './config/variables';

createConnection()
  .then(async () => {
    console.log('Database connected!');
  })
  .catch(err => console.log(err));

app.listen(port, () => console.info(`Server started: Port ${port}, Env ${env}`));
