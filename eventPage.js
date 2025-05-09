// creates the context menu item in chrome
let contextMenuItem = {
    "id": "copyItem",
    "title": "Add Highlighted text",
    "contexts": ["selection"]
};
chrome.contextMenus.create(contextMenuItem);

let pictureMenuItem = {
    "id": "imageItem",
    "title": "Copy Image Data",
    "contexts": ["image"]
};
chrome.contextMenus.create(pictureMenuItem);

// When user clicks the Clipy contextMenu item it add the highlighted text to chrome storage
chrome.contextMenus.onClicked.addListener(function(clickData){
    if(clickData.menuItemId === "copyItem" && clickData.selectionText) {
        chrome.storage.sync.get("data", function(items) {
            items.data.push(clickData.selectionText);
            chrome.storage.sync.set({data: items.data});
        });
    }
    // Adding image src to chrome storage
    if(clickData.menuItemId === "imageItem" && clickData.mediaType === "image") {
        const imgSrcItem = `img::${clickData.srcUrl}`;
        chrome.storage.sync.get("data", function(items) {
            items.data.push(imgSrcItem);
            chrome.storage.sync.set({data: items.data});
        });
    }
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "open-sidepanel",
      title: "Open Side Panel",
      contexts: ["all"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "open-sidepanel") {
      chrome.sidePanel.setOptions({
        tabId: tab.id,
        path: 'sidepanel.html',
        enabled: true
      });
      chrome.sidePanel.open({ tabId: tab.id });
    }
  });
  
  chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: 'sidepanel.html',
      enabled: true
    });
    chrome.sidePanel.open({ tabId: tab.id });
  });
  

