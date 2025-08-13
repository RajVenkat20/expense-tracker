
export default {
    schema: "./utils/schema.jsx",
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
      url: process.env.DB_URL,
    }
  };