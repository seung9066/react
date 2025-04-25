from flask import Blueprint, request, jsonify
from services.selenium_service import crawl_website
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

crawl_blueprint = Blueprint('crawl', __name__)

@crawl_blueprint.route('/crawl', methods=['POST'])
def crawl():
    try:
        
        # 요청에서 URL 가져오기
        url = request.json.get('url')
        print("요청 데이터:", url)

        chrome_path = "C:\\Users\\SGG\\Desktop\\dev\\etc\\chromedriver-win64\\chromedriver.exe"
        service = Service(executable_path=chrome_path)
        options = Options()
        # options.add_argument("--headless")  # UI 없이 실행
        options.add_argument("--disable-gpu")  # GPU 가속 비활성화
        options.add_argument("--no-sandbox")  # 보안 관련 오류 방지

        driver = webdriver.Chrome(service=service, options=options)

        # URL 접속
        driver.get(url)

        # 페이지가 로드될 때까지 대기 (예: 특정 요소가 로드될 때까지)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))

        # # 페이지 소스 가져오기
        html = driver.page_source
        driver.quit()  # 드라이버 종료
        
        # 크롤링 작업 수행
        # content = crawl_website(url)

        return jsonify({'content': html})

    except Exception as e:
        print(f"❌ 에러 발생: {e}")
        return jsonify({'error': str(e)}), 500