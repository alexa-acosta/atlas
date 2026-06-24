import sys
import os
from dotenv import load_dotenv
from src.database import init_db

load_dotenv()

R    = "\033[0m"
BOLD = "\033[1m"
CYAN = "\033[96m"
DIM  = "\033[2m"
GRN  = "\033[92m"
YEL  = "\033[93m"
RED  = "\033[91m"

def main():
    init_db()
    _clear()

    while True:
        _banner()
        print(f"  {BOLD}1.{R} Start a Scan")
        print(f"  {BOLD}2.{R} View History")
        print(f"  {BOLD}3.{R} Exit")
        print()

        choice = input("  Select an option (1-3): ").strip()

        if choice == "1":
            _scan_session()
        elif choice == "2":
            _show_history()
        elif choice == "3":
            print(f"\n  {DIM}Stay safe out there. Goodbye!{R}\n")
            sys.exit(0)
        else:
            _err("Invalid choice. Enter 1, 2, or 3.")

def _scan_session():
    # lets the user scan one or more inputs before seeing results
    inputs = [] 

    while True:
        _clear()
        _section("Start a Scan")

        # show what's already been added this session
        if inputs:
            print(f"  {GRN}Added so far:{R}")
            for i, (_, mode, src) in enumerate(inputs, 1):
                print(f"    {i}. {_mode_label(mode)}  {DIM}({src}){R}")
            print()

        print(f"  What would you like to scan?\n")

        # only show types not yet added this session
        used_modes = {mode for _, mode, _ in inputs}
        all_options = [
            ("job_post",     "Analyze Job Posting"),
            ("email",        "Analyze Recruiter Email"),
            ("offer_letter", "Analyze Offer Letter"),
        ]
        available = [(mode, label) for mode, label in all_options if mode not in used_modes]

        for i, (_, label) in enumerate(available, 1):
            print(f"  {BOLD}{i}.{R} {label}")
        print()

        next_num = len(available) + 1
        if inputs:
            run_label = f"Run scan on all {len(inputs)} inputs" if len(inputs) > 1 else "Run scan"
            print(f"  {BOLD}{next_num}.{R} {run_label}")
            print(f"  {BOLD}{next_num + 1}.{R} Cancel and go back")
            print()
            choice = input(f"  Select (1-{next_num + 1}): ").strip()
        else:
            print(f"  {BOLD}{next_num}.{R} Cancel and go back")
            print()
            choice = input(f"  Select (1-{next_num}): ").strip()

        if not choice.isdigit():
            _err("Please enter a number.")
            continue

        c = int(choice)

        if 1 <= c <= len(available):
            mode, _ = available[c - 1]
            if mode == "job_post":
                result = _collect_job_post()
            elif mode == "email":
                result = _collect_email()
            else:
                result = _collect_offer_letter()
            if result:
                inputs.append(result)
        elif c == next_num and inputs:
            _run_all(inputs)
            return
        elif c == next_num and not inputs:
            return
        elif c == next_num + 1 and inputs:
            return
        else:
            _err("Invalid choice.")

def _run_all(inputs: list):
    from src.scanner import run_scan
    _clear()

    for content, mode, source in inputs:
        try:
            run_scan(content, mode=mode, source=source)
        except KeyboardInterrupt:
            print(f"\n  {YEL}Scan interrupted.{R}\n")
            break

    input(f"\n  {DIM}Press Enter to return to main menu...{R}")

def _collect_job_post() -> tuple | None:
    _clear()
    _section("Analyze Job Posting")
    print(f"  {BOLD}1.{R} Paste job description text")
    print(f"  {BOLD}2.{R} Enter a URL")
    print()

    sub = input("  Select (1-2): ").strip()

    if sub == "1":
        print(f"\n  {DIM}Paste the job description below.{R}")
        print(f"  {DIM}When done, press Enter then Ctrl+D  (Windows: Ctrl+Z + Enter){R}\n")
        content = _paste_block("job description")
        return (content, "job_post", "pasted job description") if content else None

    elif sub == "2":
        url = input("\n  Enter the job posting URL: ").strip()
        if not url.startswith("http"):
            _err("URL must start with http:// or https://")
            return None
        from src.fetcher import fetch_url
        print(f"\n  {DIM}Fetching...{R}")
        content = fetch_url(url)
        return (content, "job_post", url) if content else None

    else:
        _err("Invalid choice.")
        return None

def _collect_email() -> tuple | None:
    _clear()
    _section("Analyze Recruiter Email")
    print(f"  {DIM}In Gmail: open the email → click ⋮ (three dots) → 'Show original' → Copy all.{R}\n")
    print(f"  {DIM}Paste the full email content below.{R}")
    print(f"  {DIM}When done, press Enter then Ctrl+D  (Windows: Ctrl+Z + Enter){R}\n")
    content = _paste_block("email")
    return (content, "email", "pasted email") if content else None

def _collect_offer_letter() -> tuple | None:
    _clear()
    _section("Analyze Offer Letter")
    print(f"  {DIM}Open your offer letter (PDF or email) and copy all the text.{R}")
    print(f"  {DIM}Paste it below. When done, press Enter then Ctrl+D  (Windows: Ctrl+Z + Enter){R}\n")
    content = _paste_block("offer letter")
    return (content, "offer_letter", "pasted offer letter") if content else None

def _show_history():
    _clear()
    _section("Scan History")

    from src.database import get_scan_history, get_scan_by_id
    get_scan_history(limit=20)

    detail = input("  Enter a scan ID to view details, or press Enter to go back: ").strip()
    if detail.isdigit():
        result = get_scan_by_id(int(detail))
        if result:
            print(f"\n  {BOLD}Scan #{result['id']}{R}")
            print(f"  Type:      {_mode_label(result['mode'])}")
            print(f"  Source:    {result['source']}")
            print(f"  Score:     {result['risk_score']}/100")
            print(f"  Verdict:   {_color_verdict(result['verdict'])}")
            print(f"  Time:      {result['timestamp'][:19]}")
            print()
        else:
            _err(f"No scan found with ID {detail}.")

    input(f"  {DIM}Press Enter to return to main menu...{R}")

def _paste_block(label: str) -> str:
    lines = []
    try:
        while True:
            lines.append(input())
    except EOFError:
        pass
    except KeyboardInterrupt:
        print(f"\n  {YEL}Cancelled.{R}")
        return ""

    content = "\n".join(lines).strip()
    if not content:
        _err(f"No {label} provided.")
    return content

def _mode_label(mode: str) -> str:
    return {
        "email":        "Recruiter Email",
        "job_post":     "Job Posting",
        "offer_letter": "Offer Letter",
    }.get(mode, mode)

def _color_verdict(verdict: str) -> str:
    c = {"safe": GRN, "medium": YEL, "high": RED}.get(verdict, DIM)
    return f"{c}{BOLD}{verdict.upper()}{R}"

def _banner():
    print(f"""
{CYAN}{BOLD}   ___  _____  _      ___  ____
  / _ \\|_   _|| |    / _ \\/ ___|
 | |_| | | |  | |   | |_| \\__ \\
 |_| |_| |_|  |___| |_| |_|___/{R}
  {DIM}— Job Scam Detection —{R}
""")

def _section(title: str):
    print(f"  {CYAN}{BOLD}── {title} ──{R}\n")

def _err(msg: str):
    print(f"\n  {RED}[!] {msg}{R}\n")
    input(f"  {DIM}Press Enter to continue...{R}")

def _clear():
    os.system("cls" if os.name == "nt" else "clear")

if __name__ == "__main__":
    main()