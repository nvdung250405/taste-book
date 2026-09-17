import cors from "cors";

const configCors = (app) => {
  const allowedOrigins = (
    process.env.ALLOWED_ORIGINS ||
    process.env.REACT_URL ||
    ""
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      },

      methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
      ],

      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
      ],

      credentials: true,

      maxAge: 86400,
    })
  );
};

export default configCors;