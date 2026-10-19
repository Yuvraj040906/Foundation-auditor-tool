const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const screenshotsDir = path.join(__dirname, "public/screenshots");
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}
app.use("/screenshots", express.static(screenshotsDir));

app.post("/api/screenshot", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });

  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security",
      ],
    });

    const page = await browser.newPage();

    // Set proper viewport size
    await page.setViewport({ width: 1280, height: 900 });

    // Use a real Chrome User-Agent so sites don't block the capture
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    // Go to URL and wait until network is nearly idle
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

    // Give the page 3 seconds to fully paint animations/images
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const filename = `screenshot-${Date.now()}.png`;
    const filepath = path.join(screenshotsDir, filename);

    await page.screenshot({ path: filepath, fullPage: false });
    await browser.close();

    res.json({ imageUrl: `/screenshots/${filename}` });
  } catch (err) {
    if (browser) await browser.close();
    console.error("Screenshot error detail:", err.message);
    res.status(500).json({ error: `Puppeteer Error: ${err.message}` });
  }
});

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
