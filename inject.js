(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let loopVideoStart = [];
    let timeUpdateHandler = null; // Reference to the timeupdate event listener
  
    // Retrieve loops to send to storage for the popup to show
    const fetchLoops = () => {
      return new Promise((resolve) => {
        chrome.storage.sync.get([currentVideo], (obj) => {
          resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
        });
      });
    };
  
    // Creation of a new loop
    // Create and send attributes (timestamp, description)
    // Edit array to sort loops from the most recent to the least recent based on the current time
    const addNewLoopEventHandler = async () => {
      const currentTime = youtubePlayer.currentTime;
      const newLoopStart = {
        time: currentTime,
        desc:
          "Start Loop at " +
          toHHMMSS(currentTime) +
          "-" +
          toHHMMSS(Math.min(youtubePlayer.duration, currentTime + 10)),
      };
      loopVideoStart = await fetchLoops();
  
      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify([...loopVideoStart, newLoopStart].sort((a, b) => b.time - a.time)),
      });
    };
  
    const newVideoLoaded = async () => {
      const loopBtnExists = document.getElementsByClassName("loop-btn")[0];
  
      loopVideoStart = await fetchLoops();
  
      if (!loopBtnExists) {
        const loopBtn = document.createElement("img");
  
        loopBtn.src = chrome.runtime.getURL("assets/loop.png");
        loopBtn.className = "ytp-button " + "loop-btn";
        loopBtn.title = "Click to pick start time";
  
        youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
        youtubePlayer = document.getElementsByClassName("video-stream")[0];
  
        youtubeLeftControls.appendChild(loopBtn);
        loopBtn.addEventListener("click", addNewLoopEventHandler);
      }
    };
  
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
      const { type, value, videoId } = obj;
      if (type === "NEW") {
        currentVideo = videoId;
        newVideoLoaded();
      } else if (type === "PLAY") {
        youtubePlayer.currentTime = value;
  
        timeUpdateHandler = () => {
          trackTime(Number(value), Number(Math.min(Number(value)+10,youtubePlayer.duration)));
        };
  
        youtubePlayer.addEventListener("timeupdate", timeUpdateHandler);
      } else if (type === "DELETE") {
        loopVideoStart = loopVideoStart.filter((b) => b.time !== value);
        chrome.storage.sync.set({ [currentVideo]: JSON.stringify(loopVideoStart) });
  
        youtubePlayer.removeEventListener("timeupdate", timeUpdateHandler);
        timeUpdateHandler = null;
  
        response(loopVideoStart);
      }
    });
  
    const trackTime = (value, duration) => {
        console.log(typeof value)
        console.log(typeof duration)

      if (youtubePlayer.currentTime >= duration) {
        youtubePlayer.currentTime = value;
      }
    };
  
    const toHHMMSS = (secs) => {
      var sec_num = parseInt(secs, 10);
      var hours = Math.floor(sec_num / 3600);
      var minutes = Math.floor(sec_num / 60) % 60;
      var seconds = sec_num % 60;
  
      return [hours, minutes, seconds]
        .map((v) => (v < 10 ? "0" + v : v))
        .filter((v, i) => v !== "00" || i > 0)
        .join(":");
    }
  
    newVideoLoaded();
  })();
  