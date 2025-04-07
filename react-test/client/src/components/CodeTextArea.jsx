import { useState, useEffect, useRef } from 'react';

function CodeTextArea ({ code }) {
    const codeText = useRef(null);
    useEffect(() => {
        const codeTextarea = codeText.current;
        codeTextarea.style.height = "auto";
        codeTextarea.style.height = codeTextarea.scrollHeight + "px";
    }, [code]);

    return (
        <>
            <textarea ref={codeText} value={code} readOnly className='code'/>
        </>
    )
}

export default CodeTextArea;