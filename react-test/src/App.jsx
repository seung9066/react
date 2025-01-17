/* eslint-disable */
// warning 메시지 안 뜨게 해준다. (error : 에러, warning : 권장사항)

/**
 * useState, useEffect
 * 
 * 컴포넌트 렌더링 시 특정 작업을 실행할 수 있도록 하는 Hook
 * useState : 데이터 변동시 html 자동 렌더링 된다.
 * useEffect : side effect, 라이프사이클 훅(componentDidMount, componentDidUpdate, componentWillUnmount)
 */
import { useState, useEffect } from 'react'
import './App.css'
import Customer from '@components/customer/Customer'
import Props from '@components/Props'

function App() {
  let propsData = {
                  name : 'nameData'
                  , age : 'ageData'
                  }
  
  return (
    <>
      <div className="App">
        <div>
          <h1>Hello World!</h1>
          <GetTime />
          <ClickBtn />
          <Props obj={propsData} />
          <Customer />
        </div>
      </div>
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
      <p>현재시간</p>
      <p>{time}</p>
    </>
  )
}

/**
 * Array, Object 타입 (reference data type)
 * 
 * 데이터는 ram에 저장되고 변수에 저장되는 것은 죄표
 * arrData[0] = 'changedData' 와 같은 방식 불가능
 * 해보니까 작동은 하는데 딜레이가 생김
 * 
 * 원본 데이터는 남겨두는 것이 좋아 새로운 변수에 담아서 값을 바꾼다.
 * let newArrData = [...arrData] ...괄호를 벗기다 [] 다시 괄호를 씌우다
 * 새로운 데이터에 새로운 좌표를 지정하는 방식
 */
function ClickBtn() {
  const [arrData, setArrData] = useState(['data1', 'data2', 'data3']);

  const clkBtn = () => {
    let newArrData = [...arrData];
    newArrData[0] = 'changedData';
    setArrData(newArrData);
  };

  return (
    <button
      onClick={() => {
          clkBtn()
        }}>{arrData[0]}</button>
  )
}

export default App
