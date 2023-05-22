import { activeTab, activeTab, activeTab } from "./utils";
document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await activeTab();
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);

  const currentVideo = urlParameters.get("v");

  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoLoops = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];

      viewLoops(currentVideoLoops);
    });
  } else {
    const container = document.getElementsByClassName("container")[0];

    container.innerHTML = '<div class="title">This is not a youtube video page.</div>';
  }
});


const viewLoops= (currentVideoLoops=[])=>{
  const loopElements = document.getElementById("loops");
  loopElements.innerHTML="";
  if (loopElements.length > 0) {
    for (let i = 0; i < loopElements.length; i++) {
      const loop = loopElements[i];
      addNewLoop(loopElements, loop);
    }
  } else {
    
    loopElements.innerHTML = '<i class="row">No loop set</i>';
  }

  return;
};

const addNewLoop = (loops, loop) => {
  const loopTitleElement = document.createElement("div");
  const controlsElement = document.createElement("div");
  const newLoopElement = document.createElement("div");

  loopTitleElement.textContent = loop.desc;
  loopTitleElement.className = "loop-title";
  controlsElement.className = "loop-controls";

  setLooopAttributes("play", onPlay, controlsElement);
  setLoopAttributes("delete", onDelete, controlsElement);

  newLoopElement.id = "loop-" + loop.time;
  newLoopElement.className = "loop";
  newLoopElement.setAttribute("timestamp", loop.time);

  newLoopElement.appendChild(loopTitleElement);
  newLoopElement.appendChild(controlsElement);
  loops.appendChild(newLoopElement);
};

const setLoopAttributes = (src,eventListener,controlParentElement)=>{
  const controlElement = document.createElement("img")
  controlElement.src="assets/" +src+".png"
  controlElement.title = src
  controlElement.addEventListener("click",eventListener)
  controlParentElement.appendChild(controlElement)

}
const onPlay = async e =>{
  const loopTime = e.target.parentNode.getAttribute("timestamp")
  const activeTab = await getActiveTabURL();

  chrome.tabs.sendMessage(activeTab.id,{
    type:"PLAY",
    value: loopTime
  })
};

const onDelete = async e =>{
  const activeTab = await getActiveTabURL();
  const loopTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const loopElementToDelete=document.getElementById("loop-"+loopTime)
  loopElementToDelete.parentNode.removeChild(loopElementToDelete)
  chrome.tabs.sendMessage(activeTab.id,{
    type:"DELETE",
    value:loopTime
  },viewLoops);
}