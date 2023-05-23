(()=>{
    let youtubeLeftControls, youtubePlayer;
    let currentVideo="";
    let loopVideoStart = [];

    const fetchLoops = () => {
        return new Promise((resolve) => {
          chrome.storage.sync.get([currentVideo], (obj) => {
            resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
          });
        });
      };
    

    const addNewLoopEventHandler = async ()=>{
        const currentTime = youtubePlayer.currentTime;
        const newLoopStart = {
            time:currentTime,
            desc:"Start Loop at "+ getTime(currentTime),
        };

        loopVideoStart = await fetchLoops();

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...loopVideoStart, newLoopStart].sort((a,b)=> a.time-b.time))
        })
    }


    const newVideoLoaded = async () => {
        const loopBtnExists = document.getElementsByClassName("loop-btn")[0];

        loopVideoStart = await fetchLoops();

        if(!loopBtnExists){
            const loopBtn = document.createElement("img")

            loopBtn.src =chrome.runtime.getURL("assets/loop.png")
            loopBtn.className = "ytp-button " + "loop-btn"
            loopBtn.title="click to pick start time"


            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0]
            youtubePlayer = document.getElementsByClassName("video-stream")[0]

            youtubeLeftControls.appendChild(loopBtn);
            loopBtn.addEventListener("click",addNewLoopEventHandler);
        }
    }


    chrome.runtime.onMessage.addListener((obj,sender,response)=>{
        const{type,value,videoId} =obj;
        if(type==="NEW"){
            currentVideo=videoId;
            newVideoLoaded();
        }else if (type==="PLAY"){
            youtubePlayer.currentTime = value
        } else if(type==="DELETE"){
            loopVideoStart=loopVideoStart.filter((b)=>b.time != value);
            chrome.storage.sync.set({[currentVideo]:JSON.stringify(loopVideoStart)})

            response(loopVideoStart)
        }
    });
    newVideoLoaded();
})();

const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);
    return date.toISOString().substring(11,8);
};

/*function getVideo(){
    ytplayer =document.getElementsByClassName("video-stream")[0]
    return ytplayer
}
function getCurrentTime(){
    t=getVideo()
    console.log(t.currentTime)
    return t.currentTime
}
function getDuration(){
    duration = getVideo();
    return duration.duration
}
function playVid(video){
    video.play()
}
function pauseVid(video){
    video.pause()
}
function setCurrentTime(time){
    getVideo().currentTime = time;
}*/

//have to add mutation observer to watch if the video.currentTime passes the desired loop end point
//implement check to see if end point is at least a 1s larger then start loop
//function to clear the loop marks
//add multiple loops for 1 video
//feature to label the loop


