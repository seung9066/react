import { useState } from "react";

function ToastAlert({ msg }) {
    const [msgList, setMsgList] = useState([]);

    function showToast(message) {
        // 토스트 요소 생성
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = message;

        // 컨테이너에 추가
        toastContainer.current.appendChild(toast);

        // 자동 사라짐
        setTimeout(() => {
            toast.classList.add("hide");
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 1000);
    }

    return (
        <>
            <div className="toast-container" id="toast-container" ref={toastContainer} style={{ marginTop:"100px" }}>
                { msgList.map((item) => {
                    <div className="toast">
                        { item }
                    </div>
                }) }
            </div>
        </>
    )
}

export default ToastAlert;