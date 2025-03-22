const express = require("express");
const multer = require("multer");
const svgson = require("svgson");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/analyser", upload.single("svg"), async (req, res) => {
  const svgPath = req.file.path;
  const content = fs.readFileSync(svgPath, "utf8");

  try {
    const svg = await svgson.parse(content);
    const viewBox = svg.attributes.viewBox?.split(" ").map(Number);

    if (!viewBox) {
      return res.status(400).json({ error: "Pas de viewBox dans le SVG." });
    }

    const width_px = viewBox[2];
    const height_px = viewBox[3];

    const dpi = 96;
    const mm_per_inch = 25.4;

    const width_mm = (width_px / dpi) * mm_per_inch;
    const height_mm = (height_px / dpi) * mm_per_inch;

    res.json({
      width_mm: +width_mm.toFixed(2),
      height_mm: +height_mm.toFixed(2),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur d'analyse SVG." });
  } finally {
    fs.unlinkSync(svgPath); // nettoyage
  }
});

app.get("/", (req, res) => {
  res.send("✅ API SVG active. POST /analyser avec un fichier SVG");
});

app.listen(3000, () => {
  console.log("🚀 Serveur lancé sur http://localhost:3000");
});
