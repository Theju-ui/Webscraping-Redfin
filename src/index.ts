import express, { Request, Response } from "express";
import puppeteer from "puppeteer";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
  try {
    console.log("Starting scraping for Redfin Homes in Allen TX");
    const data = await scrapeRedfin();
    // Save response to the JSON file
    const filePath = path.join(__dirname, "listings.json");
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.json({ message: "Scraping completed", data });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 *
 * @returns property details
 */
async function scrapeRedfin() {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--start-maximized",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const page = await browser.newPage();

  // To Avoid Detection i added real useragent.
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
  );

  await page.goto("https://www.redfin.com/city/492/TX/Allen", {
    waitUntil: "domcontentloaded",
  });

  let properties = [];
  let hasNextPage = true;
  let currentPage = 1;

  while (hasNextPage) {
    // Wait for the listings to load
    console.log("Waiting for property listings...");
    await page.waitForSelector(".HomeViews", { timeout: 20000 });

    // Select all property cards
    const propertyElements = await page.$$('[data-rf-test-name="mapHomeCard"]');

    for (const propertyElement of propertyElements) {
      const price = await getTextContent(
        page,
        propertyElement,
        ".bp-Homecard__Price--value"
      );
      const homeDetails = await getTextContent(
        page,
        propertyElement,
        ".bp-Homecard__Stats"
      );
      const address = await getTextContent(
        page,
        propertyElement,
        ".bp-Homecard__Address"
      );

      const extractedHomeDetails = extractPropertyDetails(homeDetails);

      let bedrooms = extractedHomeDetails[0] || "N/A";
      let bathrooms = extractedHomeDetails[1] || "N/A";
      let sqft = extractedHomeDetails[2] || "N/A";

      properties.push({ price, address, bedrooms, bathrooms, sqft });
    }

    // Check if we have a next page link
    const paginationLinks = await page.$$eval(
      "a.Pagination__button",
      (links: any[]) => {
        return links.map((link) => link.href);
      }
    );

    const nextPageLink = paginationLinks.find((link: string | string[]) =>
      link.includes(`page-${currentPage + 1}`)
    );

    if (nextPageLink) {
      const fullNextPageLink = nextPageLink;
      console.log(`Navigating to next page: ${fullNextPageLink}`);
      await page.goto(fullNextPageLink, { waitUntil: "domcontentloaded" }); // Navigate to the next page
      currentPage++;
    } else {
      hasNextPage = false; // when no more pages, end the loop
    }
  }
  await browser.close();
  console.log("All Listings have been returned");
  return properties;
}

/**
 * function to get the text content of the properties
 * @param page
 * @param element
 * @param selector
 * @returns {string}
 */
async function getTextContent(
  page: any,
  element: any,
  selector: string
): Promise<string> {
  const subElement = await element.$(selector);
  return subElement
    ? await page.evaluate(
        (el: { textContent: string }) => el.textContent?.trim() || "",
        subElement
      )
    : "N/A";
}

/**
 * function to extract property details from the stats string
 * @param text
 * @returns property details
 */
const extractPropertyDetails = (text: string) => {
  text = text.replace(/,/g, "");
  const matches = text.match(/(\d+(\.\d+)?)\s*(beds?|baths?|sq\s*ft)/gi);
  return matches ? matches.map((match) => match.trim()) : [];
};

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
