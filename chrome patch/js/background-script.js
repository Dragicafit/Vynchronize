var roomnum = "";
var username = "";
var tab;

chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.command == 'changeVideoClient') {
        console.log("change video client");

        var tabId = sender.tab.id;
        if (tabId != tab)
            return;

        chrome.tabs.update(tabId, { active: true, url: "https://www.wakanim.tv/" + message.location + "/v2/catalogue/episode/" + message.videoId }, _ => {
            insertScript(tabId);
        });
    } else if (message.command == 'createVideoClient') {
        console.log("create video client");
        tab = message.tab;
    } else if (message.command == 'send info') {
        console.log("get info");

        if (message.username)
            username = message.username;
        if (message.roomnum)
            roomnum = message.roomnum;
    }
});

function sendInfo(tabId) {
    console.log("send info");
    chrome.tabs.sendMessage(tabId,
        {
            command: 'new user',
            username: username,
        })
    chrome.tabs.sendMessage(tabId,
        {
            command: 'new room',
            roomnum: roomnum
        })
}

function insertScript(tabId) {
    var listener = message => {
        if (message.command == 'scipt loaded') {
            console.log("scipt loaded");
            chrome.runtime.onMessage.removeListener(listener);
            sendInfo(tabId);
        }
    };
    chrome.runtime.onMessage.addListener(listener);

    console.log("executeScript");
    chrome.tabs.executeScript(tabId, {
        runAt: "document_end",
        file: "/js/listener.js"
    })
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (tabId === tab && changeInfo.url && changeInfo.url.startWith("https://www.wakanim.tv/fr/v2/catalogue/episode/")) {
        console.log("updated");
        insertScript(tabId);
    }
});

function reportError(error) {
    console.error(`Could not beastify: ${error}`);
}