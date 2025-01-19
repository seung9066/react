import { useState } from "react";

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
function ReferenceDataType() {
  const [arrData, setArrData] = useState(['data1', 'data2', 'data3']);

  const clkBtn = () => {
    let newArrData = [...arrData];
    newArrData[0] = 'changedData';
    setArrData(newArrData);
  };

  return (
    <>
      <p>Array, Object 타입</p>
      <button
        onClick={() => {
          clkBtn()
        }}>{arrData[0]}</button>
    </>
  )
}

export default ReferenceDataType;