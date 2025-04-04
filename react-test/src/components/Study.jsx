import { useState, useRef, useEffect } from "react";
import LifeCycleHook from '@components/LifeCycleHook'
import Props from '@components/Props'
import ReferenceDataType from '@components/ReferenceDataType'

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