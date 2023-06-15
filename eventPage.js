// creates the context menu item in chrome
let contextMenuItem = {
    "id": "copyItem",
    "title": "Add Highlighted text",
    "contexts": ["selection"]
};
chrome.contextMenus.create(contextMenuItem);

// When user clicks the Clipy contextMenu item it add the highlighted text to chrome storage
chrome.contextMenus.onClicked.addListener(function(clickData){
    if(clickData.menuItemId === "copyItem" && clickData.selectionText) {
        chrome.storage.sync.get("data", function(items) {
            items.data.push(clickData.selectionText);
            chrome.storage.sync.set({data: items.data});
        });
    }
})