import os
import requests
import time

class CloudmersiveClient:
    def __init__(self):
        self.api_key = os.getenv("CLOUDMERSIVE_API_KEY")
        self.api_url = "https://api.cloudmersive.com/phishing/detect/text-string/advanced"

    def analyze_language(self, text: str):
        headers = {
            "Apikey": self.api_key,
            "Content-Type": "application/json"
        }

        body = {
            "InputString": text,
            "TextType": "Email",
            "Model": "Advanced",
            "AllowUnsolicitedSales": False,
            "AllowPromotionalContent": False,
            "AllowWebUrls": True,
            "AllowPhoneNumbers": True,
            "AllowEmailAddresses": True,
            "ProvideUrlAnalysis": True,
            "ProvideAnalysisRationale": True
        }

        response = requests.post(self.api_url, headers=headers, json=body)

        time.sleep(2) # placeholder for future use where Cloudmersive analyzes multiple ScanInputs
        return response.json(), response.text
