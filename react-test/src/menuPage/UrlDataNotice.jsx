import { useEffect, useRef, useState } from "react";

function UrlDataTest ({ urlDataNotice, setUrlDataNotice, toastRef }) {
    const [iframeHeight, setIframeHeight] = useState("100px"); // 기본 높이
    const iframeRef = useRef(null);

    useEffect(() => {
        let param = new URLSearchParams(location.search);

        // urlDataNotice가 있으면 url에 넣어준다.
        if (urlDataNotice) {
            param.set('data', urlDataNotice);
            history.pushState(null, null, '?' + param.toString());
        }

        // urlDataNotice가 없으면 url에 있는 값을 가져온다.
        if (param.get('data')) {
            setUrlDataNotice(param.get('data'));
        }

        const handleMessage = (event) => {
            // 내부 iframe 창 크기
            if (event.data.height) {
              setIframeHeight((event.data.height + 100) + "px");
            }

            // iframe에서 보낸 toast
            if (event.data.toast) {
                toastRef.current.showToast(event.data.toast);
            }

            // iframe에서 보낸 data
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