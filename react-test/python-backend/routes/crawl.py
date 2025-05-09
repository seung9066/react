import os
import time
from flask import Blueprint, request, jsonify, session
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

crawl_blueprint = Blueprint('crawl', __name__)

UPLOAD_FOLDER = 'uploaded_images'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# ✅ [공통 함수] 크롬 드라이버 생성
def create_driver(path):
    chrome_path = path.replace('/' , '\\')
    service = Service(executable_path=chrome_path)
    options = Options()
    # options.add_argument("--headless")  # 필요 시 주석 해제
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")

    driver = webdriver.Chrome(service=service, options=options)
    return driver

# ✅ [공통 함수] 기본 페이지 로딩 대기
def wait_for_page_load(driver, timeout=10):
    WebDriverWait(driver, timeout).until(EC.presence_of_element_located((By.TAG_NAME, "body")))


# 🛒 스마트스토어 크롤링
@crawl_blueprint.route('/crawlSmartStore', methods=['POST'])
def crawl_smartstore():
    try:
        url = request.json.get('url')
        path = request.json.get('chromeDriverPath')

        driver = create_driver(path)
        driver.get(url)
        wait_for_page_load(driver)

        tag = []

        # 제품 목록 div 찾기
        elements_name = driver.find_elements(By.CSS_SELECTOR, "ul.wOWfwtMC_3.FR2H3hWxUo li > div > a > strong")
        elements_price = driver.find_elements(By.CSS_SELECTOR, "ul.wOWfwtMC_3.FR2H3hWxUo li > div > a > div > strong > span")
        elements_image = driver.find_elements(By.CSS_SELECTOR, "ul.wOWfwtMC_3.FR2H3hWxUo li > div > a > div > div > div > div > img")

        for idx, el in enumerate(elements_name):
            try:
                tag.append({'name' : elements_name[idx].text, 'price': elements_price[idx].text, 'imgSrc': elements_image[idx].get_attribute("src")})
            except Exception as e:
                print(f"⚠️ {idx+1}번 요소는 stale 상태입니다: {e}")
        
        driver.quit()  # 필요 시 활성화
        return jsonify({'data': tag})

    except Exception as e:
        print(f"❌ 에러 발생 (SmartStore): {e}")
        return jsonify({'error': str(e)}), 500

# 이미지 파일 경로 가져오기
def get_image_paths():
    image_paths = []

    # 세션에서 본인 IP 가져오기
    user_ip = session.get('user_ip')
    if not user_ip:
        return []  # IP 없으면 빈 리스트 반환

    # 본인 전용 폴더 경로
    user_folder = os.path.join(UPLOAD_FOLDER, user_ip)

    # 폴더가 존재하는지 체크
    if not os.path.exists(user_folder):
        return []  # 폴더 없으면 빈 리스트 반환
    
    for filename in os.listdir(user_folder):
        if filename.endswith('.jpg') or filename.endswith('.jpeg'):  # 확장자 필터링
            # 상대 경로를 절대 경로로 변환
            abs_path = os.path.abspath(os.path.join(user_folder, filename))
            image_paths.append(abs_path)
    return image_paths

# 🛍️ 타오바오 크롤링
@crawl_blueprint.route('/crawlTaobao', methods=['POST'])
def crawl_taobao():
    try:
        # 서버에서 이미지 파일 경로 가져오기
        image_paths = get_image_paths()
        if not image_paths:
            return jsonify({'error': 'No images found on the server'}), 404

        # 웹드라이버 생성 및 페이지 로드
        path = request.json.get('chromeDriverPath')

        driver = create_driver(path)
        driver.get('https://www.taobao.com/')
        wait_for_page_load(driver)

        # 제품 사진 input file
        input_file_img = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "image-search-custom-file-input"))
        )

        # 이미지를 input에 전달
        for img_path in image_paths:
            input_file_img.send_keys(img_path)

        # 업로드한 이미지 찾기 버튼 클릭
        upload_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "image-search-upload-button"))
        )
        upload_button.click()

        # 페이지 로딩 대기
        wait_for_page_load(driver)

        html = driver.page_source

        driver.quit()  # 크롤링 완료 후 드라이버 종료

        # 세션에서 본인 IP 가져오기
        user_ip = session.get('user_ip')
        if not user_ip:
            return []  # IP 없으면 빈 리스트 반환

        # 본인 전용 폴더 경로
        user_folder = os.path.join(UPLOAD_FOLDER, user_ip)

        # 폴더가 존재하는지 체크
        if not os.path.exists(user_folder):
            return []  # 폴더 없으면 빈 리스트 반환

        # 이미지 파일 삭제
        for filename in os.listdir(user_folder):
            file_path = os.path.join(user_folder, filename)
            try:
                if os.path.isfile(file_path):  # 파일인지 확인
                    os.remove(file_path)        # 파일 삭제
            except Exception as e:
                print(f"Error deleting {file_path}: {e}")

        return jsonify({'content': html})

    except Exception as e:
        print(f"❌ 에러 발생 (Taobao): {e}")
        return jsonify({'error': str(e)}), 500
    



# 🛒 스마트스토어 키워드드 크롤링
@crawl_blueprint.route('/crawlKeyword', methods=['POST'])
def crawl_keyword():
    try:
        url = request.json.get('url')
        path = request.json.get('chromeDriverPath')
        keywordArr = request.json.get('keywordArr')

        tag = []
        for idx, txt in enumerate(keywordArr):
            searchUrl = url.replace('{searchKeyword}' , txt)
            print(txt)
            print(url)
            print(searchUrl)
            
            driver = create_driver(path)
            driver.get(searchUrl)
            wait_for_page_load(driver)

            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

            time.sleep(2)

            # 모든 해당 요소 가져오기
            elements = WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".product_link__aFnaq.linkAnchor._nlog_click._nlog_impression_element"))
            )

            # 각 요소에서 텍스트 추출
            for idx, el in enumerate(elements):
                try:
                    tag.append({'product': txt, 'name': el.text})
                except Exception as e:
                    print(f"⚠️ {idx+1}번 요소는 stale 상태입니다: {e}")
            driver.quit()  # 필요 시 활성화

        return jsonify({'text': tag})

    except Exception as e:
        print(f"❌ 에러 발생 (SmartStore): {e}")
        return jsonify({'error': str(e)}), 500