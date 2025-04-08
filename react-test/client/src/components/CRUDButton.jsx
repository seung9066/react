function CRUDButton({ CBtn, UBtn, DBtn, RBtn, etcBtn }) {
    return (
        <>
            <div className="form-button-group">
                {etcBtn && <button type="button" className="etcBtn" disabled={ etcBtn.disabled } onClick={ etcBtn.fnc }>{etcBtn.name}</button>}
                <button type="button" className="secondary" disabled={ RBtn.disabled } onClick={ RBtn.fnc }>초기화</button>
                <button type="button" className="accept" disabled={ CBtn.disabled } onClick={ CBtn.fnc }>등록</button>
                <button type="button" className="primary" disabled={ UBtn.disabled } onClick={ UBtn.fnc }>수정</button>
                <button type="button" className="danger" disabled={ DBtn.disabled } onClick={ DBtn.fnc }>삭제</button>
            </div>
        </>
    )
}

export default CRUDButton;