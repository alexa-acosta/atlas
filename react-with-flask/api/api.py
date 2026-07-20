import os
import sys
import tempfile
from pathlib import Path

from flask import Flask, jsonify, request, session
from flask_bcrypt import Bcrypt

# sets a variable pointing to the main atlas directory holding all folders and code
ROOT_DIR = Path(__file__).resolve().parents[2]
# sys.path = list of folders Python searches when importing; inserted root_dir to
# allow importing of our database
sys.path.insert(0, str(ROOT_DIR))
os.environ.setdefault("ATLAS_DB_PATH", str(ROOT_DIR / "data" / "atlas.db"))

from src.database import (
    create_user,
    get_scan_by_id,
    get_user_by_email,
    init_db,
    list_scans,
)

app = Flask(__name__)
app.secret_key = os.getenv("ATLAS_SECRET_KEY", "dev-secret-change-in-prod")

bcrypt = Bcrypt(app)

init_db()


@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password required."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    hashed = bcrypt.generate_password_hash(password).decode("utf-8")
    user_id = create_user(email, hashed)

    if user_id is None:
        return jsonify({"error": "An account with that email already exists."}), 409

    session["user_id"] = user_id
    session["email"] = email
    return jsonify({"message": "Account created.", "email": email}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = get_user_by_email(email)
    if not user or not bcrypt.check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password."}), 401

    session["user_id"] = user["id"]
    session["email"] = user["email"]
    return jsonify({"message": "Logged in.", "email": user["email"]}), 200


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out."}), 200


@app.route("/api/me", methods=["GET"])
def me():
    if "user_id" not in session:
        return jsonify({"error": "Not logged in."}), 401
    return jsonify({"email": session["email"]}), 200


@app.route("/api/scans", methods=["GET"])
def scans():
    # limits the number of scans returned by a request
    limit = request.args.get("limit", default=20, type=int)
    limit = min(max(limit, 1), 100)
    user_id = session.get("user_id")
    return jsonify({"scans": list_scans(limit=limit)}), 200


@app.route("/api/scans/<int:scan_id>", methods=["GET"])
def scan_detail(scan_id):
    scan = get_scan_by_id(scan_id)
    if scan is None:
        return jsonify({"error": "Scan not found."}), 404
    return jsonify({"scan": scan}), 200


@app.route("/api/scan", methods=["POST"])
def scan():
    from src.atlasscanner import AtlasScanner
    from src.textflattener import TextFlattener

    mode = request.form.get("mode", "unknown") if request.files else "unknown"
    source = request.form.get("source", "") if request.files else ""
    raw_input = ""
    temp_path = None # holds the file pathway to uploaded offer letter

    try:
        if request.files:
            uploaded_file = request.files.get("file")
            if uploaded_file is None or not uploaded_file.filename:
                return jsonify({"error": "file is required."}), 400

            raw_input = request.form.get("raw_input", "").strip()
            suffix = Path(uploaded_file.filename).suffix
            source = source or uploaded_file.filename

            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                uploaded_file.save(temp_file.name)
                temp_path = temp_file.name
        else:
            data = request.get_json(silent=True) or {}
            raw_input = data.get("raw_input", "").strip()
            mode = data.get("mode", "unknown")
            source = data.get("source", "")

            if not raw_input:
                return jsonify({"error": "raw_input is required."}), 400

        scanner = AtlasScanner()
        if temp_path:
            document_text = TextFlattener().extract_text_from_document(temp_path).strip()
            raw_input = "\n\n".join(
                part for part in [
                    raw_input,
                    f"=== Offer Letter ===\n{document_text}" if document_text else "",
                ] if part
            )
        result = scanner.scan(raw_input, mode=mode, source=source)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Scan failed: {exc}"}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

    return jsonify({
        "scan": {
            "id": getattr(result, "scan_id", None),
            "mode": mode,
            "source": source,
            "risk_score": result.risk_score,
            "verdict": result.verdict,
            "summary": result.summary,
            "indicators": result.indicators,
        }
    }), 201


if __name__ == "__main__":
    app.run(debug=True)
    
