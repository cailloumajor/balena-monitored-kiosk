export default {
  PORT: process.env.API_PORT || 3000,
  PROD: process.env.NODE_ENV === "production",
}
