module.exports = {
  "type": "postgres",
  "host": "localhost",
  "port": 5432,
  "username": "kamil",
  "password": process.env.DB_PASSWORD,
  "database": "pern-rest-server",
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