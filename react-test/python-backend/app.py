from flask import Flask
from flask_cors import CORS # type: ignore
from routes.crawl import crawl_blueprint  # 또는 정확한 파일 경로

app = Flask(__name__)
CORS(app)

app.register_blueprint(crawl_blueprint, url_prefix='/api')

if __name__ == '__main__':
    print("Flask server is starting...")
    app.run(host='0.0.0.0', port=5001, debug=True)
