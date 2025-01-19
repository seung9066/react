import { useState } from "react"

/**
 * props
 * 
 * 컴포넌트 간 데이터 전달
 * 읽기 전용으로 자식 컴포넌트에서 직접 props 수정 불가능
 * 객체의 형태로 key-value 구조
 */
function PropsTest(props) {
    // 화면 표시 여부를 위한 useState
    const [showProps1, setShowProps1] = useState(false);
    const [showProps2, setShowProps2] = useState(false);

    const clkBtn1 = () => {
        // showProps의 true/false 여부로 화면상에 보여줄지 말지 정할 수 있다.
        if (showProps1) {
            setShowProps1(false);
        } else {
            setShowProps1(true);
        }
    }

    const clkBtn2 = () => {
        // showProps의 true/false 여부로 화면상에 보여줄지 말지 정할 수 있다.
        if (showProps2) {
            setShowProps2(false);
        } else {
            setShowProps2(true);
        }
    }

    return (
        <>
            <p>컴포넌트 간 데이터 전달</p>
            <p>읽기 전용으로 자식 컴포넌트에서 직접 props 수정 불가능</p>
            <p>객체의 형태로 key-value 구조</p>
            <p>부모 컴포넌트에서 자식 컴포넌트를 부를 때 태그 안에 담아준다</p>
            <br />
            <button 
                onClick={clkBtn1}>props</button>
            <p>하나의 객체로 보낼 때</p>
            <p>부모 컴포넌트 내부 : {'<'}Props obj={'{'}propsData{'}'} /{'>'}</p>
            <p>자식 컴포넌트 : function PropsTest(props) {'{ }'}</p>
            {showProps1 && <PropsTest1 props={props} />}
            <br />
            <button 
                onClick={clkBtn2}>props 구조 분해 할당</button>
            <p>각각의 객체 명으로 보낼 때 자식 컴포넌트에 명칭을 같게 하면 각각 받을 수 있다.</p>
            <p>이 때 꼭 중괄호로 씌워줘야 한다.</p>
            <p>부모 컴포넌트 내부 : {'<'}Props name={'{'}name{'}'} age={'{'}age{'}'} /{'>'}</p>
            <p>자식 컴포넌트 : function PropsTest({'{'} name, age {'}'}) {'{ }'}</p>
            {showProps2 && <PropsTest2 name={props.obj.name} age={props.obj.age} />}
            <br />
            <p>자식 컴포넌트에서 부모 컴포넌트로 전달하는 방법</p>
            <p>부모 컴포넌트에서 자식 컴포넌트에 setState 함수를 보낸다.</p>
            <p>자식 컴포넌트에서 해당 setState 함수를 통해 부모의 state를 바꿀 수 있다.</p>
            <p>부모 컴포넌트</p>
            <p>const getMenuNm = (x) ={'>'} {'{'}setMenuNm(x);{'}'}; // x는 any</p>
            <p>{'<'}Props getMenuNm={'{'}getMenuNm{'}'} /{'>'}</p>
            <p>자식 컴포넌트</p>
            <p>function PropsTest({'{'} getMenuNm {'}'}) {'{ }'}</p>

        </>
    )
}

function PropsTest1(props) {
    return (
        <>
            <p>console.log(props) ={'>'} {'{'}obj : {'{'}name : nameData, age : ageData{'}'}{'}'}</p>
        </>
    )
}

/**
 * props 구조 분해 할당
 * 
 * 받아온 key와 매개변수 명을 맞추면 지정하여 사용이 가능하다.
 */
function PropsTest2({ name, age }) {
    return (
        <>
            <p>console.log(props) ={'>'} {'{'}name : nameData, age : ageData{'}'}</p>
        </>
    )
}

export default PropsTest;