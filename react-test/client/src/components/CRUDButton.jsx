function CRUDButton({ CBtn, UBtn, DBtn, RBtn, etcBtn }) {
    return (
        <>
            <div className="form-button-group">
                {etcBtn && <button type="button" className="button etcBtn" disabled={ etcBtn.disabled } onClick={ etcBtn.fnc }>{etcBtn.name}</button>}
                {RBtn && <button type="button" className="button secondary" disabled={ RBtn.disabled } onClick={ RBtn.fnc }>초기화</button>}
                {CBtn && <button type="button" className="button accept" disabled={ CBtn.disabled } onClick={ CBtn.fnc }>등록</button>}
                {UBtn && <button type="button" className="button primary" disabled={ UBtn.disabled } onClick={ UBtn.fnc }>수정</button>}
                {DBtn && <button type="button" className="button danger" disabled={ DBtn.disabled } onClick={ DBtn.fnc }>삭제</button>}
            </div>
        </>
    )
}

export default CRUDButton;