import os
import requests

class SafeBrowsing:
    def __init__(self):
        self.api_key = os.getenv('SAFE_BROWSING_KEY')

    def check_url(self, url: str) -> dict:
        api_url = "https://safebrowsing.googleapis.com/v4/threatMatches:find"

        body = {
            "client": {
                "clientId": "atlas",
                "clientVersion": "1.0"
            },
            "threatInfo": {
                "threatTypes": [
                    "MALWARE", "SOCIAL_ENGINEERING",
                    "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"
                ],
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [{"url": url}]
            }
        }

        response = requests.post(
            api_url,
            json=body,
            params={"key": self.api_key}
        )

        try:
            return response.json()
        except Exception:
            return {}