import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// axios get
export const getAxios = async (url, data) => {
    try {
        const res = await axios.get('/api' + url, {
            params: data,
        });
        if (res.status === 200) {
            return {msg : 'success', data : res.data};
        } else {
            return {msg : 'error :: ' + url, res};
        }
    } catch (error) {
        return {msg : 'error :: ' + url, error};
    }
};

// axios post
export const postAxios = async (url, data) => {
    try {
        const res = await axios.post('/api' + url, data, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data),
        });
        if (res.status === 200) {
            return {msg: 'success', data: res.data};
        } else {
            return {msg : 'error :: ' + url, res};
        }
    } catch (error) {
        return {msg : 'error :: ' + url, error};
    }
}

// axios patch
export const patchAxios = async (url, data) => {
    try {
        const res = await axios.patch('/api' + url, data, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data),
        });
        if (res.status === 200) {
            return {msg: 'success', data: res.data};
        } else {
            return {msg : 'error :: ' + url, res};
        }
    } catch (error) {
        return {msg : 'error :: ' + url, error};
    }
}

// axios delete
export const deleteAxios = async (url, data) => {
    try {
        const res = await axios.delete('/api' + url, {
            params: data,
        });
        if (res.status === 200) {
            return {msg: 'success', data: res.data};
        } else {
            return {msg : 'error :: ' + url, res};
        }
    } catch (error) {
        return {msg : 'error :: ' + url, error};
    }
}

// 필수값 체크
export const checkRequired = (ref) => {
    const requiredTag = ref.current.querySelectorAll('[required]');
    for (const item of requiredTag) {
        const tagValue = item.value;
        if (!tagValue.trim() || tagValue.trim() === '') {
            item.focus();
            let msg = ' 은(는) 필수값 입니다.';
            if (item.id && ref.current.querySelector('label[' + item.id + ']')?.innerText) {
                let innerText = ref.current.querySelector('label[' + item.id + ']').innerText;
                showToast(innerText + msg);
            } else if (item.placeholder) {
                showToast(item.placeholder + msg);
            }
            return false;
        }
    }
    return true;
}

// 토스트
export const showToast = (msg) => {
    window.toastRef?.current?.showToast(msg);
}

export const getUserData = () => {
    return window?.userData
}

// 이미지 파일을 base64로 변환
export const imageSrcToBase64 = async (imgSrc) => {
    try {
        const res = await fetch(`http://localhost:5000/api/proxy/proxy-image?url=${encodeURIComponent(imgSrc)}`);
        const data = await res.json();
        
        if (data.base64) {
            return data.base64; // base64 이미지 반환
        } else {
            throw new Error('Base64 conversion failed');
        }
    } catch (e) {
        console.error('Image fetch or conversion failed', e);
        return null; // 에러 발생 시 null 반환
    }
}

