/*let p = document.getElementsByTagName('p')
for (elt of p){
    elt.style['background-color'] = '#FF00FF'
}*/

var video = getVideo();
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
//class="ytp-time-current"

function getDuration(){
    duration = document.getElementsByClassName("ytp-time-duration")[0];
    return duration.text()
}
function playVid(video){
    video.play()
}
function pauseVid(video){
    video.pause()
}
getVideo()
getCurrentTime()