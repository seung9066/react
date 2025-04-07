import { useState } from "react";

import LifeCycleImg from '@img/lifecycle.png'

/**
 * 리액트 생명주기
 * 
 * useEffect : 라이프사이클 훅
 * 1. componentDidMount : 최초 랜더링 시 한번만 실행
 * 2. componentDidUpdate : 랜더링이 실행될 때마다 실행
 * 3. componentWillUnmount : 컴포넌트가 사라질 때 실행
 */
function LifeCycleHook() {
  
  return (
      <>
        <div>
          <h4>생명주기 useEffect</h4>
        </div>
        <div>
          <img src={LifeCycleImg}/>
        </div>
      </>
    )
  }

  export default LifeCycleHook;