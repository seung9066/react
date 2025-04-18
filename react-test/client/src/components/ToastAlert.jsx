import { useState, useImperativeHandle, forwardRef, useEffect } from "react";
import '@css/ToastAlert.css';

const ToastAlert = forwardRef((props, ref) => {
    const [toasts, setToasts] = useState([]);

    // 부모 컴포넌트에서 showToast 호출 가능하도록 설정
    useImperativeHandle(ref, () => ({
        showToast(message, consoleMessage) {
            setToasts(prev => [...prev, { id: Date.now(), message }]);

            if (consoleMessage) {
                console.log(consoleMessage); // 콘솔에 메시지 출력
            }
        }
    }));

    useEffect(() => {
        if (toasts.length === 0) return; // 토스트가 없으면 실행 X

        const timers = toasts.map(toast =>
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== toast.id)); // 개별적으로 제거
            }, 1000) // 1초 후 제거
        );

        return () => timers.forEach(timer => clearTimeout(timer)); // 정리(cleanup)
    }, [toasts]); // 토스트 배열이 변경될 때마다 실행

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className="toast show">
                    {toast.message}
                </div>
            ))}
        </div>
    );
});

export default ToastAlert;
