from flask import Flask, request, jsonify
import os
from pymongo import MongoClient

app = Flask(__name__)
MONGO = os.getenv("MONGO_URI", "mongodb://mongo-notify:27017")
client = MongoClient(MONGO)
db = client.get_database("notifydb")
col = db.notifications

@app.route("/notify", methods=["POST"])
def notify():
    payload = request.json or {}
    # store notification (simulation)
    col.insert_one({"payload": payload})
    # pretend to send email / slack asynchronously (omitted)
    return jsonify({"success": True}), 201

@app.get("/health")
def health():
    return jsonify({"service": "notification-service", "ok": True}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5104)))
