(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let loopVideoStart = []; //array of loops
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
    //info attached to every loop and stored in chrome storage to be displayed in popup
    const addNewLoopEventHandler = async () => {
        const currentTime = youtubePlayer.currentTime;
        const endTime = parseFloat(loopRange.value);
        const fadeSvg = document.getElementById("fade-text")
        const loopMadeSvg = document.getElementById("loop-made")
        if (endTime <= currentTime) {
            fadeSvg.classList.add("fade-text")
            return;
        } else {
            loopMadeSvg.classList.add("fade-text")
        }
        const newLoopStart = {
            loopId: generateLoopId(),
            time: currentTime,
            end: endTime,
            desc:
                // "Loop at " +
                toHHMMSS(currentTime) +
                " - " +
                toHHMMSS(endTime),
        };
        loopVideoStart = await fetchLoops();
        //store loop in storage to be shown in popup
        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...loopVideoStart, newLoopStart]),
        });
    };
    //variables and elements loaded on a video loaded
    const newVideoLoaded = async () => {
        const loopBtnExists = document.getElementsByClassName("loop-btn")[0];

        loopVideoStart = await fetchLoops();

        if (!loopBtnExists) {
            
            //Css file for loop Btn and input slider
            const cssLink = document.createElement("link")
            cssLink.rel = "stylesheet";
            cssLink.type = "text/css"
            cssLink.href = "inject.css"
            document.head.appendChild(cssLink)

            const loopBtn = document.createElement("img");

            loopBtn.src = chrome.runtime.getURL("assets/loop.png");
            loopBtn.className = "ytp-button " + "loop-btn";
            loopBtn.title = "Click to pick start time";
            loopBtn.alt = "Loop Button"

            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName("video-stream")[0];

            youtubeLeftControls.appendChild(loopBtn);
            loopBtn.addEventListener("click", addNewLoopEventHandler);

            // Create range input for loop end time
            loopRange = document.createElement("input");
            loopRange.id = "loop-range"
            loopRange.type = "range";
            loopRange.min = "0";
            loopRange.step = "1";
            loopRange.value = "0";
            loopRange.max = "3600"
            loopRange.addEventListener("input", onRangeInput);

            youtubeLeftControls.appendChild(loopRange);

            // Create placeholder for the selected range value
            const rangeValue = document.createElement("span");
            rangeValue.id = "range-value";
            rangeValue.textContent = "00:00:00";
            youtubeLeftControls.appendChild(rangeValue);

            //Attach SVG to youtube video player with animation ending event listener
            const fadeText = document.createElement("img")
            fadeText.src = chrome.runtime.getURL("assets/errorIcon.svg")
            fadeText.id = "fade-text";
            fadeText.alt = "Error Icon";
            fadeText.classList.add("fade-text-hidden");

            youtubePlayer.parentElement.parentElement.appendChild(fadeText)

            fadeText.addEventListener("animationstart", () => {
                fadeText.classList.remove("fade-text-hidden")
            });

            fadeText.addEventListener("animationend", () => {
                fadeText.classList.remove("fade-text")
                fadeText.classList.add("fade-text-hidden")
            });
            //create and append element for loop made icon animation 
            const loopMadeIcon = document.createElement("img")
            loopMadeIcon.src = chrome.runtime.getURL("assets/loopMadeIcon.svg")
            loopMadeIcon.id = "loop-made"
            loopMadeIcon.alt = "Loop Made Icon"
            loopMadeIcon.classList.add("fade-text-hidden")

            youtubePlayer.parentElement.parentElement.appendChild(loopMadeIcon)


            loopMadeIcon.addEventListener("animationstart", () => {
                loopMadeIcon.classList.remove("fade-text-hidden")
            })

            loopMadeIcon.addEventListener("animationend", () => {
                loopMadeIcon.classList.remove("fade-text")
                loopMadeIcon.classList.add("fade-text-hidden")
            })
        }
    };

    //input range slider
    const onRangeInput = () => {
        input = document.getElementById("loop-range");
        input.max = youtubePlayer.duration
        var value = input.value;
        var hours = Math.floor(value / 3600);
        var minutes = Math.floor((value % 3600) / 60);
        var seconds = value % 60;

        var formattedTime = padZero(hours) + ':' + padZero(minutes) + ':' + padZero(seconds);
        document.getElementById('range-value').innerText = formattedTime;
    };

    chrome.runtime.onMessage.addListener((obj, sender, response) => {

        chrome.runtime.sendMessage({message: "messageSent"}, function (response) {
            console.log(response);
        });

        const { type, value, videoId, end, id } = obj;
        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        } else if (type === "PLAY") {
            youtubePlayer.currentTime = value;

            if (activeTimeUpdateHandler) {
                youtubePlayer.removeEventListener("timeupdate", activeTimeUpdateHandler);
            }
            activeTimeUpdateHandler = (e) => {
                if (youtubePlayer.currentTime >= Number(end)) {
                    youtubePlayer.currentTime = Number(value);
                }
            };
            youtubePlayer.addEventListener("timeupdate", activeTimeUpdateHandler);
        } else if (type === "DELETE") {
            loopVideoStart = loopVideoStart.filter(loop => loop.loopId !== id);
            chrome.storage.sync.set({ [currentVideo]: JSON.stringify(loopVideoStart) });

            if (activeTimeUpdateHandler) {
                youtubePlayer.removeEventListener("timeupdate", activeTimeUpdateHandler);
            }
            response(loopVideoStart);

        }
    });
    newVideoLoaded();
})();
//formatting function for video time
function padZero(num) {
    return num.toString().padStart(2, '0');
}
//Create Unique Id for every loop created
//returns a string
function generateLoopId() {
    return Math.random().toString(36).substring(2, 9);
};

//format time from seconds to 00:00:00
function toHHMMSS (secs) {
    var sec_num = parseInt(secs, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num % 3600) / 60);
    var seconds = sec_num % 60;

    return [hours, minutes, seconds]
        .map((v) => (v < 10 ? "0" + v : v))
        .filter((v, i) => v !== "00" || i > 0)
        .join(":");
};