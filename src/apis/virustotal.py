import os
import requests
import base64

# Rate limit: 4 request per minute, 500/day
# Each method returns a dictionary for storage and Gemini context

class VirusTotal:
  def __init__(self):
    self.api_key = os.getenv('ATLAS_VIRUSTOTAL_KEY')

  def scan_ip(self, ip: str):
    url = f"https://www.virustotal.com/api/v3/ip_addresses/{ip}"

    headers = {
      "x-apikey": self.api_key,
      "accept": "application/json"
    }

    response = requests.get(url, headers=headers)
    return response.json()
  
  def scan_url(self, url: str):
    url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")

    check_url = f"https://www.virustotal.com/api/v3/urls/{url_id}"

    headers = {
      "accept": "application/json",
      "x-apikey": self.api_key
    }

    response = requests.get(check_url, headers=headers)

    return response.json()

  def scan_domain(self, domain: str):
    url = f"https://www.virustotal.com/api/v3/domains/{domain}"

    headers = {
      "accept":"application/json",
      "x-apikey": self.api_key
    }

    response = requests.get(url, headers=headers)

    return response.json()
