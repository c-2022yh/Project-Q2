//html 태그 읽어옴
const frameDiv = document.getElementById('frame');
const startButton = document.getElementById('startButton');
const correctSound = document.getElementById('audio1');
const wrongSound = document.getElementById('audio2');
const skipSound = document.getElementById('audio3');



//html 태그 읽어오는 변수를 미리 설정
var questionNumber;
var scoreP;
var quizDiv;
var answerDiv;
var hintDiv;
var inputText;
var timeCount;
var progressBar;

//인풋태그에 포커스 온 되어있는 지 확인할 변수
var chatfocus = 0;

//문제 출제에 사용 될 데이터리스트
//전체 문제 100문제 리스트
var dataList = [];
//실제 출제될 20문제 리스트
var questionList = new Array(20);
//비복원추출을 위한 리스트
var questionArray = [];

//몇번째 문제를 푸는 지 확인할 변수
var questionCount = 0;
//정답 맞힌 수
var score = 0;
//현재 문제 정답
var nowAnswer = "";
//타이머 조절 변수
let timer;

//정답을 입력할 수 있는 상태인지 확인할 변수
let canSubmitAnswer = 1;



//fetch API를 사용해 데이터를 가져옴
function setQuizData()
{
    const owner = 'c-2022yh'; //리포지토리 소유자 이름
    const repo = 'Project-Q2'; //리포지토리 이름
    const path = 'data.csv'; //파일 경로
    const branch = 'main'; //브랜치 이름
    //url 설정
    const url = `https://raw.githubusercontent.com/
                ${owner}/${repo}/${branch}/${path}`;
    //fetch 함수
    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
            //네트워크 오류: 파일 경로가 잘못되었다던가 실제 네트워크 오류가 있다던가 하면 작동
        }
        return response.text();
    })
    .then(data => { //잘 작동된다면 이쪽 함수가 실행됨
        //데이터를 받아와서 json형식으로 변환
        const parsedData = parseCSV(data);
        //우리가 사용할 변수로 옮겨줌
        dataList = parsedData;
        dataList.pop(); 

    })
    .catch(error => {
        console.error('Error:', error); //그 밖의 에러
    });

    //csv데이터 파싱 함수
    function parseCSV(data) {
        //csv파일 특성이 행은 엔터로 구분, 열은 ,(컴마)로 구분하기 때문에 데이터를 행 열 단위로 나눔
        const lines = data.split('\n');
        //맨 앞 값은 데이터가 아니라 각 데이터의 이름으로 설정
        const headers = lines[0].split(',');
        
        //2번째 행부터 정리
        const result = lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((object, header, index) => {
                //trim()은 앞,뒤 공백을 지워주는 함수
                const trimmedHeader = header ? header.trim() : ''; //문자열인지 확인 후 trim
                const trimmedValue = values[index] ? values[index].trim() : ''; //문자열인지 확인 후 trim
                //json 형태로 정리
                object[trimmedHeader] = trimmedValue;
                return object;
            }, {});
        });

        return result;
    }
    
}

//시작하기 버튼을 누르면 실행될 함수
function startButtonClick()
{
    //초기 값 설정 -> 다시시작하기 버튼에도 사용될 함수라 값 초기화 필요
    questionCount = 0;
    score = 0;
    questionArray= new Array(dataList.length).fill(1);

    //html 설정
    setHtml();
    //출제될 문제 설정
    setQuestionList(dataList.length);
}

function setHtml()
{
    //html 작성
    frameDiv.innerHTML = `
        <h2 id="questionNumber">문제1</h2>
        <p id="scoreP" style="text-align: right; margin-right: 30px; font-size: 20px">정답: 0/20</p>
        <div id="quizDiv">&nbsp</div>
        <div id="answerDiv">&nbsp</div>
        <div id="hintDiv">&nbsp</div>
        
       <div style="margin-top: 10px;"><input autocomplete="off" type="text" id="inputText">
        </div>

        <div id="timeCount">time</div>
        <div id="progressBar"></div>
    `;

    //html태그와 자바스크립트 변수 연결
    questionNumber = document.getElementById('questionNumber');
    scoreP = document.getElementById('scoreP');
    quizDiv = document.getElementById('quizDiv');
    answerDiv = document.getElementById('answerDiv');
    hintDiv = document.getElementById('hintDiv');
    inputText = document.getElementById('inputText');
    timeCount = document.getElementById('timeCount');
    progressBar = document.getElementById('progressBar');

    //이벤트리스너 함수 연결
    document.addEventListener("keydown", keyDownFunc, false);
    inputText.addEventListener("focus", chatEnterFunc, false);
    inputText.addEventListener("blur", chatBlurFunc, false);

}

//출제될 문제 설정
function setQuestionList(_length)
{
    //전체 데이터리스트에서 20문제를 선별 
    for(let i=0;i<questionList.length;i++)
    {
        //전체 데이터리스트에서 가져올 인덱스
        //인덱스를 통해 값을 가져오면 questionArray값을 0으로 만들어 같은 것을 반복하여 뽑지 않도록 설정
        let r = Math.floor(Math.random()*_length);
        if(questionArray[r]!=0)
        {
            questionArray[r] = 0;
            questionList[i] = dataList[r];
        }
        else i--;
    }
    //문제 시작
    playQuiz();
} 