// exeljs 엑셀 다운
export const excelJSDown = async (tableRef, excelName) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Products');

    // 👉 열 너비를 계산할 배열
    const columnWidths = [];

    // 👉 테이블에서 헤더 추출
    const thead = tableRef.current.querySelector('thead');
    const headers = Array.from(thead.querySelectorAll('th')).map(th => th.innerText.trim());

    // 초기 열 너비 = 헤더 텍스트 길이
    headers.forEach((header, i) => {
        columnWidths[i] = header.length;
    });

    sheet.addRow(headers);

    // 👉 테이블에서 본문 추출
    const rows = tableRef.current.querySelectorAll('tbody tr');
    const imgData = [];
    for (const [rowIndex, row] of Array.from(rows).entries()) {
        const rowData = [];
        const cells = row.querySelectorAll('td');
        let maxHeight = 0; // 해당 행에서 이미지의 최대 높이 추적

        for (const [colIndex, cell] of Array.from(cells).entries()) {
            const img = cell.querySelector('img');
            if (img && img.src) {
                try {
                    const res = await fetch(`http://localhost:5000/api/proxy/proxy-image?url=${encodeURIComponent(img.src)}`);
                    const data = await res.json();

                    if (data.base64) {
                        imgData.push(data.base64);
                        const imageId = workbook.addImage({
                            base64: data.base64,
                            extension: 'jpeg',
                        });

                        sheet.addImage(imageId, {
                            tl: { col: colIndex, row: rowIndex + 1 },
                            ext: { width: 80, height: 80 }
                        });
                        rowData.push('');
                        // 이미지 셀 너비 고정
                        columnWidths[colIndex] = Math.max(columnWidths[colIndex] || 0, 12);
                        
                        // 이미지 높이에 맞춰 행 높이 설정
                        maxHeight = Math.max(maxHeight, 80);
                    } else {
                        rowData.push('[이미지 오류]');
                        columnWidths[colIndex] = Math.max(columnWidths[colIndex] || 0, '[이미지 오류]'.length);
                    }
                } catch (e) {
                    rowData.push('[이미지 실패]');
                    columnWidths[colIndex] = Math.max(columnWidths[colIndex] || 0, '[이미지 실패]'.length);
                }
            } else {
                const text = cell.innerText.trim();
                rowData.push(text);
                columnWidths[colIndex] = Math.max(columnWidths[colIndex] || 0, text.length);
            }
        }

        // 행 높이 설정 (이미지 크기에 맞춰 최대 높이로 설정)
        sheet.addRow(rowData);
        sheet.getRow(rowIndex + 2).height = maxHeight; // rowIndex + 2는 Excel에서 1-based index이므로 조정
    }

    // 👉 열 너비 반영 (한 글자 ≈ 1.2~1.5의 비율로 넓게)
    sheet.columns.forEach((column, i) => {
        column.width = columnWidths[i] * 1.2;
    });

    // 📦 다운로드
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });  // Excel MIME 타입 지정
    saveAs(blob, `${excelName}.xlsx`);
};

// base64 데이터를 이미지 파일로 변환
export const base64ToImage = (base64Data, filename) => {
    if (Array.isArray(base64Data)) {
        base64Data.forEach((data, index) => {
            base64ToImageDownload(data, `${filename[index]}`);
        });
    } else {
        base64ToImageDownload(base64Data, filename);
    }
}

const base64ToImageDownload = (base64Data, filename) => {
    // base64 데이터를 Blob 객체로 변환
    const byteCharacters = atob(base64Data.split(',')[1]); // base64 문자열에서 'data:image/jpeg;base64,'를 제거
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const byteArray = [];
        for (let i = 0; i < 1024 && offset + i < byteCharacters.length; i++) {
            byteArray.push(byteCharacters.charCodeAt(offset + i));
        }
        byteArrays.push(new Uint8Array(byteArray));
    }

    const blob = new Blob(byteArrays, { type: 'image/jpeg' }); // MIME 타입을 맞춰줍니다.
    
    // Blob을 URL로 변환
    const url = URL.createObjectURL(blob);
    
    // 링크 생성하여 다운로드 시작
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // URL 해제
}

// 파이썬 서버에 이미지 저장
export const base64ToImageAndSend = async (base64Data, filename) => {
    // base64 데이터를 서버로 전송할 JSON 형식으로 준비
    const requestBody = JSON.stringify({
        image_data: base64Data,
        filename: filename
    });
    
    return await postAxios('/imgFilePython/pythonSaveImg', requestBody).then((res) => {
        if (res.msg === 'success') {
            showToast("이미지 저장 성공");
            return true
        } else {
            showToast("이미지 저장 실패", res.error);
            return false
        }
    });
}

// 파이썬 서버 이미지 삭제
export const deleteImage = async (filename) => {
    // base64 데이터를 서버로 전송할 JSON 형식으로 준비
    const requestBody = JSON.stringify({
        filename: filename
    });
    
    return await postAxios('/imgFilePython/pythonDeleteImg', requestBody).then((res) => {
        if (res.msg === 'success') {
            showToast("이미지 삭제 성공");
            return true
        } else {
            showToast("이미지 삭제 실패", res.error);
            return false
        }
    });
}