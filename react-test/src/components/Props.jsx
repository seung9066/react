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
    const [showProps, setShowProps] = useState(false);

    const clkBtn = () => {
        console.log(props);
        // showProps의 true/false 여부로 화면상에 보여줄지 말지 정할 수 있다.
        setShowProps(true);
    }

    return (
        <>
            <button 
                onClick={clkBtn}>props test</button>
            {showProps && <PropsTest2 name={props.obj.name} age={props.obj.age} />}
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
            <p>Name : {name}</p>
            <p>Age : {age}</p>
        </>
    )
}

export default PropsTest;