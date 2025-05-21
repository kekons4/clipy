const addBtn = document.getElementById("add");
const clearElem = document.getElementById("clear");
const listElm = document.getElementById("copylist");
const inputElm = document.getElementById("item");

// For downloading image data anc converting it into png
const image = new Image;
const c = document.createElement('canvas');
const ctx = c.getContext('2d');

// Current size of list array
let currentSize = 0;

// Converts downloaded image blob into png
function setCanvasImage(path,func){
    image.onload = function(){
        c.width = this.naturalWidth;
        c.height = this.naturalHeight;
        ctx.drawImage(this,0,0);
        c.toBlob(blob=>{
            func(blob)
        },'image/png');
    }
    image.src = path;
}

// Generates the list items on to DOM
function generateListItem(copyData) {
    const msg = document.createElement("li");

    // Checks to see if text is and image or not
    if(copyData.text.includes("img::")) {
        const src = copyData.text.split('img::')[1];
        // console.log(src);
        const img = document.createElement('img');
        img.src = src;
        img.alt = src;
        img.width = "100";
        img.height = "100";

        msg.onclick = async function(e) {
            try {
                setCanvasImage(src,(imgBlob)=>{
                    console.log('adding image to clipboard')
                    navigator.clipboard.write(
                        [
                            new ClipboardItem({'image/png': imgBlob})
                        ]
                    )
                    // .then(e=>{console.log('Image copied to clipboard')})
                    // .catch(e=>{console.log(e)})
                });
            } catch (err) {
                console.log(err);
            }
        }

        // create imagepath link to original image
        const i = document.createElement("i");
        i.classList = "fas fa-external-link-alt imagepath";
        const imageLink = document.createElement("a");
        imageLink.href = src;
        imageLink.target = "_blank";
        imageLink.append(i);

    
        msg.append(imageLink);
    
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
                currentSize = items.data.length;
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
startup()

setInterval(async () => {
  const items = await chrome.storage.sync.get("data"); 
  console.log(items);
  if(items.data.length > currentSize) {
    while(listElm.firstChild){
       listElm.removeChild(listElm.firstChild);
    }
    startup();
  }
}, 100);

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