
export default {
    schema: "./utils/schema.jsx",
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
      url: process.env.NEXT_PUBLIC_DB_URL,
    }
  };