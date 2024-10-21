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
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.set("Content-Type", "text/html");
  res.render("index", { active: "result", LongUrl: "", shortUrl: "" });
});

app.post("/url", async (req, res) => {
  const { url } = req.body;
  const path = new URL(req.url, `https://${req.headers.host}`);
  
  let data = await urlSchema.findOne({ LongUrl: url });
  if (data) {
    return res.status(200).json(data);
  }

  let newEntry = new urlSchema({ LongUrl: url });
  newEntry.shortUrl = `${path.href}/${genShortUrl(url)}`; // <-- Removed extra "/"
  await newEntry.save();
  res.status(201).json(newEntry);
});

app.get("/url/:shorturl", async (req, res) => {
  const path = `http://${req.headers.host}${req.url}`;
  const data = await urlSchema.findOne({ shortUrl: path });
  if (data) {
    res.redirect(data.LongUrl);
    return;
  }
  res.render("notFound");
});

// Server start listening
let PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