function playQuiz()
{
    //html값 표기
    questionNumber.innerHTML =`문제${questionCount+1}`;
    scoreP.innerHTML = `정답: ${score}/${questionList.length}`;
    quizDiv.innerHTML = questionList[questionCount].mean;
    answerDiv.innerHTML = "";
    hintDiv.innerHTML = "";

    //현재 문제 값을 가져옴
    nowAnswer = questionList[questionCount].answer;

    //문제 정답 입력 가능
    canSubmitAnswer = 1;
    

    //타이머 관련 세팅
    let t = 20.00;
    let w = 20000;
    let interval = 10;
    timer = setInterval(function() {
        w -= interval;
        
        //타이머가 0이 되면 정답을 0으로 전송
        if(w<=0)
        {
            submitAnswer("0");
        }

        //10초가 지나면 힌트 공개
        if(w == 10000)
        {
            let r = Math.random();
            if(r < 0.5) hintDiv.innerHTML = `힌트: ${questionList[questionCount].hint1}`;
            else hintDiv.innerHTML = `힌트: ${questionList[questionCount].hint2}`;

        }

        //남은 시간을 표기
        t-=0.01;
        timeCount.innerHTML = t.toFixed(2);

        //시간이 감소할수록 progressbar의 width값을 조금씩 감소시킴
        let c = w/200;
        progressBar.style.width = c +"%";    
    }, interval);


}


//키를 누르면 실행되는 함수
function keyDownFunc(e)
{
    //엔터를 누르면
    if(e.keyCode=="13")
    {
        //만약 inputText에 포커스가 안 가져있다면
        if(chatfocus==0)
        {
            inputText.focus();//포커스를 맞춰줌
            chatfocus=1;
        }
        //만약 inputText에 포커스가 가져있다면
        else
        {
            inputTextManager();//정답 입력함수 실행
            inputText.blur();//포커스를 떼줌
            chatfocus=0;
        }
            
    }

    //if(e.code=="F5") e.preventDefault();
    
}

//인풋에 포커스되면?
function chatEnterFunc()
{
    chatfocus=1;
}
//인풋에 포커스가 떨어지면?
function chatBlurFunc()
{
    chatfocus=0;
}

//인풋텍스트 관련 함수
function inputTextManager()
{
    //실제 입력한 값을 가져옴
    let inputAnswer = document.getElementById('inputText').value;
    //입력 칸을 비워줌
    inputText.value="";

    //값을 입력하지 않았다면 아무것도 실행하지 않음
    if(inputAnswer=="") return false;

    //값이 입력되어있고 정답을 입력할 수 있는 상태면 정답제출함수를 실행
    if(canSubmitAnswer == 1) submitAnswer(inputAnswer);

}

//제출한 답이 정답인지 확인하는 함수
function submitAnswer(_text)
{
    //0이면 시간초과
    if(_text == "0")
    {
        console.log("시간 종료");
        rePlayQuiz();
    }
    //스킵을 입력하면 스킵
    else if(_text == "스킵")
    {
        console.log("스킵!");
        skipSound.play();
        timeCount.innerHTML = "스킵!";
        rePlayQuiz();
    }
    //정답을 맞혔다면
    else if(_text == nowAnswer)
    {
        console.log("정답!");
        correctSound.play();
        timeCount.innerHTML = "정답!";
        score++;
        rePlayQuiz();
    }
    //틀렸다면
    else
    {
        console.log("오답..");
        wrongSound.currentTime=0;
        wrongSound.play();
        

    }
        
}

//다음 문제 출제
function rePlayQuiz()
{
    //타이머를 초기화
    clearInterval(timer);
    //정답 공개
    answerDiv.innerHTML = nowAnswer;
    //다음 문제를 출제할 수 있도록 함
    questionCount++;
    
    //이때는 정답 입력이 불가능함
    canSubmitAnswer=0;

    //2초 후에 다음 문제가 실행됨
    setTimeout(function() {

        //문제를 다 풀었다면 결과화면으로 이동
        if(questionCount >= 20) resultScreen()
        else playQuiz();
    }, 2000);
    
}

//결과 화면
function resultScreen()
{
    //점수 계산
    let p = score*5;

    //html 수정
    frameDiv.innerHTML=`
       <h1>문제 끝!</h1>
        <h2>점수 ${p}/100 점</h2>
        <div id="buttonDiv">
            <button id="b1" onclick="startButtonClick()">다시 풀기</button>
            <br>
            <button id="b2" onclick="location.reload();">메인 화면으로</button>
        </div>

    `; //location.reload();는 새로고침
}



//데이터 설정
setQuizData();

//우클릭 방지 함수
document.oncontextmenu = function(e)
{
    return false;
}
//강제 새로고침을 막는 변수
window.addEventListener("beforeunload", function (e) {
    e.preventDefault();
});
window.addEventListener("unload", function () {
    location.reload();
});
