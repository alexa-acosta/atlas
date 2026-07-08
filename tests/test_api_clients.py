import importlib
import sys
import types
import unittest
from unittest.mock import Mock, patch

from src.apis.cloudmersive import CloudmersiveClient
from src.apis.safebrowsing import SafeBrowsing
from src.apis.virustotal import VirusTotal
from src.apis.scraper import Scraper


class TestVirusTotal(unittest.TestCase):
    def test_scan_url_encodes_url_and_returns_json(self):
        response = Mock()
        response.json.return_value = {"data": {"id": "encoded"}}

        with patch.dict("os.environ", {"ATLAS_VIRUSTOTAL_KEY": "vt-key"}):
            client = VirusTotal()
        with patch("src.apis.virustotal.requests.get", return_value=response) as get:
            result = client.scan_url("https://example.com/apply")

        self.assertEqual(result, {"data": {"id": "encoded"}})
        called_url = get.call_args.args[0]
        self.assertIn("/api/v3/urls/", called_url)
        self.assertNotIn("=", called_url.rsplit("/", 1)[-1])
        self.assertEqual(get.call_args.kwargs["headers"]["x-apikey"], "vt-key")

    def test_scan_domain_returns_empty_dict_for_empty_response(self):
        response = Mock()
        response.text = "  "

        client = VirusTotal()
        with patch("src.apis.virustotal.requests.get", return_value=response):
            result = client.scan_domain("example.com")

        self.assertEqual(result, {})


class TestSafeBrowsing(unittest.TestCase):
    def test_check_url_posts_threat_request_and_returns_json(self):
        response = Mock()
        response.json.return_value = {"matches": [{"threatType": "SOCIAL_ENGINEERING"}]}

        with patch.dict("os.environ", {"SAFE_BROWSING_KEY": "safe-key"}):
            client = SafeBrowsing()
        with patch("src.apis.safebrowsing.requests.post", return_value=response) as post:
            client.check_url("https://bad.example")

        self.assertEqual(post.call_args.kwargs["params"], {"key": "safe-key"})
        entries = post.call_args.kwargs["json"]["threatInfo"]["threatEntries"]
        self.assertEqual(entries, [{"url": "https://bad.example"}])

    def test_check_url_returns_empty_dict_when_json_parse_fails(self):
        response = Mock()
        response.json.side_effect = ValueError("not json")

        with patch("src.apis.safebrowsing.requests.post", return_value=response):
            result = SafeBrowsing().check_url("https://bad.example")

        self.assertEqual(result, {})


class TestCloudmersiveClient(unittest.TestCase):
    def test_analyze_language_posts_body_and_returns_json(self):
        response = Mock()
        response.text = '{"CleanResult": false}'
        response.json.return_value = {"CleanResult": False, "ThreatScore": 8}

        with patch.dict("os.environ", {"CLOUDMERSIVE_API_KEY": "cm-key"}):
            client = CloudmersiveClient()
        with patch("src.apis.cloudmersive.requests.post", return_value=response) as post:
            with patch("src.apis.cloudmersive.time.sleep") as sleep:
                client.analyze_language("remote job text")

        self.assertEqual(post.call_args.kwargs["headers"]["Apikey"], "cm-key")
        self.assertEqual(post.call_args.kwargs["json"]["InputString"], "remote job text")
        self.assertTrue(post.call_args.kwargs["json"]["ProvideUrlAnalysis"])
        sleep.assert_called_once_with(2)

    def test_analyze_language_returns_empty_dict_for_empty_response(self):
        response = Mock()
        response.text = ""

        with patch("src.apis.cloudmersive.requests.post", return_value=response):
            with patch("src.apis.cloudmersive.time.sleep"):
                result = CloudmersiveClient().analyze_language("text")

        self.assertEqual(result, {})


class TestGemini(unittest.TestCase):
    def test_analyze_results_sends_prompt_and_returns_output_text(self):
        fake_google = types.ModuleType("google")
        fake_genai = types.ModuleType("google.genai")
        fake_types = types.ModuleType("google.genai.types")
        interaction_response = types.SimpleNamespace(output_text="42% likely fraudulent score")
        fake_client = Mock()
        fake_client.interactions.create.return_value = interaction_response
        fake_genai.Client = Mock(return_value=fake_client)
        fake_google.genai = fake_genai
        fake_genai.types = fake_types

        with patch.dict(
            sys.modules,
            {
                "google": fake_google,
                "google.genai": fake_genai,
                "google.genai.types": fake_types,
            },
        ):
            gemini_module = importlib.import_module("src.apis.gemini")
            gemini_module = importlib.reload(gemini_module)

            with patch.dict("os.environ", {"ATLAS_GENAI_KEY": "gem-key"}):
                gemini = gemini_module.Gemini()
            text = gemini.analyze_results(Mock(to_string=Mock(return_value="API context")), "Flattened input")

        self.assertEqual(text, "42% likely fraudulent score")
        fake_genai.Client.assert_called_once_with(api_key="gem-key")
        create_kwargs = fake_client.interactions.create.call_args.kwargs
        self.assertEqual(create_kwargs["model"], "gemini-2.5-flash")
        self.assertIn("Flattened input", create_kwargs["input"])
        self.assertIn("API context", create_kwargs["input"])

# test scraper api
class TestScraper(unittest.TestCase):
  def test_fetch_and_returns_dict_success(self):
    response = Mock()
    response.status_code = 200
    response.text = "<html><body>Job posting</body></html>"
    with patch.dict("os.environ", {"SCRAPERAPI_KEY": "scraper-key"}):
      client = Scraper()
    with patch("src.apis.scraper.requests.get", return_value=response) as get:
      result = client.fetch_page("https://example.com/job")
    self.assertEqual(result, {
      "url": "https://example.com/job",
      "status_code": 200,
      "html": "<html><body>Job posting</body></html>"
    })
    self.assertEqual(get.call_args.kwargs["params"]["api_key"], "scraper-key")
    self.assertEqual(get.call_args.kwargs["params"]["url"], "https://example.com/job")

  # test status_code
  def test_fetch_page_returns_empty_dict_for_not_200_status(self):
    response = Mock()
    response.status_code = 403
    response.text = "Invalid API key"
    with patch.dict("os.environ", {"SCRAPERAPI_KEY": "scraper-key"}):
      client = Scraper()
    with patch("src.apis.scraper.requests.get", return_value=response):
      result = Scraper().fetch_page("https://example.com/job")
    self.assertEqual(result, {})

  # test blank
  def test_fetch_page_returns_empty_dict_for_empty_response(self):
    response = Mock()
    response.status_code = 200
    response.text = "  "    
    with patch("src.apis.scraper.requests.get", return_value=response):
      result = Scraper().fetch_page("https://example.com/job")
    self.assertEqual(result, {})


if __name__ == "__main__":
    unittest.main()
