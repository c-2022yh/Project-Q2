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
var answerList = [];
var timeCount;
var progressBar;

//인풋태그에 포커스 온 되어있는 지 확인할 변수
var chatfocus = 0;

//문제 출제에 사용 될 데이터리스트
//전체 문제 100문제 리스트
var dataList = [];

//실제 출제될 10문제 리스트
var questionList = new Array(10);

//비복원추출을 위한 리스트
var questionArray = [];

//몇번째 문제를 푸는 지 확인할 변수
var questionCount = 0;

//정답 맞힌 수
var score = 0;

//정답 보기 인덱스
var aIndex = 0;

//타이머 조절 변수
let timer;

//랭킹을 저장할 배열 미리 10개짜리 배열을 생성함
var rankList = Array.from({ length: 10 }, () => ({ name: "", score: "", time: "" }));


//fetch API를 사용해 데이터를 가져옴
function setQuizData()
{
    const owner = 'c-2022yh'; //리포지토리 소유자
    const repo = 'Project-Q2'; //리포지토리 이름
    const path = 'data2.csv'; //파일 경로
    const branch = 'main'; //브랜치 이름
    //url 설정
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    //const url = "https://raw.githubusercontent.com/c-2022yh/Project-Q2/main/data.csv";

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
        <h2 id="questionNumber">문제</h2>
        <p id="scoreP" style="text-align: right; margin-right: 30px; font-size: 18px">정답: 0/10</p>
        <div id="quizDiv">&nbsp</div>
        <ul id="answerList">
            <li><button id="answer1" class="answerButton">정답1</button></li>
            <li><button id="answer2" class="answerButton">정답2</button></li>
            <li><button id="answer3" class="answerButton">정답3</button></li>
            <li><button id="answer4" class="answerButton">정답4</button></li>
            <li><button id="answer5" class="answerButton">정답5</button></li>
        </ul>
        <div id="timeCount">time</div>
        <div id="progressBar"></div>
    `;

    //html태그와 자바스크립트 변수 연결
    questionNumber = document.getElementById('questionNumber');
    scoreP = document.getElementById('scoreP');
    quizDiv = document.getElementById('quizDiv');
    timeCount = document.getElementById('timeCount');
    progressBar = document.getElementById('progressBar');

    answerList = new Array();
    answerList.push(document.getElementById('answer1'));
    answerList.push(document.getElementById('answer2'));
    answerList.push(document.getElementById('answer3'));
    answerList.push(document.getElementById('answer4'));
    answerList.push(document.getElementById('answer5'));

}

//출제될 문제 설정
function setQuestionList(_length)
{
    //전체 데이터리스트에서 10문제를 선별 
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
    //클릭이벤트 다시 달아주기
    for(let i in answerList) 
    {
        answerList[i].addEventListener("click",clickAnswer,false);
    }

    //html값 표기
    questionNumber.innerHTML =`문제${questionCount+1}`;
    scoreP.innerHTML = `정답: ${score}/${questionList.length}`;
    quizDiv.innerHTML = questionList[questionCount].mean;

    //타이머 관련 세팅
    let t = 10.00; //10초

    //progressbar width 관련 처리할 변수
    let w = 100;

    //인터벌 값 설정
    let interval = 10; 

    //인터벌 설정, 카운트다운 작동
    timer = setInterval(function() {
        
        
        //t값을 점점 감소시켜서 시간이 점점 줄어들게 만듦
        t-=0.01;

        //html로 남은시간을 소수점 두자리까지 표기
        t=t.toFixed(2);
        timeCount.innerHTML = t;
        
        //progressbar의 width값을 감소시켜 시각적으로 시간이 줄어들게 표현
        w -= (interval/100);
        progressBar.style.width = w+"%"; 
        
        //progressbar의 색깔을 점점 변화시킴
        let r = Math.floor(255 * (10-t)/10);
        let g = 0;
        let b = 0;
        progressBar.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

        //시간 종료면 0값을 전달
        if(t==0)
        { 
            timeCount.innerHTML = "시간초과!";
            clickAnswer();
        }
    }, interval);


    //정답 인덱스 초기화
    aIndex = Math.floor(Math.random()*5);
    
    //정답보기를 저장할 배열
    let aList = new Array(5).fill("");

    //정답 인덱스에 정답보기를 집어넣음
    aList[aIndex] = questionList[questionCount].answer;

    //나머지 오답보기도 전체 문제리스트에서 집어넣음
    for(let i in aList)
    {
        //aIndex로 미리 집어넣은 인덱스가 아니라면 동작
        if(aList[i] == "")
        {
            //오답보기 추가
            aList[i] = getWrongAnswer(aList);
        }
    }
    
    //추출한 보기를 각 버튼html에 넣어줌
    for(let i in answerList)
    {
        answerList[i].innerHTML=aList[i];
    }

    //문제카운트를 1 증가시킴
    questionCount++;
}

//오답보기 비복원추출하는 함수
function getWrongAnswer(aList)
{
    while(true)
    {
        let r = Math.floor(Math.random()*dataList.length);
        let t=0;
        for(let i in aList)
        {
            //값이 같으면 리턴하지 않도록 함
            if(dataList[r].answer == aList[i]) t++;
        }
        if(t==0) return dataList[r].answer;
    }

}


//보기를 클릭하면 실행할 함수
function clickAnswer(e=0)
{
    //정답확인용 변수
    let num = 5;
    
    //시간 초과 오답이 아니라면
    if(e != 0)
    {
        //클릭한 버튼의 id를 가져옴
        let str = e.target.id; 

        //id의 번호를 정수값으로 가져옴
        //위에서 추출한 id값이 answer1~5 라서 마지막 값을 가져오고 정수로 변환 
        num = parseInt(str.charAt(str.length - 1), 10);

        //1~5를 0~4로 바꿔줌
        num--;
    }

    //타이머 초기화
    clearInterval(timer);

    //색깔로 정답 표기
    answerList[aIndex].style.backgroundColor = '#00ff00';

    //시간 초과 오답일때
    if(num == 5)
    {
        console.log("시간 초과 오답!");
        timeCount.innerHTML = "시간초과!";
        //오답 사운드 출력
        wrongSound.play();
    }
    //정답일때
    else if(num == aIndex)
    {
        console.log("정답!");
        timeCount.innerHTML = "정답!";
        //정답 사운드 출력
        correctSound.play();
        score++;
    }
    //오답일때
    else
    {
        console.log("오답!");
        timeCount.innerHTML = "오답!";
        //오답 사운드 출력
        wrongSound.play();
        //틀린 답 색깔 바꾸기
        answerList[num].style.backgroundColor = '#e74c3c';
    }

    //정답처리될때 이벤트 잠시 제거
    //다음 문제 출제 시 다시 활성화시킴
    //이전 문제에서 클릭한 트리거가 다음 문제로 넘어가는 현상 방지
    for(let i in answerList)
    {
        answerList[i].removeEventListener("click",clickAnswer);
    }


    //잠시 쉬었다가 다음 문제 출제
    setTimeout(function() {
        
        for(let i in answerList)
        {
            //다시 흰색으로 초기화
            answerList[i].style.backgroundColor = '#ffffff';
        }
        //문제를 다 풀었으면 결과화면으로 이동, 아니면 다음문제 출제
        if(questionCount>=10) resultScreen();
        else playQuiz();
    }, 800);

}


//결과 화면
function resultScreen()
{
    //html 수정
    frameDiv.innerHTML=`
       <h1 class="h1">문제 끝!</h1>
        <h2>점수 ${score*10}/100 점</h2>
        <div id="buttonDiv">
            <button id="b1" onclick="startButtonClick()">다시 풀기</button>
            <br>
            <button id="b2" onclick="inputRanking(${score*10});">랭킹 등록하기</button>
            <br>
            <button id="b3" onclick="rankingScreen();">랭킹 보기</button>
        </div>
    `;
}

function inputRanking(s)
{
    //랭킹 확인용 날짜 설정
    const now = new Date();
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, "0"); 
    let day = String(now.getDate()).padStart(2, "0");
    let hours = String(now.getHours()).padStart(2, "0");
    let minutes = String(now.getMinutes()).padStart(2, "0");
    let seconds = String(now.getSeconds()).padStart(2, "0");

    //랭킹에 등록할 이름을 입력받음
    let p;
    while(true)
    {
        p = prompt("랭킹에 등록할 이름을 입력해 주세요");
        if(p.length!=0 && p.length<11) break;
        alert("1자 이상 10자 이하로 입력해 주세요");
    }

    //리스트 삽입
    rankList.push({name:p, score:s,
        time:`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`});
    
    //랭킹화면 보기
    rankingScreen();

}

//랭킹 화면
function rankingScreen()
{
    //랭킹리스트 정렬
    //score 기준으로 정렬, score가 같으면 시간이 빠른 쪽이 위
    //추가로 ""빈값이 가장 밑으로 가도록 설정
    rankList.sort((a,b) => {

        if (a.score === "" && b.score !== "") return 1;
        if (b.score === "" && a.score !== "") return -1;
      
        if (a.score > b.score) return -1;
        if (a.score < b.score) return 1;
      
        return a.time - b.time;
    })

    //html 수정
    frameDiv.innerHTML=`
      <h1 id="ranking">랭킹</h1>
        <div ><table>
            <thead>
            <tr style="font-size: 20px;">
                <th>&nbsp</th><th>이름</th><th>점수</th><th>시간</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td class="td" style="background-color: gold;">1</td><td>${rankList[0].name}</td><td>${rankList[0].score}</td><td>${rankList[0].time}</td>
            </tr>
            <tr>
                <td class="td" style="background-color: silver;">2</td><td>${rankList[1].name}</td><td>${rankList[1].score}</td><td>${rankList[1].time}</td>
            </tr>
            <tr>
                <td class="td" style="background-color: peru;">3</td><td>${rankList[2].name}</td><td>${rankList[2].score}</td><td>${rankList[2].time}</td>
            </tr>
            <tr>
                <td>4</td><td>${rankList[3].name}</td><td>${rankList[3].score}</td><td>${rankList[3].time}</td>
            </tr>
            <tr>
                <td>5</td><td>${rankList[4].name}</td><td>${rankList[4].score}</td><td>${rankList[4].time}</td>
            </tr>
            <tr>
                <td>6</td><td>${rankList[5].name}</td><td>${rankList[5].score}</td><td>${rankList[5].time}</td>
            </tr>
            <tr>
                <td>7</td><td>${rankList[6].name}</td><td>${rankList[6].score}</td><td>${rankList[6].time}</td>
            </tr>
            <tr>
                <td>8</td><td>${rankList[7].name}</td><td>${rankList[7].score}</td><td>${rankList[7].time}</td>
            </tr>
            <tr>
                <td>9</td><td>${rankList[8].name}</td><td>${rankList[8].score}</td><td>${rankList[8].time}</td>
            </tr>
            <tr>
                <td>10</td><td>${rankList[9].name}</td><td>${rankList[9].score}</td><td>${rankList[9].time}</td>
            </tr>
            </tbody>
        </table></div>

        <div id="buttonDiv">
            <button id="b1" onclick="startButtonClick()">다시 풀기</button>
        </div>
        
    `;
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
















