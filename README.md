## **_ATLAS_**

## _Atlas is a job scam detection web application._ It helps job seekers check whether an opportunity is real before they act on it.

### What ATLAS does

- Accepts a job posting as pasted text, a URL, or an uploaded PDF
- Fetches/parses the input and runs it through several fraud-detectors _(VirusTotal, Safe Browsing, Cloudmersive, IPQualityScore)_ and analyzes it using an LLM _(Gemini)_
- Returns a risk score _(0-100)_ and a verdict _(safe/medium/high)_
- Gives a 3-point reasoning breakdown explaining the score
- Supports user login and registration
- Saves scans to history

## Tech Stack

- **Frontend:** _React + Vite_ – User interface library bundled with a fast development server
- **Backend:** _Flask_ - web framework for our server and API routes
- **Database:** _SQLite_ – database used to store users and scan history

### Security APIs

- **_VirusTotal_** - checks URLs, domains, and IPs for security threats
- **_Cloudmersive_** - analyzes input for phishing language
- **_Google Safe Browsing_** - analyzes URL for relations to known phishing domains
- **_ScraperAPI_** - fetches the raw HTML of a job posting URL
- **_IPQualityScore API_** - handles email validation and advanced fraud tracking

### AI Integration

- **google-genai** - uses Gemini API to analyze input and produce score + reasoning

### Libraries

- **html2text** - converts scraped HTML job posting into clean text
- **Unstructured** - parses text from uploaded PDFs
- **FTFY** - fixes copy-paste encoding issues
- **Flask-Bcrypt** - hashes user passwords before storing them
- **Flask-Cors** - connects React to our Flask API
