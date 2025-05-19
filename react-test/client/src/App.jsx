/* eslint-disable */
// warning 메시지 안 뜨게 해준다. (error : 에러, warning : 권장사항)

/**
 * useState, useEffect
 * 
 * 컴포넌트 렌더링 시 특정 작업을 실행할 수 있도록 하는 Hook
 * useState : 데이터 변동시 html 자동 렌더링 된다.
 * useEffect : side effect, 라이프사이클 훅(componentDidMount, componentDidUpdate, componentWillUnmount)
 */
import { useEffect, useState, useRef } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'

import * as utils from '@utils';

import Menu from '@components/Menu';
import ScrollToTopButton from '@components/TopBtn';
import ToastAlert from "@components/ToastAlert";
import AdminPage from '@components/AdminPage';

import NotFound from "@components/NotFound";

// components 폴더 내의 모든 .jsx 파일을 비동기로 가져오는 객체 생성
const modules = import.meta.glob('./menuPage/*.jsx');
const modules2 = import.meta.glob('./menuPage/*/*.jsx');

function App() {
  const toastRef = useRef(null);
  const [menuData, setMenuData] = useState([]);
  const [menuNm, setMenuNm] = useState('React');
  const [urlDataNotice, setUrlDataNoticeData] = useState('');
  const [sessionUserAuth, setSessionUserAuth] = useState('');

  const getMenuNm = (value) => {
    setMenuNm(value);
  };

  let propsData = {
                  name : 'nameData'
                  , age : 'ageData'
                  }

  let props = {
    urlDataNotice: urlDataNotice,
    setUrlDataNoticeData: setUrlDataNoticeData,
    propsData: propsData,
  }
  
  // 동적으로 불러온 컴포넌트들을 저장할 state
  const [components, setComponents] = useState([]);
  
  useEffect(() => {
      // 컴포넌트 동적 로딩 함수
      const loadComponents = async () => {
          const totalModules = Object.assign({}, modules, modules2);
          // modules 객체의 각 파일을 import() 해서 default export만 추출
          const loaded = await Promise.all(
              Object.entries(totalModules).map(async ([path, importer]) => {
                  const mod = await importer();
                  return {
                    component : mod.default,
                    path
                  };
              })
          );

          // 추출한 컴포넌트 배열로 상태 설정
          setComponents(loaded);
      };

      loadComponents();

      getMenu();

      // 토스트 전역등록
      window.toastRef = toastRef;
  }, []);

  // server에서 메뉴 정보 가져오기
  const getMenu = async () => {
    utils.getAxios('/menu/getMenu').then((res) => {
        if (res.msg === 'success') {
            let data = res.data;
            
            const transformDataToTree = (data) => {
              const map = new Map();
              const roots = [];
          
              // 평면 데이터를 Map에 넣고, children 배열을 초기화
              data.forEach((item) => {
                  map.set(item.id, { ...item, children: [] });
              });
          
              // 각 노드에 대해 upId를 기준으로 부모-자식 관계 설정
              data.forEach((item) => {
                  const currentNode = map.get(item.id);
                  if (item.upId === null) {
                      roots.push(currentNode); // upId가 null인 노드는 루트로 추가
                  } else {
                      const parent = map.get(item.upId);
                      if (parent) {
                          parent.children.push(currentNode); // 부모 노드에 자식 추가
                      }
                  }
              });
          
              return roots;
            };
    
            let newData = transformDataToTree(data);
            setMenuData(newData);
        } else {
            utils.showToast('메뉴 목록을 가져오는 중 오류가 발생했습니다.', res.error);
        }
    });
  }

  const fncLogout = async () => {
    const resultLogout = await utils.logout();
    if (resultLogout.msg === 'success') {
      setSessionUserAuth('');
      utils.showToast('로그아웃 되었습니다.');
    }
  }

  return (
    <>
    <BrowserRouter>
      <ToastAlert ref={toastRef} />
      <div>
        <div>
          {menuData.length > 0 && <Menu getMenuNm={getMenuNm} menuData={menuData} setMenuData={setMenuData} sessionUserAuth={sessionUserAuth} setSessionUserAuth={setSessionUserAuth} props={props} />}
        </div>
        <div style={{ marginTop: "60px", display: "flex", justifyContent: "center", alignItems: "center", gap: "20px" }}>
          <GetTime />
          {sessionUserAuth &&
            <button type='button' className='button danger' onClick={(e) => {fncLogout()}}>로그아웃</button>
          }
        </div>
        <div>
          <h1>{menuNm}</h1>
        </div>
      </div>
      <div className="container">
        <Routes>
          {/* 컴포넌트 동적 생성 */}
          { components && components.map(({ component: Component, path}, idx) => {
            // pathName === "main" ? pathName = "" : null;
            let root = './menuPage';
            let pagePath = path?.substring(root.length).replace('.jsx', '')??'';
            let nextPagePath = (idx !== components.length - 1) ? components[idx + 1].path.substring(root.length).replace('.jsx', '') : '';

            pagePath === '' ? pagePath = nextPagePath : null;

            // 메뉴 권한 체크
            let pageAuth = '000';

            for (const item of menuData) {
              if (item.menuAuth) {
                const menuPath = (item.upPath || '') + item.path.toLowerCase() + (item.upPath ? '' : '/');
                const programPath = pagePath.toLowerCase();

                if (programPath.indexOf(menuPath) > -1) {
                  pageAuth = item.menuAuth;
                }
              }
            }

            return <Route path={pagePath} element={ <AdminPage auth={pageAuth} sessionUserAuth={sessionUserAuth} setSessionUserAuth={setSessionUserAuth} ><Component props={props} key={Component.name} setMenu={setMenuData} /></AdminPage> } key={Component.name + 'route'} />
          })}
          <Route path="*" element={<NotFound props={props} />} />
        </Routes>
      </div>
      <ScrollToTopButton />
    </BrowserRouter>
    </>
  )
}

/**
 * 컴포넌트 룰
 * 
 * 컴포넌트는 html 코드를 하나로 묶은 것
 * 
 * function은 메인 function 밖에 만든다.
 * function은 대문자로 시작한다. 
 * return안에 태그는 병렬로 적지 않는다. (병렬이 필요할 시 <></>로 전체를 감싸준다.)
 */
function GetTime() {
  const [time, setTime] = useState(new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());

  useEffect(() => {
    setTimeout(() => {
      setTime(() => {
        return new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
      })
    }, 1000);
  });

  return (
    <>
      <p>{time}</p>
    </>
  )
}

export default App
