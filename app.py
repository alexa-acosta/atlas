from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from src.database import init_db, create_user, get_user_by_email
import os

app = Flask(__name__, static_folder="react-with-flask/dist", static_url_path="/")
app.secret_key = os.getenv("ATLAS_SECRET_KEY", "dev-secret-change-in-prod")

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
bcrypt = Bcrypt(app)

init_db()


@app.route("/api/signup", methods=["POST"])
def signup():
    data  = request.get_json()
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
    session["email"]   = email
    return jsonify({"message": "Account created.", "email": email}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data     = request.get_json()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = get_user_by_email(email)
    if not user or not bcrypt.check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password."}), 401

    session["user_id"] = user["id"]
    session["email"]   = user["email"]
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


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    return app.send_static_file("index.html")


if __name__ == "__main__":
    app.run(debug=True, port=5000)