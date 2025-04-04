import { useState } from "react";

import CodeTextArea from "@components/CodeTextArea";

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
    let codeContent = `
    const [arrData, setArrData] = useState(['data1', 'data2', 'data3']);
    const clkBtn = () => {
    // 원본 데이터는 남겨두는 것이 좋아 새로운 변수에 담아서 값을 바꾼다.
    let newArrData = [...arrData];
    // 주소값이 바껴 다른 데이터로 취급
    setArrData(newArrData);
    }; `

    const [arrData, setArrData] = useState(['data1', 'data2', 'data3']);
    const [code, setCode] = useState(codeContent);

    const clkBtn = () => {
        if (code === codeContent) {
            setCode('false');
        } else {
            setCode(codeContent);
        }
    };

    return (
        <>
          <div className="textDiv">
              <p>Array, Object 타입</p>
              <p>데이터는 ram에 저장되고 변수에 저장되는 것은 해당 데이터의 주소이다.</p>
              <p>직접 데이터를 바꾸는 것이 불가능하여 {'['}...arr{']'} ...으로 배열을 초기화하여 다시 배열로 감싸는 작업 필요</p>
              <CodeTextArea code={code} />
              <br />
              <button
                onClick={() => {
                  clkBtn()
                }}>console.log(arrData === newArrData)</button>
            </div>
        </>
    )
}

export default ReferenceDataType;