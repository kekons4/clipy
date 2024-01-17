const addBtn = document.getElementById("add");
const clearElem = document.getElementById("clear");
const listElm = document.getElementById("copylist");
const inputElm = document.getElementById("item");

// Generates the list items on to DOM
function generateListItem(copyData) {
    const msg = document.createElement("li");

    // Checks to see if text is and image or not
    if(copyData.text.includes("img::")) {
        const src = copyData.text.split('img::')[1];
        console.log(src);
        const img = document.createElement('img');
        img.src = src;
        img.alt = src;
        img.width = "100";
        img.height = "100";

        msg.onclick = async function(e) {
            try {
                const [jpegBlob] = await Promise.all([
                    fetch(src).then((response) => response.blob())
                ]);

                const clipboardItem = new ClipboardItem({
                    [jpegBlob.type]: jpegBlob,
                });

                await navigator.clipboard.write([clipboardItem]);
            } catch (err) {
                console.log(err.message);
            }
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

        msg.append(img);

    } else {
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
    }

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

startup();

// Adds item to list and local storage and on the DOM
addBtn.addEventListener("click", async(ev) => {
    const text = inputElm.value;

    // As long as the user doesnt enter nothing
    if(text !== "") {
        // Goes through and adds the next entry item to chrome storage
        await chrome.storage.sync.get("data", function(items) {
            items.data.push(text);
            chrome.storage.sync.set({'data': items.data});
            generateListItem({text: text, index: items.data.length});
        });

        location.reload();
        inputElm.value = '';
    }
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