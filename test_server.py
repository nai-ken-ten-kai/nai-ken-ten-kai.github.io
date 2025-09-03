#!/usr/bin/env python3
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return '<h1>Test Server Working!</h1><p>Flask is functioning correctly.</p>'

if __name__ == '__main__':
    print('🚀 Starting test server on port 5009...')
    app.run(host='127.0.0.1', port=5009, debug=False)
