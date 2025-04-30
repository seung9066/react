import os
from flask import Flask, request, session
from flask_cors import CORS # type: ignore
from routes.crawl import crawl_blueprint  # 또는 정확한 파일 경로
from routes.saveFile import saveFile_blueprint  # 또는 정확한 파일 경로

app = Flask(__name__)
CORS(app)
app.secret_key = 'ipAddressSession'

UPLOAD_FOLDER = 'uploaded_images'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.register_blueprint(crawl_blueprint, url_prefix='/api')
app.register_blueprint(saveFile_blueprint, url_prefix='/api')

# 요청이 들어올 때마다 실행되는 인터셉터
@app.before_request
def before_request_func():
    ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)
    session['user_ip'] = ip_address

    # IP 별 폴더 경로 만들기
    user_folder = os.path.join(UPLOAD_FOLDER, ip_address)

    # 폴더 존재 여부 확인, 없으면 생성
    if not os.path.exists(user_folder):
        os.makedirs(user_folder)

# 요청 처리 후 실행되는 인터셉터
@app.after_request
def after_request_func(response):
    return response

if __name__ == '__main__':
    print("Flask server is starting...")
    app.run(host='0.0.0.0', port=5001, debug=True)
