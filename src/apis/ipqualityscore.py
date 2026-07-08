import os
import requests

class IPQualityScore:
  def __init__(self):
    self.api_key = os.getenv('IPQS_API_KEY')
  
  def check_email(self, email: str):
    url = f"https://www.ipqualityscore.com/api/json/email/{IPQS_API_KEY}/{email}
    response = requests.get(url)

    if not response:
      return {}
    return response.json()

  