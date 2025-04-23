import { useEffect, useState } from 'react';

import '@css/TicTacToe.css';

function TicTacToe ( props ) {
    // 칸 수
    const [size, setSize] = useState(3);
    // 플레이어 O, X
    const [palyer, setPlayer] = useState('O');
    // 게임 값
    const [gameState, setGameState] = useState(Array(9).fill(null));
    // 승리 조건
    const [win, setWin] = useState(howToWin(size));
    // 승리자
    const [winner, setWinner] = useState(null);

    // 게임 칸 클릭
    const clickTd = (e) => {
        if (!winner) {
            // 승자, 무승부가 아닌 경우
            const index = parseInt(e.target.id);
            if (gameState[index]) {
                props.props.toastRef.current.showToast("이미 선택된 칸입니다.");
                return;
            }
            
            // 칸 칠하기
            const newGameState = [...gameState];
            newGameState[index] = palyer;
            setPlayer(palyer === 'O' ? 'X' : 'O');
            setGameState(newGameState);
        } else {
            winner === "무승부" ? props.props.toastRef.current.showToast("무승부 초기화 버튼을 눌러주세요.") : props.props.toastRef.current.showToast(winner + "승리! 초기화 버튼을 눌러주세요.");
        }
    }

    // 게임 초기화
    const resetGame = () => {
        // 칸 초기화
        setGameState(Array(9).fill(null));
        // 플레이어 초기화
        setPlayer('O');
        // 승리자 초기화
        setWinner(null);
        // 승리 조건 초기화
        setWin(howToWin(size));
    }

    useEffect(() => {
        let OWin = 0;
        let XWin = 0;
        let chkSize = Number(size);
        // 승리 조건 확인
        for (const item of win) {
            OWin = 0;
            XWin = 0;
            for (const i of item) {
                gameState[i] === null ? (OWin--, XWin--) : null;
                gameState[i] === 'O' ? OWin++ : gameState[i] === 'X' ? XWin++ : null;
            }
            OWin === chkSize ? (props.props.toastRef.current.showToast("O 승리!"), setWinner("O")) : null;
            XWin === chkSize ? (props.props.toastRef.current.showToast("X 승리!"), setWinner("X")) : null;
        }
        
        // 무승부 확인
        let draw = 0;
        for (const item of gameState) {
            if (item === null) {
                draw++;
            }
        }
        if (draw === 0 && winner === null) {
            setWinner("무승부");
            props.props.toastRef.current.showToast("무승부!");
        }

    }, [gameState]);

    useEffect(() => {
        // 칸 수 변경 시 게임 초기화
        resetGame();
    }, [size])

    return (
        <>
            <div>
                <button type='button' className="button danger" onClick={resetGame}>초기화</button>
                <select className='custom-select' onChange={(e) => setSize(e.target.value)} value={size}>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            </div>
            <div>
                <table className="ticTacToeTable">
                    <tbody>
                        {Array.from({ length: size }, (_, rowIndex) => (
                            <tr key={rowIndex}>
                                {Array.from({ length: size }, (_, colIndex) => {
                                    const index = rowIndex * size + colIndex;
                                    return (
                                        <td key={colIndex} onClick={clickTd} id={index}>
                                            {gameState[index]}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

function howToWin(getSize) {
    const combinations = [];

    // 가로 승리 조건
    for (let row = 0; row < getSize; row++) {
        let colArr = [];
        for (let col = 0; col < getSize; col++) {
            colArr.push(row * getSize + col);
        }
        combinations.push(colArr);
    }

    // 세로 승리 조건
    for (let col = 0; col < getSize; col++) {
        let rowArr = [];
        for (let row = 0; row < getSize; row++) {
            rowArr.push(col + getSize * row);
        }
        combinations.push(rowArr);
    }

    // 왼쪽 위 ➝ 오른쪽 아래 대각선
    let diagArr1 = [];
    for (let i = 0; i < getSize; i++) {
        diagArr1.push(i * (getSize + 1));
    }
    combinations.push(diagArr1);

    // 오른쪽 위 ➝ 왼쪽 아래 대각선
    let diagArr2 = [];
    for (let i = 1; i <= getSize; i++) {
        diagArr2.push(i * (getSize - 1));
    }
    combinations.push(diagArr2);

    return combinations;
}

export default TicTacToe;