import base64
import os
from flask import Flask, Blueprint, request, jsonify, session
from io import BytesIO
from PIL import Image

saveFile_blueprint = Blueprint('saveFile', __name__)

# 업로드된 이미지를 저장할 폴더 설정
UPLOAD_FOLDER = 'uploaded_images'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def save_image(base64_data, filename):
    # base64 데이터에서 'data:image/jpeg;base64,' 부분 제거
    if base64_data.startswith('data:image/jpeg;base64,'):
        base64_data = base64_data.split(',')[1]
    
    # base64 데이터를 디코딩하여 이미지 파일로 변환
    image_data = base64.b64decode(base64_data)
    
    # 이미지 파일로 저장
    img = Image.open(BytesIO(image_data))

    # 세션에서 본인 IP 가져오기
    user_ip = session.get('user_ip')
    if not user_ip:
        return []  # IP 없으면 빈 리스트 반환
    
    # 본인 전용 폴더 경로
    user_folder = os.path.join(UPLOAD_FOLDER, user_ip)

    # 폴더가 존재하는지 체크
    if not os.path.exists(user_folder):
        return []  # 폴더 없으면 빈 리스트 반환

    file_path = os.path.join(user_folder, filename + '.jpeg')
    img.save(file_path)

@saveFile_blueprint.route('/uploadImg', methods=['POST'])
def upload_image():
    try:
        data = request.json
        base64_data = data.get('image_data')
        filename = data.get('filename')

        if isinstance(base64_data, list):
            for index, item in enumerate(base64_data):
                save_image(item, f"{filename[index]}")
        else:
            save_image(base64_data, filename)

        return jsonify({'message': f'Image {filename} uploaded and saved successfully'}), 200
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500
    
def del_image(filename):
    # 파일명에 .jpeg 확장자가 이미 포함된 경우를 처리
    if not filename.endswith('.jpeg'):
        filename = filename + '.jpeg'

    # 세션에서 본인 IP 가져오기
    user_ip = session.get('user_ip')
    if not user_ip:
        return []  # IP 없으면 빈 리스트 반환

    # 본인 전용 폴더 경로
    user_folder = os.path.join(UPLOAD_FOLDER, user_ip)

    # 폴더가 존재하는지 체크
    if not os.path.exists(user_folder):
        return []  # 폴더 없으면 빈 리스트 반환
    
    file_path = os.path.join('user_folder', filename)

    # 파일이 존재하는지 확인
    if os.path.exists(file_path):
        os.remove(file_path)  # 파일 삭제
        return {'message': f'File {filename} deleted successfully'}, 200
    else:
        return {'error': f'File {filename} not found'}, 404

@saveFile_blueprint.route('/deleteImg', methods=['POST'])
def delete_image():
    try:
        data = request.json
        filename = data.get('filename')

        if isinstance(filename, list):
            for index, item in enumerate(filename):
                del_image(item)
        else:
            del_image(filename)
        
        return {'message': f'File deleted successfully'}
    except Exception as e:
        print(f"Error: {e}")
        return {'error': str(e)}, 500