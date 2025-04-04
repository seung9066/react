import { useState, useRef, useEffect } from "react";
import LifeCycleHook from '@page/study/LifeCycleHook'
import Props from '@page/study/Props'
import ReferenceDataType from '@page/study/ReferenceDataType'

function Study ( props ) {
    const [showStudy, setShowStudy] = useState();

    return (
        <>  
            <div>
                <button onClick={() => setShowStudy('lifeCycleHook')}>LifeCycleHook</button>
                <button onClick={() => setShowStudy('props')}>Props</button>
                <button onClick={() => setShowStudy('referenceDataType')}>ReferenceDataType</button>
            </div>
            <div>
                { showStudy === 'lifeCycleHook' && <LifeCycleHook /> }
                { showStudy === 'props' && <Props obj={props} /> }
                { showStudy === 'referenceDataType' && <ReferenceDataType /> }
            </div>
        </>
    )
}

export default Study;