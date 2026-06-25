import requests
import html2text

def fetch_url(url: str) -> str:
    try:
        response = requests.get(url, timeout=10, headers={"User-Agent": "Atlas/1.0"})
        response.raise_for_status()

        content_type = response.headers.get("Content-Type", "")
        if "html" in content_type:
            h = html2text.HTML2Text()
            h.ignore_links = False
            h.ignore_images = True
            h.body_width = 0
            return h.handle(response.text)

        return response.text
    except Exception as e:
        print(f"\n  [!] Failed to fetch URL: {e}\n")
        return ""