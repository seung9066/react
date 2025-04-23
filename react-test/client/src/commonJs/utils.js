import axios from 'axios';

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
            if (item.id && ref.current.querySelector('label[' + item.id + ']')) {
                let innerText = ref.current.querySelector('label[' + item.id + ']').innerText;
                showToast(innerText + msg);
            } else if (item.placeholder) {
                showToast(item.placeholder + msg);
            }
            break;
        }
    }
}

// 토스트
export const showToast = (msg) => {
    window.toastRef?.current?.showToast(msg);
}