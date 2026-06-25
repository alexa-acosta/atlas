import os
import requests
import base64

# Rate limit: 4 request per minute, 500/day
# Each method returns a dictionary first (for storage) then returns it as a string second (for Gemini)

class VirusTotal:
  self.api_key = os.getenv('ATLAS_VIRUSTOTAL_KEY')

  def scan_ip(self, ip: str):
    url = f"https://www.virustotal.com/api/v3/ip_addresses/{ip}"

    headers = {
      "x-apikey": api_key,
      "accept": "application/json"
    }

    response = requests.get(url, headers=headers)
    return response.json(), response.text
  
  def scan_url(self, url: str):
    url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")

    url = f"https://www.virustotal.com/api/v3/urls/{url_id}"

    headers = {
      "accept": "application/json",
      "x-apikey": api_key
    }

    response = requests.get(url, headers=headers)

    return response.json(), response.text

  def scan_domain(self, domain: str):
    url = f"https://www.virustotal.com/api/v3/domains/{domain}"

    headers = {
      "accept":"application/json",
      "x-apikey": api_key
    }

    response = requests.get(url, headers=headers)

    return response.json(), response.text
