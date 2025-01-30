# Redfin Scraper API

This project is a **web scraper** built using **Puppeteer** **Typescript** and **Express**. It scrapes property listings from **Redfin** and provides them as a JSON response via an API endpoint. The scraper extracts key details like price, address, bedrooms, bathrooms, and square footage, then saves the data to a JSON file.

## Features
- Scrape property listings from Redfin for a given city(Allen,TX).
- Extracts price, address, bedroom count, bathroom count, and square footage.
- Saves the scraped data to a JSON file.
- Provides a web service API endpoint for scraping.
- Handles pagination to get all the listed properties from each page.

## Getting Started

### Prerequisites
Ensure you have **Node.js** and **npm** installed on your machine.

You can check by running:
   ```bash
   node -v
   npm -v
   ```
### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/Webscraping-Redfin.git
   cd Webscraping-Redfin
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Start the server**:
   ```bash
   npm start
   ```
