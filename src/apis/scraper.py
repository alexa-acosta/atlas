import os
import requests

class Scraper:
  def __init__(self):
    self.api_key = os.getenv('SCRAPERAPI_KEY')
    self.api_url = "https://api.scraperapi.com/"

  def fetch_page(self, url: str):
    # returns dictionary
    api_data = {
      "api_key": self.api_key,
      "url": url
    }

    response = requests.get(self.api_url, params=api_data, timeout=60)


    if not response.text.strip():
      return {}
    return {
      "url": url,
      "status_code": response.status_code,
      "html": response.text
    }
