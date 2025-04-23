import { useState } from 'react';

function Lotto () {
    const [totalArr, setTotalArr] = useState([]);
    const [avgNumDiv, setAvgNumDiv] = useState();

    const makeLotto = () =>{
        let num = [];

        for (let i = 1; i <= 45; i++) {
            num.push(i);
        }

        let chooseNumArr = [];
        for (let i = 0; i < 6; i++) {
            let chooseNum = Math.floor(Math.random() * num.length);
            let no = num[chooseNum];
            chooseNumArr.push(no);
            num.splice(chooseNum, 1);
        }

        totalArr.push(chooseNumArr);
    }

    const runAvg = () => {
        let count = 100000;
        setTotalArr([]);
        
        for (let i = 0; i < count; i++) {
            makeLotto();
        }
        
        getAvg();
    
    }

    const getAvg = () =>{
        let score = [];
        for (let i = 1; i <= 45; i++) {
            score.push({n : i, s : 0});
        }

        let newTotalArr = [...totalArr];

        for (const item of newTotalArr) {
            for (const itemArr of item) {
                score[itemArr - 1].s = score[itemArr - 1].s + 1;
            }
        }

        setTotalArr([]);

        let txt = "";
        txt = sortMax(score);
        txt += "<br/>";
        txt += sortAvg(score);
        txt += "<br/>";
        txt += sortMin(score);
                    
        setAvgNumDiv(txt);
    }

    const sortMax = (arr) => {
        let newArr = [...arr];
        newArr.sort((a, b) => b.s - a.s);

        let lastArr = [];
        let chkLenght = 6;
        for (const item of newArr) {
            if (chkLenght != 0) {
                lastArr.push(item);
                chkLenght--;
            }
        }
        
        lastArr.sort((a, b) => a.n - b.n);
        
        let txt = "<h2>";
        txt += "최다출현";
        txt += "</h2>";
        
        txt += makePTag(lastArr);

        return txt;
    }
    
    const sortAvg = (arr) => {
        let newArr = [...arr];
        newArr.sort((a, b) => a.s - b.s);

        let lastArr = [];
        let chkLenght = 6;
        for (let i = 18; i < 24; i++) {
            lastArr.push(newArr[i]);
        }
        
        lastArr.sort((a, b) => a.n - b.n);
        
        let txt = "<h2>";
        txt += "중간출현";
        txt += "</h2>";
        
        txt += makePTag(lastArr);

        return txt;
    }
    
    const sortMin = (arr) => {
        let newArr = [...arr];
        newArr.sort((a, b) => a.s - b.s);

        let lastArr = [];
        let chkLenght = 6;
        for (const item of newArr) {
            if (chkLenght != 0) {
                lastArr.push(item);
                chkLenght--;
            }
        }
        
        lastArr.sort((a, b) => a.n - b.n);
        
        let txt = "<h2>";
        txt += "최소출현";
        txt += "</h2>";

        txt += makePTag(lastArr);
        
        return txt;
    }

    const makePTag = (arr) => {
        let lastArr = [...arr];

        let txt = "<p>";
        for (const item of lastArr) {
            txt += " <span style='color: black; font-weight: bold;'>";
            if (item.n < 10) {
                txt += "0";
            }
            txt += item.n;
            txt += "</span>";
            
            txt += " <span style='color: gray;'>";
            txt += "(";
            if (item.s < 10) {
                txt += "0";
            }
            txt += item.s;
            txt += "회)";
        }
        txt += "</p>";

        return txt;
    }

    return (
        <>
            <div>
                <button type='button' onClick={runAvg}>십만번 돌리기</button>
                <div dangerouslySetInnerHTML={{ __html: avgNumDiv }} style={{ marginTop: "10%" }}></div>
            </div>
        </>
    )
}

export default Lotto;