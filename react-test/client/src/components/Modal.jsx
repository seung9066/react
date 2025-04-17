import React, { useState } from 'react';

function Modal({ isOpen, onClose, children, onConfirm, title }) {
    if (!isOpen) return null;

    return (
        <div style={backdropStyle}>
            <div style={modalStyle}>
                <h2>{title}</h2>
                {children}
                {onConfirm && <button onClick={onConfirm} style={closeBtnStyle}>확인</button>}
                <button onClick={onClose} style={closeBtnStyle}>닫기</button>
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
    minWidth: '500px',
    minHeight: '200px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
};

const closeBtnStyle = {
    marginTop: '20px'
};

export default Modal;
