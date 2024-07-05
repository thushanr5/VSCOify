let btnClick = document.getElementById('image_title_btn');
let titleNameUrl;
let dateNameUrl;
let countUrlTimes = 0;
let outputUrl;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    if(request.action === 'sendTitleData'){
        let titleText = request.titleTextData;
        // Modify the value of a form field
        let formField = document.getElementById('image_title');
        formField.value = titleText;

        titleNameUrl = formField.value;
       // Example of sending a response back to the sender
       countUrlTimes+=1;
       sendResponse({ received: true });
    }

    if(request.action === 'sendImageData'){
        let imageSrc = request.titleSrcData;
        
        // Modify the value of a form field
        let formField = document.getElementById('selectedImage');
        countUrlTimes+=1;
        formField.src = imageSrc;
        // sending response back to the sender
       sendResponse({ received: true });
    }

    if(request.action === 'sendDateData'){
        let dateTextInfo = request.dateText;
        // Modify the value of a form field
        let formField = document.getElementById('image_date');

        formField.value = dateTextInfo;
        dateNameUrl = formField.value;
        countUrlTimes+=1;
        //Sending response data back
        sendResponse({ received: true });
    }

    saveFormData()
});

btnClick.addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check if the tab URL starts with "http" or "https" (indicating a web page)
    if (tab.url.startsWith('http') || tab.url.startsWith('https')) {
        // Execute content scripts on regular web pages
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: scrapeVSCOTitleText,
        });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: scrapeVSCOImage,
        });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: scrapeVSCODate,
        });
    } else {
        // Handle cases where the tab URL is not a standard web page
        console.error('Cannot execute content script on a chrome:// URL');
    }    
});


function scrapeVSCOTitleText() {
    let titleElements = document.getElementsByClassName('css-12z9kj5 e16r3lq40');
    if (titleElements.length > 0) {
        let titleText = titleElements[0].textContent;
        if (titleText) {
            chrome.runtime.sendMessage({ action: 'sendTitleData', titleTextData : titleText });
        } else {
            console.log("Element found, but no text content.");
        }
    } else {
        console.log("Element with specified class not found.");
    }
}

function scrapeVSCOImage() {
    let imageElement = document.querySelector('.css-7eh5aw.e1lxikmc0').querySelector('img');

    if (imageElement) {
        let imageSrc = imageElement.src;
        if (imageSrc) {
            chrome.runtime.sendMessage({ action: 'sendImageData', titleSrcData : imageSrc });
        } else {
            console.log("Element found, but no text content.");
        }
    } else {
        console.log("Element with specified class not found.");
    }
}


function scrapeVSCODate() {
    let dateElement = document.getElementsByClassName('css-ung408 e15pim120');
    if (dateElement.length > 0) {
        let textData = dateElement[0].textContent;
        let dateFormatted = dateFormatter(textData);
        if (textData) {
            chrome.runtime.sendMessage({ action: 'sendDateData', dateText : dateFormatted });
        } else {
            console.log("Element found, but no text content.");
        }
    } else {
        console.log("Element with specified class not found.");
    }    
}



function saveFormData() {
    let form = document.getElementById('form');
    let savedFileString;

    form.addEventListener('submit', function(event){
        event.preventDefault();

        const title = document.getElementById('image_title').value;
        const image = document.getElementById('selectedImage').src;
        const date = document.getElementById('image_date').value;

        savedFileString = "Image title: " + title + ", Date: " + date;
        
        fetch(image)
        .then(response => response.blob())
        .then(blob => {
          let url = window.URL.createObjectURL(blob);
          let a = document.createElement('a');
          a.href = url;
          a.download = savedFileString.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg'; // Sanitize the filename
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        })
        .catch(error => console.error('Error fetching the image:', error));
        

        console.log(savedFileString);
    })
}
