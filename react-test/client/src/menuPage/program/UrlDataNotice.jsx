import { useEffect, useRef, useState } from "react";
import { getAxios, postAxios } from '@utils';

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
                if (param.get('data')) {
                    saveData(param.get('data'));
                } else if (event.data.saveData){
                    saveData(event.data.saveData);
                } else {
                    showToast("저장할 데이터가 없습니다.");
                }
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    const showToast = (msg, consoleMsg) => {
        props.props.toastRef.current.showToast(msg, consoleMsg);
    }
    
    // server에서 정보 가져오기
    const getUrlDataNotice = async () => {
        getAxios('/urlDataNotice/getData').then((res) => {
            if (res.msg === 'success') {
                const data = res.data;
                let param = new URLSearchParams(location.search);
                param.set('data', data.data);
                props.props.setUrlDataNoticeData(param.get('data'));
                history.pushState(null, null, '?' + param.toString());

                // 자식에게 해당 메시지 보내면 그리드랑 이미지 그림
                const message = { data: data };
                iframeRef.current.contentWindow.postMessage(message, "*");

                showToast('데이터 로드 완료');
            } else {
                showToast('데이터 로드 실패', res.error);
            }
        });
    };

    // server에 정보 저장
    const saveData = async (urlData) => {
        postAxios('/urlDataNotice/updateData', {data: urlData}).then((res) => {
            if (res.msg === 'success') {
                const data = res.data;
                showToast(data.message);
            } else {
                showToast('저장 실패', res.error);
            }
        });
    };

    return (
        <>
            <iframe ref={iframeRef} src="../src/menuPage/program/urlToDataNoticePaging.html" width={"100%"} height={iframeHeight} style={{ border: "none" }} onLoad={() => {
                if (iframeRef.current) {
                    iframeRef.current.contentWindow.postMessage("getHeight", "*");
                }
            }} />
        </>
    )
}

export default UrlDataNotice;