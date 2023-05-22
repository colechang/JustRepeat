import { activeTab, activeTab, activeTab } from "./utils";
  function getMinuteSecondsTime(seconds)
{
    totalSeconds = Math.round(seconds);
    seconds = totalSeconds % 60;
    if(seconds < 10) seconds = "0" + seconds;
    minutes = (totalSeconds - seconds)/60;
    return new String(minutes + ":" + seconds);
}

var inputLeft = document.getElementById("input-left");
var inputRight = document.getElementById("input-right");

var thumbLeft = document.querySelector(".slider > .thumb.left");
var thumbRight = document.querySelector(".slider > .thumb.right");
var range = document.querySelector(".slider > .range");

function setLeftValue() {
	var _this = inputLeft,
		min = parseInt(_this.min),
		max = parseInt(_this.max);

	_this.value = Math.min(parseInt(_this.value), parseInt(inputRight.value) - 1);

	var percent = ((_this.value - min) / (max - min)) * 100;

	thumbLeft.style.left = percent + "%";
	range.style.left = percent + "%";
}
setLeftValue();

function setRightValue() {
	var _this = inputRight,
		min = parseInt(_this.min),
		max = parseInt(_this.max);

	_this.value = Math.max(parseInt(_this.value), parseInt(inputLeft.value) + 1);

	var percent = ((_this.value - min) / (max - min)) * 100;

	thumbRight.style.right = (100 - percent) + "%";
	range.style.right = (100 - percent) + "%";
}
setRightValue();

inputLeft.addEventListener("input", setLeftValue);
inputRight.addEventListener("input", setRightValue);

inputLeft.addEventListener("mouseover", function() {
	thumbLeft.classList.add("hover");
});
inputLeft.addEventListener("mouseout", function() {
	thumbLeft.classList.remove("hover");
});
inputLeft.addEventListener("mousedown", function() {
	thumbLeft.classList.add("active");
});
inputLeft.addEventListener("mouseup", function() {
	thumbLeft.classList.remove("active");
});

inputRight.addEventListener("mouseover", function() {
	thumbRight.classList.add("hover");
});
inputRight.addEventListener("mouseout", function() {
	thumbRight.classList.remove("hover");
});
inputRight.addEventListener("mousedown", function() {
	thumbRight.classList.add("active");
});
inputRight.addEventListener("mouseup", function() {
	thumbRight.classList.remove("active");
});

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
      addNewBookmark(loopElements, loop);
    }
  } else {
    
    loopElements.innerHTML = '<i class="row">No loop set</i>';
  }

  return;
};

const addNewBookmark = (loops, loop) => {
  const loopTitleElement = document.createElement("div");
  const controlsElement = document.createElement("div");
  const newLoopElement = document.createElement("div");

  loopTitleElement.textContent = loop.desc;
  loopTitleElement.className = "loop-title";
  controlsElement.className = "loop-controls";

  setLooopAttributes("play", onPlay, controlsElement);
  setLoopAttributes("delete", onDelete, controlsElement);

  newLoopElement.id = "bookmark-" + bookmark.time;
  newLoopElement.className = "bookmark";
  newLoopElement.setAttribute("timestamp", bookmark.time);

  newLoopElement.appendChild(loopTitleElement);
  newLoopElement.appendChild(controlsElement);
  loops.appendChild(newLoopElement);
};