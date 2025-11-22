# Yellow Pages UAE Web Scraper

A Python web scraper to extract company names and phone numbers from Yellow Pages UAE business listings.

## Overview

This scraper collects business information from the Dubai Business Setup category on Yellow Pages UAE. It handles pagination automatically and exports data to CSV format.

## Features

- Scrapes company names and phone numbers
- Handles pagination (processes all 9 pages)
- Respectful scraping with delays between requests
- Exports to CSV format
- Error handling and progress tracking

## Installation

1. Install required dependencies:
```bash
pip install -r requirements.txt
```

Or install individually:
```bash
pip install requests beautifulsoup4 lxml
```

## Usage

Run the scraper:
```bash
python3 scrape_yellowpages.py
```

The scraper will:
1. Fetch all 9 pages from the Yellow Pages website
2. Extract company names and phone numbers
3. Display progress in the terminal
4. Save results to `yellowpages_companies.csv`

## Output

The script generates a CSV file with two columns:
- `company_name`: The name of the business
- `phone_number`: The contact phone number (in international format)

Example output:
```
company_name,phone_number
Al Manama Typing & Business Consultancy LLC,+971800626262
AH Auditing of Accounts LLC,+97142981127
Confident Corporate Services Provider (CSP),+97143709977
```

## Note

Some companies may have multiple phone numbers, resulting in multiple rows for the same company name.

## Results

From the latest run:
- **Total entries scraped**: 282
- **Pages processed**: 9
- **Output file**: yellowpages_companies.csv

## Configuration

You can modify the scraper by editing `scrape_yellowpages.py`:
- Change `max_pages` parameter to scrape more/fewer pages
- Adjust the delay between requests (currently 2 seconds)
- Modify the output filename in `save_to_csv()` method

## Ethical Considerations

This scraper:
- Includes delays between requests to avoid overwhelming the server
- Uses a standard User-Agent header
- Only scrapes publicly available information
- Respects the website's structure

Please use this tool responsibly and in accordance with the website's terms of service.
