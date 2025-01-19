import { useState } from "react";

import LifeCycleImg from '../img/lifecycle.png'

/**
 * 리액트 생명주기
 * 
 * useEffect : 라이프사이클 훅
 * 1. componentDidMount : 최초 랜더링 시 한번만 실행
 * 2. componentDidUpdate : 랜더링이 실행될 때마다 실행
 * 3. componentWillUnmount : 컴포넌트가 사라질 때 실행
 */
function LifeCycleHook() {
    // state 훅
    const [name, setName] = useState('');
    const [age, setAge] = useState();
  
    return (
      <>
        <div>
          <h4>생명주기 useEffect</h4>
        </div>
        <div>
          <img src={LifeCycleImg}/>
        </div>
        <div>
          <label> 이름 : &nbsp;
            <input type="text" onChange={ e => setName(e.target.value) } value={ name } /><br />
          </label>
          <label> 나이 : &nbsp;
            <input type="number" onChange={ e => setAge(e.target.value) } value={ age } /><br />
          </label>
        </div>
      </>
    )
  }

  export default LifeCycleHook;