import { useState, useEffect, useRef } from 'react';
import * as utils from '@utils';

function AdminPage (props) {
    const loginFormRef = useRef(null);
    const [userData, setUserData] = useState({
        userId: '',
        userPw: '',
    });

    const inputChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;

        setUserData({
            ...userData,
            [name]: value,
        })
    }

    const enterKey = (e) => {
        const key = e.key;
        const name = e.target.name;
        
        const ref = loginFormRef.current;

        if (key === 'Enter') {
            if (name === 'userId') {
                const userPw = ref.querySelector('[name="userPw"]');
                userPw.focus();
            }
            
            if (name === 'userPw') {
                login();
            }
        }
    }

    const login = async () => {
        await utils.getAxios('/login/login', userData).then((res) => {
            if (res.msg === 'success') {
                const data = res.data;

                if (data) {
                    const auth = data.userAuth;
                    const passwordCheck = data.passwordCheck;
                    
                    if (passwordCheck === 'Y') {
                        if (Number(auth) < Number(props.auth)) {
                            utils.showToast('권한 부족');
                        } else {
                            props.setUserData(data);
                        }
                    } else {
                        utils.showToast('비밀번호를 확인해주세요.');
                    }
                } else {
                    utils.showToast('아이디를 확인해주세요.');
                }

            } else {
                utils.showToast("로그인 실패", res.error);
            }
        });
    }

    return (
        <>
            {Number(props.userData.userAuth) < Number(props.auth) &&
                <>
                    <div ref={loginFormRef}>
                        <input type='text' placeholder='id' name='userId' value={userData.userId} onChange={inputChange} onKeyDown={enterKey}></input>
                        <br />
                        <br />
                        <input type='password' placeholder='password' name='userPw' value={userData.userPw} onChange={inputChange} onKeyDown={enterKey}></input>
                    </div>
                    <div>
                        <button type='button' className='button' onClick={login}>로그인</button>
                    </div>
                </>
            }
            {Number(props.userData.userAuth) >= Number(props.auth) &&
                props.children
            }
        </>
    )
}

export default AdminPage;