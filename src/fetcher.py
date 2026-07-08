# import requests
import html2text
from src.apis.scraper import Scraper

def fetch_url(url: str) -> str:
    try:
      result = Scraper().fetch_page(url) # result is a dictionary with html
      html = result.get("html", "")
      # if result is emty return ""
      if not html.strip():
        return ""
      h = html2text.HTML2Text()
      h.ignore_links = False
      h.ignore_images = True
      h.body_width = 0
      return h.handle(html)
    except Exception as e:
        print(f"\n  [!] Failed to fetch URL: {e}\n")
        return ""