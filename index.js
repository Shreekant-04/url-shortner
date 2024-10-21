const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connection = require("./config/db");
const urlSchema = require("./models/urlSchema");
const genShortUrl = require("./services/generateurl");
const { URL } = require("url");
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

const validateUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (err) {
    return false;
  }
};

app.get("/", (req, res) => {
  res.set("Content-Type", "text/html");
  res.render("index", { active: "result", LongUrl: "", shortUrl: "" });
});

app.post("/api/shorturl", async (req, res) => {
  const { url } = req.body;

  if (!validateUrl(url)) {
    return res.json({ error: "invalid url" });
  }

  let data = await urlSchema.findOne({ LongUrl: url });
  if (data) {
    return res
      .status(200)
      .json({ original_url: data.LongUrl, short_url: data.shortUrl });
  }

  const shortUrl = genShortUrl(url);
  let newEntry = new urlSchema({ LongUrl: url, shortUrl });

  newEntry.shortUrl = `https://${req.headers.host}/api/shorturl/${shortUrl}`;
  await newEntry.save();

  res
    .status(201)
    .json({ original_url: newEntry.LongUrl, short_url: newEntry.shortUrl });
});

app.get("/api/shorturl/:shorturl", async (req, res) => {
  const shortUrl = `https://${req.headers.host}/api/shorturl/${req.params.shorturl}`;

  const data = await urlSchema.findOne({ shortUrl });
  if (data) {
    return res.redirect(data.LongUrl);
  }

  res.set("Content-Type", "text/html");
  res.render("notFound");
});

let PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
