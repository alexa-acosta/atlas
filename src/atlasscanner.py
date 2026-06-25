from src.apis.cloudmersive import Cloudmersive
from src.apis.gemini import Gemini
from src.apis.safebrowsing import SafeBrowsing
from src.apis.virustotal import VirusTotal
from src.apiresults import APIResults
from src.database import Database
from src.flattenedtext import FlattenedText
from src.outputformatter import OutputFormatter
from src.parsedresult import ParsedResult
from src.parser import Parser
from src.scaninput import ScanInput
from src.scanresult import ScanResult
from src.scorer import Scorer
from src.textflattener import TextFlattener

class AtlasScanner:
    