import { useState, useEffect } from 'react'
import * as utils from '@utils';

import SggGridReact from '@components/SggGridReact';

function Crawling( props ) {
    // 권한 목록
    const getCrawling = async () => {
        utils.getAxios('/crawling/crawl').then((res) => {
            if (res.msg === 'success') {
                let data = res.data;
                console.log(data);
            } else {
                utils.showToast('권한 목록을 가져오는 중 오류가 발생했습니다.', res.error);
            }
        });
    }
    
    useEffect(() => {
        getCrawling();
    }, [])
    return (
        <>
        </>
    );
}

export default Crawling;
