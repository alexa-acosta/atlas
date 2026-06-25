import os
from google import genai
from google.genai import types
from src import apiresults

class Gemini:
  # Set environment variable
  self.api_key = os.getenv('ATLAS_GENAI_KEY')
  genai.api_key = api_key 

  client = genai.Client(api_key=api_key)

  def analyze_results(self, results: APIResults):
    prompt = results.toString()

    interaction = client.interactions.create(
      model="gemini-2.5-flash",
      system_instruction="""You are a cybersecurity expert with 20+ years of experience. 
      Given information to evaluate, you will answer with two brief sections of information: 
      a percentage between 0-100 on how likely to be fraudulent the given information is and 
      three bullet points summarizing the top three reasons why the given information is 
      credible or fraudulent.\n\n
      You will answer strictly following this format:\n\n
      [percentage]% likely to be fraudulent.\n\n
      - [Reason #1]\n
      - [Reason #2]\n
      - [Reason #3]\n
      (end of example)\n\n
      Do not elaborate any further past the third bullet point. Do not add any extra 
      information before giving the percentage. End the response after the third bullet point.""",
      input=prompt,
      generation_config={
        "thinking_level": "medium"
      }
    )

    return interaction.output_text