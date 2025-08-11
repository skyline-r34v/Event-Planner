const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

const PYTHON_PATH = path.join(__dirname, "../.venv/bin/python"); // venv python
const PYTHON_SCRIPT_PATH = path.join(__dirname, "scraper.py");
const JSON_FILE_PATH = path.join(__dirname, "google_maps_data.json");

// Route to run scraper
app.get("/scrape", (req, res) => {
    console.log("Starting Python scraper..."); 

    exec(`"${PYTHON_PATH}" "${PYTHON_SCRIPT_PATH}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: "Scraper failed" });
        }

        console.log(stdout);
        console.error(stderr);

        fs.readFile(JSON_FILE_PATH, "utf-8", (err, data) => {
            if (err) {
                return res.status(500).json({ error: "Could not read JSON file" });
            }
            try {
                const jsonData = JSON.parse(data);
                res.json(jsonData);
            } catch {
                res.status(500).json({ error: "Invalid JSON format" });
            }
        });
    });
});

// Route to get the latest JSON data without scraping again
app.get("/data", (req, res) => {
    fs.readFile(JSON_FILE_PATH, "utf-8", (err, data) => {
        if (err) {
            return res.status(404).json({ error: "Data file not found" });
        }
        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch {
            res.status(500).json({ error: "Invalid JSON format" });
        }
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
