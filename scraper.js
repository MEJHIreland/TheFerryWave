const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const URL = "https://www.dublinport.ie/information-centre/next-100-arrivals/";

async function scrape() {
    try {
        const { data } = await axios.get(URL);
        const $ = cheerio.load(data);

        const results = [];

        $("table tr").each((i, row) => {
            const cols = $(row).find("td");
            if (cols.length > 0) {
                const type = $(cols[3]).text().trim();
                // Only include ferries
                if (type.toLowerCase().includes("ferry")) {
                    results.push({
                        date: $(cols[0]).text().trim(),
                        time: $(cols[1]).text().trim(),
                        vessel: $(cols[2]).text().trim(),
                        type: type,
                        berth: $(cols[4]).text().trim(),
                        origin: $(cols[5]).text().trim()
                    });
                }
            }
        });

        // Sort by date/time
        results.sort((a, b) => {
            return new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time);
        });

        fs.writeFileSync("arrivals.json", JSON.stringify(results, null, 2));
        console.log("✅ All scheduled ferries saved to arrivals.json");
    } catch (err) {
        console.error("❌ Scraper failed:", err);
    }
}

// Run the scraper
scrape();
