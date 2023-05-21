(()=>{
    let youtubeLeftConrols,youtubePlayer;
    let currentVideo="";
    chrome.runtime.onMessage.addListener((obj,sender,response)=>{
        const{type,value,videoId} =obj;
        if(type==="NEW"){
            currentVideo=videoId;
            newVideoLoaded();
        }
    });
    const newVideoLoaded=()=>{
        const loopBtnExists = document.getElementsByClassName("loop-btn")[0];
        if(!loopBtnExists){
            const loopBtn = document.createElement("img")
            loopBtn.src =chrome.runtime.getURL("assets/loopRed50.png")
            loopBtn.className = "ytp-button " + "loop-btn"
            loopBtn.title="click to pick start time"


            youtubeLeftConrols = document.getElementsByClassName("ytp-left-controls")[0]
            youtubePlayer =document.getElementsByClassName("video-stream")[0]
            youtubeLeftConrols.appendChild(loopBtn);
            loopBtn.addEventListener("click",addNewLoopEventHandler);
        }
    }
    newVideoLoaded();
    
})();
var video = getVideo();
var observer = new MutationObserver(function(mutations){
})

function checkforVideo(){
    let b = document.getElementsByTagName(
        "video")
    if (b){
        return true;
    }
    //no video on webpage
    else{
        return false;
    }
}
function getVideo(){
    ytplayer = document.getElementsByTagName('video')[0];
    console.log("got Video")
    return ytplayer
}
function getCurrentTime(){
    t=getVideo()
    console.log(t.currentTime)
    return t.currentTime
}
// function getCurrentTimeElement(){
//     currentTime = document.getElementsByClassName("ytp-time-current")[0];
//     return currentTime
// }

function getCurrentTime(c){
    return c.innerText
}
//class="ytp-time-current"

function getDuration(){
    duration = document.getElementsByClassName("ytp-time-duration")[0];
    return duration.innerText()
}
function playVid(video){
    video.play()
}
function pauseVid(video){
    video.pause()
}