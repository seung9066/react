import RunawayButton from '@components/RunawayButton'

function NotFound(props) {
  
  return (
    <>
      <RunawayButton toastRef={props.props.toastRef} msg={'잘못된 경로. 경로우대. 대머리.'} />
    </>
  );
}

export default NotFound;