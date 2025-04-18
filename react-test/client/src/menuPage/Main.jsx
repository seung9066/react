import RunawayButton from '@components/RunawayButton'

function Main ( props ) {
    const goToGithub = () => {
        window.location.href = 'https://github.com/seung9066/react';
    }

    return (
        <>
            <h2 onClick={goToGithub}>https://github.com/seung9066/react</h2>
            <RunawayButton toastRef={props.props.toastRef} msg={'ㅋㅋ 오소이(느리다는 뜻)'} />
        </>
    )
}

export default Main;