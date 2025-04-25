from flask import Blueprint, request, jsonify
from services.selenium_service import crawl_website
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

crawl_blueprint = Blueprint('crawl', __name__)

@crawl_blueprint.route('/crawlSmartStore', methods=['POST'])
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

        # 특정 버튼 찾고 클릭 (예: id가 'myButton'인 버튼 클릭)
        button = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//button[text()='누적 판매순']")))
        button.click()  # 버튼 클릭

        # 버튼 클릭 후 페이지가 로드될 때까지 대기 (예: 새로운 내용이 로드될 때까지)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))

        # div 요소 대기
        div = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "whole_products")))

        # div 내부에서 ul 요소들 찾기
        ul_elements = div.find_elements(By.TAG_NAME, "ul")

        ul_li_contents = []
        # # 각 ul 요소에서 li 요소들을 찾아 그 내용 저장
        # for ul in ul_elements:
        #     li_elements = ul.find_elements(By.TAG_NAME, "li")  # 각 ul 안의 li 요소들 찾기
        #     li_contents = [li.get_attribute('outerHTML') for li in li_elements]  # li의 outerHTML 가져오기
        #     ul_li_contents.append({
        #         'ul': ul.get_attribute('outerHTML'),
        #         'li': li_contents
        #     })

        # 가져온 ul 태그들의 내용을 출력하거나 처리
        ul_contents = [ul.get_attribute('outerHTML') for ul in ul_elements]

        # 페이지 소스 가져오기
        html = driver.page_source

        # 드라이버 종료는 필요하다면 활성화
        # driver.quit()

        # 출력 및 반환
        print("END")
        return jsonify({'content': html, 'ul': ul_contents })


    except Exception as e:
        print(f"❌ 에러 발생: {e}")
        return jsonify({'error': str(e)}), 500
