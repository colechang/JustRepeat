import { getActiveTabURL } from "./utils.js";

const addNewLoop = (loops, loop) => {
  const loopTitleElement = document.createElement("div");
  const controlsElement = document.createElement("div");
  const newLoopElement = document.createElement("div");

  loopTitleElement.textContent = loop.desc;
  loopTitleElement.className = "loop-title";
  controlsElement.className = "loop-controls";

  setLoopAttributes("play", onPlay, controlsElement);
  setLoopAttributes("delete", onDelete, controlsElement);
  newLoopElement.id = "loop-" + loop.time;
  newLoopElement.className = "loop";
  newLoopElement.setAttribute("timestamp", loop.time);
  newLoopElement.setAttribute("endTime", loop.end);
  newLoopElement.setAttribute("loop-id", loop.loopId);

  newLoopElement.appendChild(loopTitleElement);
  newLoopElement.appendChild(controlsElement);
  loops.appendChild(newLoopElement);
};

const viewLoops = (currentVideoLoops = []) => {
  const loopElement = document.getElementById("loops");
  loopElement.innerHTML = "";
  if (currentVideoLoops.length > 0) {
    for (let i = 0; i < currentVideoLoops.length; i++) {
      const loop = currentVideoLoops[i];
      addNewLoop(loopElement, loop);
    }
  } else {
    loopElement.innerHTML = '<i class="row">No loop set</i>';
  }
  return;
};

const onPlay = async (e) => {
  const loopTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTabURL = await getActiveTabURL();
  const loopEndTime = e.target.parentNode.parentNode.getAttribute("endTime");
  const loopId = e.target.parentNode.parentNode.getAttribute("loop-id");

  // Send message to content script to play the loop
  chrome.tabs.sendMessage(activeTabURL.id, {
    type: "PLAY",
    value: loopTime,
    end: loopEndTime,
    id: loopId
  });

  // Highlight the active loop
  const loopElements = document.getElementsByClassName("loop");
  for (let i = 0; i < loopElements.length; i++) {
    const loopElement = loopElements[i];
    if (loopElement.getAttribute("loop-id") === loopId) {
      loopElement.classList.add("active-loop");
    } else {
      loopElement.classList.remove("active-loop");
    }
  }
}

const onDelete = async (e) => {
  const activeTabURL = await getActiveTabURL();
  const loopTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const loopEndTime = e.target.parentNode.parentNode.getAttribute("endTime");
  const loopId = e.target.parentNode.parentNode.getAttribute("loop-id");
  const loopElementToDelete = e.target.parentNode.parentNode;
  loopElementToDelete.parentNode.removeChild(loopElementToDelete);

  // Send message to content script to delete the loop
  chrome.tabs.sendMessage(activeTabURL.id, {
    type: "DELETE",
    value: loopTime,
    end: loopEndTime,
    id: loopId
  }, viewLoops);
};

const setLoopAttributes = (src, eventListener, controlParentElement) => {
  const controlElement = document.createElement("img");
  // controlElement.id = src;
  controlElement.src = "assets/" + src + ".png";
  controlElement.title = src;
  controlElement.addEventListener("click", eventListener);
  controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {
  const activeTabURL = await getActiveTabURL();
  const queryParameters = activeTabURL.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);

  const currentVideo = urlParameters.get("v");

  if (activeTabURL.url.includes("youtube.com/watch") && currentVideo) {
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoLoops = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];

      viewLoops(currentVideoLoops);
    });
  } else {
    const container = document.getElementsByClassName("container")[0];
    container.innerHTML = '<div class="title">This is not a YouTube video page.</div>';
  }
});