import axios from 'axios';

// server에서 사용자 정보 가져오기
export const getAxios = async (url, data) => {
    try {
        const res = await axios.get('/api' + url, {
            params: data,
        });
        if (res.status === 200) {
            return {msg : 'success', data : res.data};
        } else {
            return {msg : 'error', res};
        }
    } catch (error) {
        return {msg : 'error', error};
    }
};

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
            return {msg : 'error', res};
        }
    } catch (error) {
        return {msg : 'error', error};
    }
}