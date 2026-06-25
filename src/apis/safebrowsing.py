import os
import requests

class SafeBrowsing:
    def __init__(self):
        self.api_key = os.getenv('SAFE_BROWSING_KEY')

    def check_url(self, url: str):
        api_url = "https://safebrowsing.googleapis.com/v5/urls:search"

        params = {
            "key": self.api_key,
            "url": url
        }

        headers = {
            "User-Agent": "Atlas/1.0"
        }

        response = requests.get(api_url, params=params, headers=headers)

        return response.json(), response.text