#!/usr/bin/env python3
"""Simple test to check if Flask is working"""
from flask import Flask

app = Flask(__name__)

@app.route('/')
def index():
    return '<h1>Admin System Test</h1><p>If you see this, Flask is working!</p>'

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5002, debug=True)
