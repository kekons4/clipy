const addBtn = document.getElementById("add");
const clearElem = document.getElementById("clear");
const listElm = document.getElementById("copylist");
const inputElm = document.getElementById("item");

function generateListItem(copyData) {
    const msg = document.createElement("li");
    msg.onclick = function(e) {
        navigator.clipboard.writeText(e.target.innerText);
    }

    const i = document.createElement("i");
    i.classList = "fas fa-copy copyicon";

    msg.append(i);

    const trash = document.createElement("i");
    trash.setAttribute("data-index", copyData.index);
    trash.classList = "fas fa-trash trash";
    trash.onclick = function(e) {
        const index = e.target.getAttribute("data-index");
        chrome.storage.sync.get("data", async function(items) {
            const newItems = [];
            for(let i = 0; i < items.data.length; i++) {
                if(i != index) {
                    newItems.push(items.data[i]);
                }
            }
            await chrome.storage.sync.set({data: newItems});
        });
        location.reload();
    }
    msg.append(trash);

    const span = document.createElement("span");
    span.innerText = copyData.text;

    msg.append(span);

    listElm.append(msg);
}

async function startup() {
      await chrome.storage.sync.get("data", async function(items) {
        if(!items.hasOwnProperty("data")) {
            await chrome.storage.sync.set({data: []});
            await location.reload();
        } else {
            if(items.data.length === 0) {
                const msg = document.createElement("li");
                msg.innerText = "Add your first item";
                listElm.append(msg);
            } else {
                const listObj = {};
                for(let i = 0; i < items.data.length; i++) {
                    listObj.text = items.data[i];
                    listObj.index = i;
                    generateListItem(listObj);
                }
            }
        }
    });
}

listElm.onload = startup();

// Adds item to list and local storage and on the DOM
addBtn.addEventListener("click", async(ev) => {
    const text = inputElm.value;
    // Goes through and adds the next entry item to chrome storage
    await chrome.storage.sync.get("data", function(items) {
        items.data.push(text);
        chrome.storage.sync.set({'data': items.data});
        generateListItem({text: text, index: items.data.length});
    });

    location.reload();
    inputElm.value = '';
});

// Clears the local storage and dataArray
clearElem.addEventListener("click", async(ev) => {
   await chrome.storage.sync.set({"data": []});

   while(listElm.firstChild){
       listElm.removeChild(listElm.firstChild);
   }
});

// Sets the clicked item to be colored blue
listElm.addEventListener("click", (e) => {
    for(let i = 0; i < listElm.children.length; i++) {
        listElm.children[i].classList = "";
    }

    if(e.srcElement.nodeName === "LI") {
        e.target.classList = "active";
    } else if(e.srcElement.nodeName === "SPAN"){
        e.target.parentNode.classList = "active";
    } else if(e.srcElement.nodeName === "I") {
        if(e.target.classList === "fas fa-trash trash") {

        }
        e.target.parentNode.classList = "active";
    }
});