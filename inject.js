(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let loopVideoStart = [];
    let timeUpdateHandler = null; // Reference to the timeupdate event listener
    let activeTimeUpdateHandler = null; // Reference to the active timeupdate event listener
    let loopRange = null; // Reference to the range input element

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
                "Loop at " +
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

            // Create range input for loop end time
            loopRange = document.createElement("input");
            loopRange.type = "range";
            loopRange.min = "0";
            loopRange.max = youtubePlayer.duration.toString();
            loopRange.step = "1";
            loopRange.value = youtubePlayer.currentTime.toString(); // Initial value set to video duration
            loopRange.addEventListener("input", onRangeInput);

            youtubeLeftControls.appendChild(loopRange);

            // Create placeholder for the selected range value
            const rangeValue = document.createElement("span");
            rangeValue.id = "range-value";
            rangeValue.textContent = toHHMMSS(parseFloat(loopRange.value));

            youtubeLeftControls.appendChild(rangeValue);
        }
    };

    const onRangeInput = () => {
        const endTime = parseFloat(loopRange.value);
        /*if (endTime <= youtubePlayer.duration) {
            youtubePlayer.currentTime = endTime;
        }*/
        const rangeValue = document.getElementById("range-value");
        rangeValue.textContent = toHHMMSS(endTime);

    };

    const toHHMMSS = (secs) => {
        var sec_num = parseInt(secs, 10);
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num % 3600) / 60);
        var seconds = sec_num % 60;

        return [hours, minutes, seconds]
            .map((v) => (v < 10 ? "0" + v : v))
            .filter((v, i) => v !== "00" || i > 0)
            .join(":");
    };

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;
        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        } else if (type === "PLAY") {
            youtubePlayer.currentTime = value;

            if (activeTimeUpdateHandler) {
                youtubePlayer.removeEventListener("timeupdate", activeTimeUpdateHandler);
            }

            activeTimeUpdateHandler = (e) => {
                if (youtubePlayer.currentTime >= Number(value)) {
                    youtubePlayer.currentTime = Number(value);
                }
            };

            youtubePlayer.addEventListener("timeupdate", activeTimeUpdateHandler);
        } else if (type === "DELETE") {
            loopVideoStart = loopVideoStart.filter((b) => b.time !== value);
            chrome.storage.sync.set({ [currentVideo]: JSON.stringify(loopVideoStart) });

            if (activeTimeUpdateHandler) {
                youtubePlayer.removeEventListener("timeupdate", activeTimeUpdateHandler);
            }
        }
    });

    const observer = new MutationObserver(() => {
        if (document.getElementsByClassName("video-stream").length > 0) {
            observer.disconnect();
            youtubePlayer = document.getElementsByClassName("video-stream")[0];
            youtubePlayer.addEventListener("timeupdate", timeUpdateHandler);
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });
})();
