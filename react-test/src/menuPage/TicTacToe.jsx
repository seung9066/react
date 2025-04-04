import { useEffect, useState } from 'react';

import '@css/TicTacToe.css';

function TicTacToe ({ toastRef }) {
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
            const index = parseInt(e.target.id);
            if (gameState[index]) {
                toastRef.current.showToast("이미 선택된 칸입니다.");
                return;
            }
            
            const newGameState = [...gameState];
            newGameState[index] = palyer;
            setPlayer(palyer === 'O' ? 'X' : 'O');
            setGameState(newGameState);
        } else {
            toastRef.current.showToast(winner + "승리! 초기화 버튼을 눌러주세요.");
        }
    }

    // 게임 초기화
    const resetGame = () => {
        setGameState(Array(9).fill(null));
        setPlayer('O');
        setWinner(null);
        setWin(howToWin(size));
    }

    useEffect(() => {
        for (const item of win) {
            let OWin = 0;
            let XWin = 0;
            for (const i of item) {
                gameState[i] === null ? (OWin--, XWin--) : null;
                gameState[i] === 'O' ? OWin++ : gameState[i] === 'X' ? XWin++ : null;
            }
            OWin === size ? (toastRef.current.showToast("O 승리!"), setWinner("O")) : null;
            XWin === size ? (toastRef.current.showToast("X 승리!"), setWinner("X")) : null;
        }
    }, [gameState]);

    useEffect(() => {
        setWin(howToWin(size));
    }, [size])

    return (
        <>
            <div>
                <button className="danger" onClick={resetGame}>초기화</button>
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

function howToWin(size) {
    const combinations = [];

    // 가로 승리 조건
    for (let row = 0; row < size; row++) {
        let colArr = [];
        for (let col = 0; col < size; col++) {
            colArr.push(row * size + col);
        }
        combinations.push(colArr);
    }

    // 세로 승리 조건
    for (let col = 0; col < size; col++) {
        let rowArr = [];
        for (let row = 0; row < size; row++) {
            rowArr.push(col + size * row);
        }
        combinations.push(rowArr);
    }

    // 왼쪽 위 ➝ 오른쪽 아래 대각선
    let diagArr1 = [];
    for (let i = 0; i < size; i++) {
        diagArr1.push(i * (size + 1));
    }
    combinations.push(diagArr1);

    // 오른쪽 위 ➝ 왼쪽 아래 대각선
    let diagArr2 = [];
    for (let i = 1; i <= size; i++) {
        diagArr2.push(i * (size - 1));
    }
    combinations.push(diagArr2);

    return combinations;
}

export default TicTacToe;