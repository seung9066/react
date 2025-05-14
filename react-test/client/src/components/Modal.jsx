import { useState, useEffect } from 'react';

function Modal({ isOpen, onClose, closeBtn, children, onConfirm, title }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'; // 스크롤 막기
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = ''; // 모달 unmount 시 원복
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div style={backdropStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <div style={contentStyle}>
                    <h2>{title}</h2>
                    {children}
                    {onConfirm && <button type='button' className='button' onClick={onConfirm} style={closeBtnStyle}>확인</button>}
                    {closeBtn !== false && <button type='button' className='button' onClick={onClose} style={closeBtnStyle}>닫기</button>}
                </div>
            </div>
        </div>
    );
}

const backdropStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
};

const modalStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '80vw',         // 최대 너비
    maxHeight: '80vh',        // 최대 높이
    overflow: 'hidden',       // 전체 모달 바깥으로는 안 넘치게
    minWidth: '600px',
    minHeight: '200px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
};

const contentStyle = {
    overflow: 'auto',         // ✅ 내용이 넘칠 경우 스크롤
    flex: 1,                  // 남은 공간 꽉 채움
};

const closeBtnStyle = {
    marginTop: '20px'
};

export default Modal;
