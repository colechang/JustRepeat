chrome.tabs.onUpdated.addListener((tabId,tab)=>{
    if(tab.url && tab.url.includes("youtube.com/watch")){
        const queryParameters = tab.url.split("?")[1];
        const urlParameters= new URLSearchParams(queryParameters);

        chrome.tabs.sendMessage(tabId,{
            type:"NEW",
            videoId:urlParameters.get("v"),
        });
    }
});
//clear chrome storage once the user leaves a webpage
chrome.tabs.onRemoved.addListener((tabId,removeInfo)=>{

    chrome.storage.sync.get(null,(data)=>{

        for (const key in data){
            if(data.hasOwnProperty(key) && data[key].tabId === tabId){
                chrome.storage.sync.remove(key,()=>{
                    console.log("Data for tab ${tabId} removed from Storage.");
                });
            }
        }
    });
});