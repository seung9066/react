import { useState } from "react"

import CodeTextArea from "@components/CodeTextArea";

import '@css/Props.css'

/**
 * props
 * 
 * 컴포넌트 간 데이터 전달
 * 읽기 전용으로 자식 컴포넌트에서 직접 props 수정 불가능
 * 객체의 형태로 key-value 구조
 */
function Props(props) {
    // 화면 표시 여부를 위한 useState
    const [showProps1, setShowProps1] = useState(false);
    const [showProps2, setShowProps2] = useState(false);

    const [iptNm, setIptNm] = useState("before");

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
            <div className='textDiv'>
                <p>컴포넌트 간 데이터 전달</p>
                <p>읽기 전용으로 자식 컴포넌트에서 직접 props 수정 불가능</p>
                <p>객체의 형태로 key-value 구조</p>
                <p>부모 컴포넌트에서 자식 컴포넌트를 부를 때 태그 안에 담아준다</p>
            </div>
            <div className='textDiv'>
                <h2>Props</h2>
                <p>하나의 객체로 보낼 때</p>
                <CodeTextArea code={returnCode(1)} />
                <button 
                    onClick={clkBtn1}>console.log(props)</button>
                {showProps1 && <PropsTest1 props={props} />}
            </div>
            <div className='textDiv'>
                <h2>props 구조 분해 할당</h2>
                <p>각각의 객체 명으로 보낼 때 자식 컴포넌트에 명칭을 같게 하면 각각 받을 수 있다.</p>
                <p>이 때 꼭 중괄호로 씌워줘야 한다.</p>
                <CodeTextArea code={returnCode(2)} />
                <button 
                    onClick={clkBtn2}>console.log(name, age)</button>
                {showProps2 && <PropsTest2 name={props.props.propsData.name} age={props.props.propsData.age} />}
            </div>
            <div className='textDiv'>
                <h2>자식 {'>'} 부모</h2>
                <p>부모에서 setState 함수를 자식으로 넘겨서 자식에서 해당 함수로 부모의 state를 바꿀 수 있다.</p>
                <CodeTextArea code={returnCode(3)} />
                <ChgIptNm setIptNm={setIptNm}/>
                <input type="text" readOnly={true} value={iptNm}></input>
            </div>

        </>
    )
}

function PropsTest1(props) {
    let console1 = `
    {obj : {name : nameData, age : ageData}}
    `;

    return (
        <>
            <p>{console1}</p>
        </>
    )
}

/**
 * props 구조 분해 할당
 * 
 * 받아온 key와 매개변수 명을 맞추면 지정하여 사용이 가능하다.
 */
function PropsTest2({ name, age }) {
    let console2 = `
    nameData, ageData
    `;
    
    return (
        <>
            <p>{console2}</p>
        </>
    )
}

function ChgIptNm({ setIptNm }) {
    const clickBtn = (e) => {
        let btnNm = e.target.innerText;
        setIptNm(btnNm);
    };

    return (
        <button onClick={clickBtn} readOnly={true}>after</button>
    )
}

function returnCode(codeNm) {
    let code;

    if (codeNm == 1) {
        code = `
        부모 컴포넌트
        let propsData = {name : nameData
                        , age : ageData};
        return (
            <Props obj={propsData} />
        )
    
        자식 컴포넌트
        function PropsTest(props) {
            console.log(props);
        }
        `;
    }

    if (codeNm == 2) {
        code = `
        부모컴포넌트
        let name = 'nameData';
        let age = 'ageData';
        return (
            <Props name={name} age={age} />
        )
    
        자식컴포넌트
        function PropsTest({ name, age }) {
            console.log(name, age);
        }
        `;
    }

    if (codeNm == 3) {
        code = `
        부모컴포넌트
        const [iptNm, setIptNm] = newState("before");
        const chgIptNm = (x) => {
            setIptNm(x); // x : any    
        }

        return (
            <Props setBtnNm={chgIptNm} />
            <>
        )

        자식컴포넌트
        function PropsText({ chgIptNm }) {
            const clickBtn = (e) => {
                let btnNm = e.target.innerText;
                chgIptNm(btnNm);
            };

            return (
                <button onClick={clickBtn}>after</button>
            )
        }
        `;
    }

    return code;
}

export default Props;