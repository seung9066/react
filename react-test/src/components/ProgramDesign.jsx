import { useState, useRef, useEffect } from "react";

function UrlDataTest () {
    const [iframeHeight, setIframeHeight] = useState("100px"); // 기본 높이
    const iframeRef = useRef(null);

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data.height) {
                setIframeHeight((event.data.height + 100) + "px");
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    return (
        <>
            <iframe ref={iframeRef} src="../src/components/programDesign.html" width={"100%"} height={iframeHeight} style={{ border: "none" }} onLoad={() => {
                if (iframeRef.current) {
                    iframeRef.current.contentWindow.postMessage("getHeight", "*");
                }
            }} />
        </>
    )
}

export default UrlDataTest;