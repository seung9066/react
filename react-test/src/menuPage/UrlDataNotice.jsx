import { useEffect, useRef, useState } from "react";

function UrlDataTest ({ urlDataNotice, setUrlDataNotice }) {
    const [iframeHeight, setIframeHeight] = useState("100px"); // 기본 높이
    const iframeRef = useRef(null);

    useEffect(() => {
        let param = new URLSearchParams(location.search);

        if (urlDataNotice) {
            param.set('data', urlDataNotice);
            history.pushState(null, null, '?' + param.toString());
        }

        if (param.get('data')) {
            setUrlDataNotice(param.get('data'));
        }

        const handleMessage = (event) => {
            if (event.data.height) {
              setIframeHeight((event.data.height + 100) + "px");
            }

            if (event.data.data || event.data.data === '') {
                let data = event.data.data;
                if (data !== '') {
                    param.set('data', data);
                } else {
                    param.delete('data');
                }
                setUrlDataNotice(data);
                history.pushState(null, null, '?' + param.toString());

                // 자식에게 해당 메시지 보내면 그리드랑 이미지 그림
                const message = { data: data };

                iframeRef.current.contentWindow.postMessage(message, "*");
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    return (
        <>
            <iframe ref={iframeRef} src="../src/menuPage/urlToDataNoticePaging.html" width={"100%"} height={iframeHeight} style={{ border: "none" }} onLoad={() => {
                if (iframeRef.current) {
                    iframeRef.current.contentWindow.postMessage("getHeight", "*");
                }
            }} />
        </>
    )
}

export default UrlDataTest;