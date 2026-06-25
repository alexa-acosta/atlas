import os
import google.generativeai as genai
from src.apiresults import APIResults

class Gemini:
  # Set environment variable
  def __init__(self):
    self.api_key = os.getenv('ATLAS_GENAI_KEY')
    genai.configure(api_key=self.api_key)

  def analyze_results(self, results: APIResults, flattened_input: str = "") -> str:
    prompt = f"""
    Analyze the following information:

    Flattened user input:
    {flattened_input}

    API results:
    {results.to_string()}
    """

    response = genai.generate_text(
      model=os.getenv("ATLAS_GENAI_MODEL", "models/text-bison-001"),
      prompt=f"""You are a cybersecurity expert with 20+ years of experience.

      Analyze the provided job posting, recruiter communication, URLs, email authentication results, and security scan results.
      The four lines should be in estimation of how likely it is to be fraudulent.

      Rules:
      - Output a percentage ranging from 0-100.
      - 0% means definitely legitimate; 100% means definitely fraudulent.
      - Output exactly three bullet points summarizing the top three reasons justifying the percentage.
      - Do not include headings or extra text.

      Answer strictly following this format:

      [percentage]% likely fraudulent score

      - [Reason #1]
      - [Reason #2]
      - [Reason #3]

      {prompt}""",
      temperature=0.2,
      max_output_tokens=400,
    )

    return response.result
