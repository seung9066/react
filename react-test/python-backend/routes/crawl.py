import os
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
def create_driver():
    chrome_path = "C:\\Users\\SGG\\Desktop\\dev\\etc\\chromedriver-win64\\chromedriver.exe"
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
        print("요청 데이터:", url)

        driver = create_driver()
        driver.get(url)
        wait_for_page_load(driver)

        # "누적 판매순" 버튼 클릭
        button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[text()='누적 판매순']"))
        )
        button.click()

        # 다시 로딩 대기
        wait_for_page_load(driver)

        # 제품 목록 div 찾기
        div = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "whole_products"))
        )

        ul_elements = div.find_elements(By.TAG_NAME, "ul")
        ul_contents = [ul.get_attribute('outerHTML') for ul in ul_elements]

        html = driver.page_source

        # driver.quit()  # 필요 시 활성화
        print("SmartStore Crawl END")
        return jsonify({'content': html, 'ul': ul_contents})

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
        driver = create_driver()
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
                    print(f"Deleted {file_path}")
            except Exception as e:
                print(f"Error deleting {file_path}: {e}")

        print("✅ Taobao 크롤링 완료")
        return jsonify({'content': html})

    except Exception as e:
        print(f"❌ 에러 발생 (Taobao): {e}")
        return jsonify({'error': str(e)}), 500
    



# 🛒 스마트스토어 키워드드 크롤링
@crawl_blueprint.route('/crawlKeyword', methods=['POST'])
def crawl_keyword():
    try:
        url = request.json.get('url')
        print("요청 데이터:", url)

        driver = create_driver()
        driver.get(url)
        wait_for_page_load(driver)

        # "누적 판매순" 버튼 클릭
        try:
            button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable(
                    (By.CSS_SELECTOR, "button.productSortList_button__Y0khI[aria-labelledby='sort_PURCHASE']")
                )
            )

            page_type = 'window'
        except:
            filter_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[contains(text(), '추천순')]")
                )
            )
            
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", filter_button)

            filter_button.click()

            wait_for_page_load(driver)

            button = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, ".productSortList_button__Y0khI._nlog_click._nlog_impression_element")
                )
            )

            page_type = 'mobile'
        
        print(page_type)

        wait_for_page_load(driver)
        button.click()
        
        print('click')

        # 다시 로딩 대기
        wait_for_page_load(driver)

        if page_type == 'window' :
            # 모든 해당 요소 가져오기
            elements = WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".productCardTitle_product_card_title__eQupA.productCardTitle_view_type_grid2__4N618"))
            )
            print('elements')
        else :
            # 모든 해당 요소 가져오기
            elements = WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".productCardTitle_product_card_title__eQupA"))
            )
            print('elements')

        # 각 요소에서 텍스트 추출
        tag = []
        for idx in range(len(elements)):
            try:
                # 요소를 다시 찾기
                elements = driver.find_elements(By.CSS_SELECTOR, (
                    ".productCardTitle_product_card_title__eQupA.productCardTitle_view_type_grid2__4N618"
                    if page_type == 'window'
                    else ".productCardTitle_product_card_title__eQupA"
                ))
                el = elements[idx]
                tag.append(el.text)
                print(f"{idx+1}번 요소 텍스트:", el.text)
            except e:
                print(f"⚠️ {idx+1}번 요소는 stale 상태입니다.")
                continue

        # driver.quit()  # 필요 시 활성화
        print("SmartStore Crawl END")
        return jsonify({'text': tag})

    except Exception as e:
        print(f"❌ 에러 발생 (SmartStore): {e}")
        return jsonify({'error': str(e)}), 500