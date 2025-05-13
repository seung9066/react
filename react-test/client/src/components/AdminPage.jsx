import { useState, useEffect, useRef } from 'react';
import * as utils from '@utils';

function AdminPage (props) {
    const loginFormRef = useRef(null);
    const resetUserData = {
        userId: '',
        userPw: '',
    }
    const [userData, setUserData] = useState(resetUserData);

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
        const loginAccept = await utils.login(userData, props.auth);
        loginAccept ? await getSessionAuthData() : null;
        setUserData(resetUserData);
    }

    const getSessionAuthData = async () => {
        const sessionAuth = await utils.getUserAuthSession() || '';
        props.setSessionUserAuth(sessionAuth);
    }

    useEffect(() => {
        if (Number(props.auth) > 1) {
            getSessionAuthData();
        }
    }, [props.auth]);

    return (
        <>
            {(Number(props.auth) > 1 && Number(props.sessionUserAuth) < Number(props.auth)) &&
                <>
                    <div ref={loginFormRef}>
                        <input type='text' placeholder='id' name='userId' className='input' value={userData.userId} onChange={inputChange} onKeyDown={enterKey}></input>
                        <br />
                        <br />
                        <input type='password' placeholder='password' name='userPw' className='input' value={userData.userPw} onChange={inputChange} onKeyDown={enterKey}></input>
                    </div>
                    <div>
                        <button type='button' className='button' onClick={login}>로그인</button>
                    </div>
                </>
            }
            {(Number(props.auth) <= 1 || Number(props.sessionUserAuth) >= Number(props.auth)) &&
                props.children
            }
        </>
    )
}

export default AdminPage;