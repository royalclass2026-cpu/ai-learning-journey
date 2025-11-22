#!/usr/bin/env python3
"""Test script to see what we're getting from the website"""

import requests
from bs4 import BeautifulSoup

url = "https://www.yellowpages-uae.com/uae/dubai/business-setup"

session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0'
})

print("Fetching page...")
response = session.get(url, timeout=15)
print(f"Status code: {response.status_code}")
print(f"Content length: {len(response.content)}")

soup = BeautifulSoup(response.content, 'html.parser')

# Check for phone links
phone_links = soup.find_all('a', href=lambda x: x and x.startswith('tel:'))
print(f"\nPhone links found: {len(phone_links)}")

# Let's check what the page title is
title = soup.find('title')
print(f"Page title: {title.get_text() if title else 'No title'}")

# Check for common anti-bot indicators
if "cloudflare" in response.text.lower():
    print("\n⚠️  Cloudflare protection detected")

if "captcha" in response.text.lower():
    print("\n⚠️  CAPTCHA detected")

if "robot" in response.text.lower() or "bot" in response.text.lower():
    print("\n⚠️  Bot detection message found")

# Save HTML for inspection
with open('page_source.html', 'w', encoding='utf-8', errors='replace') as f:
    f.write(response.text)
print("\n✓ Page source saved to page_source.html for inspection")

# Show first 1000 characters
print("\nFirst 1000 characters of response:")
print("="*60)
print(response.text[:1000])
