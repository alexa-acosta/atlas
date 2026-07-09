import os
import requests
from urllib.parse import quote 

class IPQualityScore:
  def __init__(self):
    self.api_key = os.getenv('IPQS_API_KEY')
  
  def check_email(self, email: str):
    url = f"https://www.ipqualityscore.com/api/json/email/{self.api_key}/{quote(email)}"
    response = requests.get(url)

    try:
      return response.json()
    except Exception:
      return {}

  