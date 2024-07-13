const frameDiv = document.getElementById('frame');
const startButton = document.getElementById('startButton');

var questionNumber;
var scoreP;
var quizDiv;
var inputText;
var timeCount;
var progressBar;

var chatfocus = 0;

var dataList = undefined;



function startButtonClick()
{
    setHtml();
    setQuizData();

    playQuiz();
}

function setHtml()
{
    frameDiv.innerHTML = `
        <h2 id="questionNumber">문제1</h2>
        <p id="scoreP" style="text-align: right; margin-right: 30px; font-size: 20px">정답: 0/50</p>
        <div id="quizDiv">Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas mollitia voluptatum recusandae, eveniet repudiandae repellat, officia temporibus laboriosam quasi, incidunt porro? Ipsam eveniet quae aut, modi deserunt libero! Repellat, vero.</div>
        
       <div style="margin-top: 100px;"><input type="text" id="inputText">
        </div>

        <div id="timeCount">time</div>
        <div id="progressBar"></div>
    `;

    questionNumber = document.getElementById('questionNumber');
    scoreP = document.getElementById('scoreP');
    quizDiv = document.getElementById('quizDiv');
    inputText = document.getElementById('inputText');
    timeCount = document.getElementById('timeCount');
    progressBar = document.getElementById('progressBar');

    document.addEventListener("keydown", keyDownFunc, false);
    inputText.addEventListener("focus", chatEnterFunc, false);
    inputText.addEventListener("blur", chatBlurFunc, false);

}


function setQuizData()
{
    const owner = 'repository-owner'; // 리포지토리 소유자 이름
        const repo = 'repository-name'; // 리포지토리 이름
        const path = 'path/to/file.csv'; // CSV 파일 경로
        const branch = 'main'; // 브랜치 이름

        const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;

}
function playQuiz()
{

}






function keyDownFunc(e)
{
    if(e.keyCode=="13")
    {
        if(chatfocus==0)
        {
            inputText.focus();
            chatfocus=1;
        }
        else
        {
            inputTextManager();
            inputText.blur();
            chatfocus=0;
        }
            
    }
}

function chatEnterFunc()
{
    chatfocus=1;
}

function chatBlurFunc()
{
    chatfocus=0;
}




function inputTextManager()
{
    let inputAnswer = document.getElementById('inputText').value;
    inputText.value="";

    if(inputAnswer=="") return false;

    console.log(inputAnswer);

}















