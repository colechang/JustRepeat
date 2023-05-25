(()=>{
    let youtubeLeftControls, youtubePlayer;
    let currentVideo="";
    let loopVideoStart = [];
   

    //retrieve loops to send to storage for popup to show
    const fetchLoops = () => {
        return new Promise((resolve) => {
          chrome.storage.sync.get([currentVideo], (obj) => {
            resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
          });
        });
      };
    
    //creation of a new loop
    //create and send attributes(timestamp,description)
    //edited array to sort loop from recent to least recent based on current time
    const addNewLoopEventHandler = async ()=>{
        const currentTime = youtubePlayer.currentTime;
        const duration = youtubePlayer.duration;
        const newLoopStart = {
            time:currentTime,
            desc:"Start Loop at "+ toHHMMSS(currentTime)+"-"+toHHMMSS(Math.min(duration,currentTime+10)),
        };

        loopVideoStart = await fetchLoops();

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...loopVideoStart, newLoopStart].sort((a,b)=> b.time-a.time))
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

const toHHMMSS = (secs) => {
    var sec_num = parseInt(secs, 10)
    var hours   = Math.floor(sec_num / 3600)
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60

    return [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v,i) => v !== "00" || i > 0)
        .join(":")
}
//have to add mutation observer to watch if the video.currentTime passes the desired loop end point
//implement check to see if end point is at least a 1s larger then start loop
//function to clear the loop marks
//add multiple loops for 1 video
//feature to label the loop
//should only have 1 mutation observer to prevent 2 loops from altering current time videos
//most recent played loop becomes the active loop and top of the list, add css to hightlight the active one (colour top one red)
//dont need mutation observer since current

//for testing
    //block all cookies and scripts when tab closes or refreshed to avoid extension context invalidated error