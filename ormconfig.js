module.exports = {
  "type": "postgres",
  "host": process.env.DB_HOST,
  "port": process.env.DB_PORT,
  "username": process.env.DB_USERNAME,
  "password": process.env.DB_PASSWORD,
  "database": process.env.DATABASE_URL,
  "synchronize": true,
  "logging": false,
  "entities": ["src/api/entity/**/*.ts"],
  "migrations": ["src/api/migration/**/*.ts"],
  "subscribers": ["src/api/subscriber/**/*.ts"],
  "cli": {
    "entitiesDir": "src/api/entity",
    "migrationsDir": "src/api/migration",
    "subscribersDir": "src/api/subscriber"
  }
}