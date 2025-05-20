import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// axios get
export const getAxios = async (url, data) => {
    try {
        const res = await axios.get('/api' + url, {
            params: data,
            withCredentials: true,
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
            withCredentials: true,
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

// axios post file
export const postAxiosFile = async (url, data) => {
    try {
        const res = await axios.post('/api' + url, data, {
            withCredentials: true,
        }); // ✅ headers, data 설정 제거
        if (res.status === 200) {
            return { msg: 'success', data: res.data };
        } else {
            return { msg: 'error :: ' + url, res };
        }
    } catch (error) {
        return { msg: 'error :: ' + url, error };
    }
};

// axios patch
export const patchAxios = async (url, data) => {
    try {
        const res = await axios.patch('/api' + url, data, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data),
            withCredentials: true,
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
            data,
            withCredentials: true,
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

// 로그인
export const login = async (userData, checkAuth) => {
    try {
        const param = {userId : userData.userId, userPw: userData.userPw, auth: checkAuth || '000'};
        const res = await getAxios('/login/login', param);
        if (res.msg === 'success') {
            const data = res.data;
            
            if (data.msg === 'success') {
                return true;
            } else {
                showToast(data.data);
            }
        } else {
            showToast("로그인 실패", res.error);
        }

        return false;
    } catch (error) {
        showToast('로그인 중 예외가 발생했습니다.', error);
        return null;
    }
}

// 로그아웃
export const logout = async () => {
    try {
        const res = await getAxios('/login/logout');
        if (res.msg === 'success') {
            return res.data;
        } else {
            showToast('로그아웃 중 오류가 발생했습니다.', res.error);
            return null;
        }
    } catch (error) {
        showToast('로그아웃 중 예외가 발생했습니다.', error);
        return null;
    }
}

// 세션 권한 가져오기
export const getUserAuthSession = async () => {
    try {
        const res = await getAxios('/session/getUserDataSession');
        if (res.msg === 'success') {
            return res.data.userAuth;
        } else {
            showToast('세션 정보를 가져오는 중 오류가 발생했습니다.', res.error);
            return null;
        }
    } catch (error) {
        showToast('세션 요청 중 예외가 발생했습니다.', error);
        return null;
    }
}

// 세션 정보 가져오기
export const getUserDataSession = async (col) => {
    try {
        const res = await getAxios('/session/getUserDataSession');
        if (res.msg === 'success') {
            if (col) {
                if (typeof col === 'object') {
                    const result = {};
                    for (const key of col) {
                        result[key] = res.data[key];
                    }
                    return result;
                } else {
                    return res.data[col];
                }
            } else {
                return res.data;
            }
        } else {
            showToast('세션 정보를 가져오는 중 오류가 발생했습니다.', res.error);
            return null;
        }
    } catch (error) {
        showToast('세션 요청 중 예외가 발생했습니다.', error);
        return null;
    }
}

// 토스트
export const showToast = (msg, consoleMsg) => {
    window.toastRef?.current?.showToast(msg, consoleMsg);
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

export const imageSrcToBase64Arr = async (imgSrcArr) => {
    try {
        const arr = [];
        for (const item of imgSrcArr) {
            arr.push(item);
            // arr.push(encodeURIComponent(item));
        }

        const requestBody = JSON.stringify({
            arr : arr,
        })

        return await postAxios('/proxy/proxy-imageArr', requestBody).then((res) => {
            if (res.msg === 'success') {
                showToast("이미지 변환 성공");
                return res
            } else {
                showToast("이미지 변환 실패", res.error);
                return false
            }
        });
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

// 쿠키 설정
export const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));  // 만료일 설정
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value}; ${expires}; path=/`;  // 쿠키 설정
}

// 쿠키 가져오기
export const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null; // 쿠키가 없으면 null 반환
}

// 날짜 가져오기
export const getDate = (y, m, d, format) => {
    const today = new Date();

    y ? today.setFullYear(today.getFullYear() + y) : null;
    m ? today.setMonth(today.getMonth() + m) : null;
    d ? today.setDate(today.getDate() + d) : null;
    
    let year = today.getFullYear().toString();
    year = ('0000' + year).slice(-4);
    let month = (today.getMonth() + 1).toString();
    month = ('00' + month).slice(-2);
    let date = today.getDate().toString();
    date = ('00' + date).slice(-2);

    let returnDate = '';
    if (format) {
        const lowerFormat = format.toLowerCase();
        returnDate = lowerFormat.replace('yyyy', year).replace('mm', month).replace('dd', date);
    } else {
        returnDate = year + '' + month + '' + date;
    }

    return returnDate;
}

// 시간 가져오기
export const getTime = (h, m, s, format) => {
    const today = new Date();

    h ? today.setHours(today.getHours() + h) : null;
    m ? today.setMinutes(today.getMinutes() + m) : null;
    s ? today.setSeconds(today.getSeconds() + s) : null;
    
    let hour = today.getHours().toString();
    hour = ('00' + hour).slice(-2);
    let minute = (today.getMinutes() + 1).toString();
    minute = ('00' + minute).slice(-2);
    let seconds = today.getSeconds().toString();
    seconds = ('00' + seconds).slice(-2);
    
    let returnTime = '';
    if (format) {
        const lowerFormat = format.toLowerCase();
        if (lowerFormat.indexOf('24hh') > -1) {
            returnTime = lowerFormat.replace('24hh', hour).replace('mm', minute).replace('ss', seconds);
        } else {
            hour = hour > 12 ? hour - 12 : hour;
            hour = ('00' + hour).slice(-2);
            returnTime = lowerFormat.replace('hh', hour).replace('mm', minute).replace('ss', seconds);
        }
    } else {
        returnTime = hour + '' + minute + '' + seconds;
    }

    return returnTime;
}