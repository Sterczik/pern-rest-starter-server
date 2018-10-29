import "reflect-metadata";
require('dotenv').config();

import { createConnection } from "typeorm";
import { User } from "./api/entity/User";

createConnection()
  .then(async connection => {
    const user = new User();
    user.firstName = "Kamil";
    user.lastName = "Sterczik";
    user.age = 22;
    await connection.manager.save(user);
    console.log('Works!')
  })
  .catch(err => console.log(err));
