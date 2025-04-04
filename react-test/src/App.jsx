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

import Main from '@page/Main'
import Study from '@page/Study'
import UrlDataNotice from '@page/UrlDataNotice'
import ProgramDesign from '@page/ProgramDesign'
import Lotto from '@page/MakeLotto'
import TicTacToe from '@page/TicTacToe'

function App() {
  const toastRef = useRef(null);
  const [menuNm, setMenuNm] = useState('React');
  const [urlDataNotice, setUrlDataNotice] = useState('');
  const getMenuNm = (value) => {
    setMenuNm(value);
  };

  let propsData = {
                  name : 'nameData'
                  , age : 'ageData'
                  }
  
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
          <Route path="/" element={ <Main toastRef={toastRef} /> } />
          <Route path="/study" element={ <Study obj={propsData} toastRef={toastRef} />} />
          <Route path="/ticTacToe" element={ <TicTacToe toastRef={toastRef} />} />
          <Route path="/urlDataNotice" element={ <UrlDataNotice urlDataNotice={urlDataNotice} setUrlDataNotice={setUrlDataNotice} toastRef={toastRef} />} />
          <Route path="/programDesign" element={ <ProgramDesign toastRef={toastRef} />} />
          <Route path="/lotto" element={ <Lotto toastRef={toastRef} />} />
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
