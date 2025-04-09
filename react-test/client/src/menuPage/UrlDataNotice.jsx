import { useEffect, useRef, useState } from "react";

function UrlDataNotice ( props ) {
    const [iframeHeight, setIframeHeight] = useState("100px"); // 기본 높이
    const iframeRef = useRef(null);

    useEffect(() => {
        let param = new URLSearchParams(location.search);

        // props.props.urlDataNotice가 있으면 url에 넣어준다.
        if (props.props.urlDataNotice) {
            param.set('data', props.props.urlDataNotice);
            history.pushState(null, null, '?' + param.toString());
        }
        
        // props.props.urlDataNotice가 없으면 url에 있는 값을 가져온다.
        if (param.get('data')) {
            props.props.setUrlDataNoticeData(param.get('data'));
            history.pushState(null, null, '?' + param.toString());
        }

        const handleMessage = (event) => {
            // 내부 iframe 창 크기
            if (event.data.height) {
              setIframeHeight((event.data.height + 100) + "px");
            }

            // iframe에서 보낸 toast
            if (event.data.toast) {
                showToast(event.data.toast);
            }

            // iframe에서 보낸 data
            if (event.data.data || event.data.data === '') {
                let data = event.data.data;
                if (data !== '') {
                    param.set('data', data);
                } else {
                    param.delete('data');
                }
                props.props.setUrlDataNoticeData(data);
                history.pushState(null, null, '?' + param.toString());

                // 자식에게 해당 메시지 보내면 그리드랑 이미지 그림
                const message = { data: data };

                iframeRef.current.contentWindow.postMessage(message, "*");
            }

            if (event.data.getData) {
                getUrlDataNotice();
            }

            if (event.data.saveData) {
                saveData(param.get('data'));
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    const showToast = (msg) => {
        props.props.toastRef.current.showToast(msg);
    }
    
    // server에서 정보 가져오기
    const getUrlDataNotice = async () => {
        try {
            const res = await fetch('/api/urlDataNotice/getData');
            if (!res.ok) {
                throw new Error('서버 응답 오류');
            }
    
            const data = await res.json();
            let param = new URLSearchParams(location.search);
            param.set('data', data.data);
            props.props.setUrlDataNoticeData(param.get('data'));
            history.pushState(null, null, '?' + param.toString());

            // 자식에게 해당 메시지 보내면 그리드랑 이미지 그림
            const message = { data: data };
            iframeRef.current.contentWindow.postMessage(message, "*");

            showToast('데이터 로드 완료');
        } catch (err) {
            showToast("데이터 로드 실패 ", err);
        }
    };

    // server에 정보 저장
    const saveData = async (urlData) => {
        try {
            const res = await fetch('/api/urlDataNotice/updateData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({data: urlData}),
            });
    
            if (!res.ok) {
                throw new Error('서버 응답 오류');
            }
    
            const data = await res.json();
            showToast(data.message);
        } catch (err) {
            showToast("저장 실패 ", err);
        }
    };

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

export default UrlDataNotice;