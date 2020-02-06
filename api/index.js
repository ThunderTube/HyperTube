const connectDB = require("./config/db");
const express = require("express");
const morgan = require("morgan");

const router = require("./routes");

async function app() {
  // Connect to database
  await connectDB();

  const app = express();

  // Body parser
  app.use(express.json());

  // Dev logging middleware
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  app.use("/api/v1", router);

  app.listen(process.env.PORT, err => {
    if (err) {
      return console.error("something bad happened", err);
    }
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
    );
  });
}

app().catch(console.error);
