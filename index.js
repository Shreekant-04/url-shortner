const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connection = require("./config/db");
const urlSchema = require("./models/urlSchema");
var path = require("path");

require("dotenv").config();
connection();
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Helper function to validate URL
const validateUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (err) {
    return false;
  }
};

// Root endpoint to render the home page
app.get("/", async (req, res) => {
  res.set("Content-Type", "text/html");
  res.render("index", { active: "result", LongUrl: "", shortUrl: "" });
});

// Shorten URL endpoint
app.post("/api/shorturl", async (req, res) => {
  const { url } = req.body;

  // Check if the URL is valid
  if (!validateUrl(url)) {
    return res.json({ error: "invalid url" });
  }

  // Check if the URL is already shortened
  let data = await urlSchema.findOne({ LongUrl: url });
  if (data) {
    return res
      .status(200)
      .json({ original_url: data.LongUrl, short_url: data.shortUrl });
  }
  const totalDocuments = await urlSchema.countDocuments();
  const shortUrl = totalDocuments + 1;

  // Create and save the new URL entry
  let newEntry = new urlSchema({ LongUrl: url, shortUrl });
  await newEntry.save();

  // Return the original URL and the shortened URL identifier
  res.status(201).json({ original_url: newEntry.LongUrl, short_url: shortUrl });
});

// Redirect from short URL to original URL
app.get("/api/shorturl/:shorturl", async (req, res) => {
  const { shorturl } = req.params;

  // Find the corresponding long URL in the database
  const data = await urlSchema.findOne({ shortUrl: shorturl });
  if (data) {
    return res.redirect(data.LongUrl);
  }

  // If the short URL does not exist, return a 404 response
  res.set("Content-Type", "text/html");
  res.status(404).render("notFound");
});

// Start the server
let PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
