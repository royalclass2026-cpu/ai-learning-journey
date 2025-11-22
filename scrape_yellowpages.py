#!/usr/bin/env python3
"""
Yellow Pages UAE Web Scraper
Scrapes company names and phone numbers from Dubai business setup listings
"""

import requests
from bs4 import BeautifulSoup
import csv
import time
from typing import List, Dict
import re


class YellowPagesScraper:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.companies = []

    def fetch_page(self, page_num: int = 1) -> BeautifulSoup:
        """Fetch a single page and return BeautifulSoup object"""
        url = f"{self.base_url}?page={page_num}" if page_num > 1 else self.base_url
        print(f"Fetching page {page_num}: {url}")

        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except requests.RequestException as e:
            print(f"Error fetching page {page_num}: {e}")
            return None

    def extract_companies(self, soup: BeautifulSoup) -> List[Dict[str, str]]:
        """Extract company data from a page"""
        companies = []

        # Find all company listings - looking for cards with company info
        # We'll search for phone links first as they're distinctive
        phone_links = soup.find_all('a', href=re.compile(r'^tel:'))

        for phone_link in phone_links:
            # Extract phone number from href (e.g., tel:+971800626262)
            phone_href = phone_link.get('href', '')
            phone_number = phone_href.replace('tel:', '').strip()

            # Find the parent container that holds the company info
            # Traverse up to find the company card
            company_card = phone_link.find_parent('div', class_='bg-white')
            if not company_card:
                # Try alternative parent structures
                company_card = phone_link.find_parent('div', class_=re.compile(r'.*flex.*'))

            company_name = "N/A"

            if company_card:
                # Look for company name in heading tags (h1-h6)
                heading = company_card.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
                if heading:
                    # Get text from heading or from link inside heading
                    name_link = heading.find('a')
                    if name_link:
                        company_name = name_link.get_text(strip=True)
                    else:
                        company_name = heading.get_text(strip=True)

            # Only add if we found a phone number
            if phone_number:
                companies.append({
                    'company_name': company_name,
                    'phone_number': phone_number
                })

        return companies

    def scrape_all_pages(self, max_pages: int = 9):
        """Scrape all pages of listings"""
        print(f"Starting to scrape up to {max_pages} pages...\n")

        for page_num in range(1, max_pages + 1):
            soup = self.fetch_page(page_num)

            if not soup:
                print(f"Skipping page {page_num} due to fetch error")
                continue

            page_companies = self.extract_companies(soup)

            if not page_companies:
                print(f"No companies found on page {page_num}, stopping...")
                break

            self.companies.extend(page_companies)
            print(f"Found {len(page_companies)} companies on page {page_num}")
            print(f"Total companies so far: {len(self.companies)}\n")

            # Be respectful - add delay between requests
            if page_num < max_pages:
                time.sleep(2)

        return self.companies

    def save_to_csv(self, filename: str = 'yellowpages_companies.csv'):
        """Save scraped data to CSV file"""
        if not self.companies:
            print("No companies to save!")
            return

        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['company_name', 'phone_number']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

            writer.writeheader()
            for company in self.companies:
                writer.writerow(company)

        print(f"\n✓ Saved {len(self.companies)} companies to {filename}")

    def print_summary(self):
        """Print a summary of scraped data"""
        print("\n" + "="*60)
        print(f"SCRAPING COMPLETE")
        print("="*60)
        print(f"Total companies scraped: {len(self.companies)}")

        if self.companies:
            print("\nFirst 5 companies:")
            for i, company in enumerate(self.companies[:5], 1):
                print(f"{i}. {company['company_name']} - {company['phone_number']}")


def main():
    # Target URL
    url = "https://www.yellowpages-uae.com/uae/dubai/business-setup"

    # Create scraper instance
    scraper = YellowPagesScraper(url)

    # Scrape all pages (there are 9 pages with 180 total results)
    scraper.scrape_all_pages(max_pages=9)

    # Print summary
    scraper.print_summary()

    # Save to CSV
    scraper.save_to_csv('yellowpages_companies.csv')


if __name__ == "__main__":
    main()
