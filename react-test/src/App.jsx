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

import Menu from '@components/Menu'
import ScrollToTopButton from '@components/TopBtn'
import ToastAlert from "@components/ToastAlert";

// components 폴더 내의 모든 .jsx 파일을 비동기로 가져오는 객체 생성
const modules = import.meta.glob('./menuPage/*.jsx');

function App() {
  const toastRef = useRef(null);
  const [menuNm, setMenuNm] = useState('React');
  const [urlDataNotice, setUrlDataNoticeData] = useState('');
  const getMenuNm = (value) => {
    setMenuNm(value);
  };

  let propsData = {
                  name : 'nameData'
                  , age : 'ageData'
                  }

  let props = {
    toastRef: toastRef,
    urlDataNotice: urlDataNotice,
    setUrlDataNoticeData: setUrlDataNoticeData,
    propsData: propsData,
  }

  // 동적으로 불러온 컴포넌트들을 저장할 state
  const [components, setComponents] = useState([]);

  useEffect(() => {
      // 컴포넌트 동적 로딩 함수
      const loadComponents = async () => {
          // modules 객체의 각 파일을 import() 해서 default export만 추출
          const loaded = await Promise.all(
              Object.entries(modules).map(async ([path, importer]) => {
                  const mod = await importer();
                  return mod.default;
              })
          );

          // 추출한 컴포넌트 배열로 상태 설정
          setComponents(loaded);
      };

      loadComponents();
  }, []);
  
  return (
    <>
    <BrowserRouter>
      <ToastAlert ref={toastRef} />
      <div className="App">
        <div>
          <Menu getMenuNm={getMenuNm}/>
        </div>
        <div style={{ marginTop: "60px", textAlign: "center" }}>
          <GetTime />
          <h1>{menuNm}</h1>
        </div>
      </div>
      <div className="container">
        <Routes>
          {/* 컴포넌트 동적 생성 */}
          { components.map((Component) => {
            let pathName = Component.name;
            pathName = pathName.charAt(0).toLowerCase() + pathName.slice(1);
            pathName === "main" ? pathName = "" : null;
            return <Route path={pathName} element={ <Component props={props} /> } />
          })}
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
