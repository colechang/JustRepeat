(()=>{
    let youtubeLeftControls, youtubePlayer;
    let currentVideo="";
    let loopVideoStart = [];
    let duration;

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
        const newLoopStart = {
            time:currentTime,
            desc:"Start Loop at "+ toHHMMSS(currentTime)+"-"+toHHMMSS(Math.min(youtubePlayer.duration,currentTime+10)),
        };
        duration = Math.min(youtubePlayer.duration,currentTime+10)

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
            youtubePlayer.currentTime = value;
            trackTime(value,value+10);
            
            //signal current loop and add this to the top of the loop list
            //signal css to highlight active loop
            //set active loop duration
        } else if(type==="DELETE"){
            loopVideoStart=loopVideoStart.filter((b)=>b.time != value);
            chrome.storage.sync.set({[currentVideo]:JSON.stringify(loopVideoStart)})
            trackTime()
            response(loopVideoStart)
        }

    });

    const trackTime=(value,duration,type)=>{
        if(type==="PLAY"){
            youtubePlayer.addEventListener("timeupdate",(event)=>{
                if(youtubePlayer.currentTime>=duration){
                    youtubePlayer.currentTime=value;
                }
            });
        }
        else{
            return
        }
    }
    
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

//implement check to see if end point is at least a 1s larger then start loop
//feature to clear all the loop marks
//feature to label the loop
//most recent played loop becomes the active loop and top of the list, add css to hightlight the active one (colour top one red)

//for testing
    //block all cookies and scripts when tab closes or refreshed to avoid extension context invalidated error