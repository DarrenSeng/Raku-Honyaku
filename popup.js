if (chrome.runtime?.id) {

  let isShiftPressed = false;
  let isLeftMouseDown = false;
  let isMouseMoved = false;
  let startPosition = { x: 0, y: 0 };
  let endPosition = { x: 0, y: 0 };
  let selectionOverlay = null;
  const popupContainer = document.createElement('div');
  const imgText = document.createElement('div');
  const english = document.createElement('div');
  imgText.style.paddingTop = '40px';
  imgText.style.fontSize = '22px';
  english.style.fontSize = '22px';
  imgText.classList.add('centered-text')
  english.classList.add('centered-text')
  Object.assign(popupContainer.style, {
    position: 'absolute',
    width: '200px',
    height: '150px',
    border: '2px solid #888',
    background: '#FFF',
    zIndex: '1000'
  });

  function createCloseButton() {
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '0';
    closeButton.style.right = '0';
    closeButton.style.cursor = 'pointer'; 
    return closeButton;
  }


  document.addEventListener('DOMContentLoaded', function () {
    const apiKeyInput = document.getElementById('apiKey');
    const removeBtn = document.getElementById("removeBtn")
    const showBtn = document.getElementById('showBtn');
    const submitBtn = document.getElementById("submitBtn");
    const toggleSwitch = document.getElementById('toggleSwitch');
    toggleSwitch.addEventListener('change', function() {
      if (toggleSwitch.checked) {
        chrome.storage.local.set({ "toggleSwitchStatus": true }, function () {
          //console.log("Toggle switch status has been stored.");
        });
      } else {
        chrome.storage.local.remove("toggleSwitchStatus", function () {
          //console.log("Toggle switch status has been removed.");
        });
      }
  });

    removeBtn.addEventListener('click', async () => {
      chrome.storage.local.remove("apiKey", function() {
        //console.log("API Key removed from storage.");
        apiKeyInput.value = '';
        //console.log(apiKeyInput.textContent)
      });
    })

    showBtn.addEventListener('click', function () {
      // Toggle between password and text types
      const currentType = apiKeyInput.type;
      if (currentType === 'password' && showBtn.textContent == 'Show') {
        apiKeyInput.type = 'text';
        showBtn.textContent = 'Hide';
      } else {
        apiKeyInput.type = 'password';
        showBtn.textContent = 'Show';
      }
    });

    submitBtn.addEventListener('click', async () => {
      const apiKey = apiKeyInput.value;
      chrome.storage.local.set({ "apiKey": apiKey }, function () {
        //console.log("API Key has been stored.");
      });
      //console.log('your api key' + apiKey)
    })

    chrome.storage.local.get("apiKey", function (result) {
      const apiKey = result.apiKey;
      if (apiKey) {
        apiKeyInput.value = apiKey
        //console.log('apiKeyInput', apiKeyInput.value)
        //console.log("Retrieved API Key:", apiKey);
      } else {
        //console.error("API Key not found.");
      }
    });

    chrome.storage.local.get("toggleSwitchStatus", function (result) {
      const storedStatus = result.toggleSwitchStatus;
      toggleSwitch.checked = storedStatus
      //console.log("Toggle switch status:", storedStatus);
    });

  });




// Function to send the captured image data to Google Vision API
  async function sendToGoogleVisionAPI(capturedImageData) {
    const apiKeyResult = await getApiKey();
    const apiKey = apiKeyResult.apiKey;
    //console.log('api key called from sendtovisionAPI ' + apiKey)
    if (!apiKey) {
      //console.log('no api key')
      isShiftPressed = false;
      isLeftMouseDown = false;
      isMouseMoved = false;
      removeSelectionOverlay()
      alert("API key not found. Please enter and submit the API key.");
      return null
    } else {
      const apiUrl = 'https://vision.googleapis.com/v1/images:annotate?key=' + apiKey;

      const requestBody = {
          requests: [
              {
                  image: {
                      content: capturedImageData.split(',')[1], // Extract base64-encoded image data
                  },
                  features: [
                      {
                          type: 'TEXT_DETECTION',
                      },
                  ],
              },
          ],
      };
      try {
          const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
          });

          if (response.ok) {
              const result = await response.json();
              // Handle the response from Google Vision API (extracted text)
              const extractedText = result.responses[0]?.fullTextAnnotation?.text;
              //console.log('Extracted Text from Google Vision API:', extractedText);
              imgText.textContent = extractedText
              popupContainer.appendChild(imgText)
              centerText(imgText);
              return extractedText;
          } else {
            if (apiKey) {
              alert('Error sending image to Google Vision API. Please resubmit your API key.', response.statusText);
            }
              isShiftPressed = false;
              isLeftMouseDown = false;
              isMouseMoved = false;
              return null;
          }
      } catch (error) {
          //console.error('Error:', error);
          return null;
      }
    }
  }

  async function sendToTranslationAPI(translatedText) {
    // Your Google Cloud Translation API key
    const apiKeyResult = await getApiKey();
    const apiKey = apiKeyResult.apiKey;
    const apiUrl = 'https://translation.googleapis.com/language/translate/v2?key=' + apiKey;

    if (translatedText) {
        try {
            const translationResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: translatedText,
                    source: 'ja', // Source language (Japanese)
                    target: 'en', // Target language (English)
                }),
            });

            if (translationResponse.ok) {
                const translationResult = await translationResponse.json();
                const engText = translationResult.data.translations[0].translatedText;
                console.log('Translated Text:', engText);
                const decodedEngText = new DOMParser().parseFromString(engText, 'text/html').body.textContent;
                console.log('Decoded Translated Text:', decodedEngText);
                english.textContent = decodedEngText;

                const popupWidth = Math.max(translatedText.length, engText.length) * 15 + 20; // Add some padding
                const popupHeight = 120;
                const popupLeft = endPosition.x > document.body.scrollWidth / 2 ? startPosition.x - popupWidth : endPosition.x + 50;
                const popupTop = (startPosition.y + endPosition.y) / 2 + window.scrollY;
                //console.log('document body scroll width', document.body.scrollWidth)
                popupContainer.style.left = `${popupLeft}px`;
                popupContainer.style.width = `${popupWidth}px`;
                popupContainer.style.height = `${popupHeight}px`;
                popupContainer.style.left = `${popupLeft}px`;
                popupContainer.style.top = `${popupTop}px`;
                popupContainer.appendChild(english)
                centerText(english);
                document.body.appendChild(popupContainer);
            } else {
                //console.error('Error translating text:', translationResponse.statusText);
            }
        } catch (error) {
            //console.error('Error translating text:', error);
        }
    }
  }


  document.addEventListener('keydown', (event) => {
    if (event.key === 'Shift') {
      isShiftPressed = true;
    }
  });


  document.addEventListener('keyup', async (event) => {
    if (event.key === 'Shift') {
      isShiftPressed = false;
      if (isLeftMouseDown && isMouseMoved && startPosition != endPosition) {
        getImageData(startPosition, endPosition, async function(screenshotDataUrl) {
          
          //const extractedText = '横取りした' //example var for testing, doesn't use api key
          const extractedText = await sendToGoogleVisionAPI(screenshotDataUrl) 
          if (extractedText) {
            const engText = await sendToTranslationAPI(extractedText);
            
        } 
          const closeButton = createCloseButton();
          closeButton.addEventListener('click', () => {
            document.body.removeChild(popupContainer);
          });
          popupContainer.appendChild(closeButton);
          removeSelectionOverlay();
      }); 
      }
      isLeftMouseDown = false;
      isMouseMoved = false;
    }
  });

  document.addEventListener('mousedown', (event) => {
    if (event.button === 0 && isShiftPressed) { // Left mouse button and 'Shift' key pressed
      isLeftMouseDown = true;
      startPosition = { x: event.clientX, y: event.clientY };
      endPosition = { x: event.clientX, y: event.clientY };
      event.preventDefault()
      createSelectionOverlay();
    }
  });


  document.addEventListener('mouseup', async (event) => {
      if (event.button === 0 && isLeftMouseDown && isShiftPressed && (startPosition != endPosition)) { // Left mouse button released
          isLeftMouseDown = false;
          if (isMouseMoved) {
              getImageData(startPosition, endPosition, async function(screenshotDataUrl) {
                  //let extractedText = '横取りした' //example var
                  console.log("vision api request sent from mouseup")
                  const extractedText = await sendToGoogleVisionAPI(screenshotDataUrl) 
                  if (extractedText) {
                    //const engText = 'dummy'
                    const engText = await sendToTranslationAPI(extractedText);
                  } 
                  const closeButton = createCloseButton();
                  closeButton.addEventListener('click', () => {
                    document.body.removeChild(popupContainer);
                  });
                  popupContainer.appendChild(closeButton);
                  removeSelectionOverlay();
              });
          }
          isMouseMoved = false;
      }
    });
   
  document.addEventListener('mousemove', async (event) => {
    if (isShiftPressed && isLeftMouseDown && selectionOverlay) {
      isMouseMoved = true;
      endPosition = { x: event.clientX, y: event.clientY };
      updateSelectionOverlay();
    }
  });

  function createSelectionOverlay() { 
    chrome.storage.local.get("toggleSwitchStatus", function (result) {
      const storedStatus = result.toggleSwitchStatus;
      if (storedStatus){
        //console.log('creating selection overlay')
        selectionOverlay = document.createElement('div');
        selectionOverlay.style.position = 'absolute';
        selectionOverlay.style.border = '3px dashed #FF0000';
        selectionOverlay.style.opacity = '0.85';
        document.body.appendChild(selectionOverlay);
        }
    });
  }
  
  function updateSelectionOverlay() {
    if (selectionOverlay){ //document.body.scrollWidth
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      const adjustedStartPosition = {
        x: startPosition.x + scrollX,
        y: startPosition.y + scrollY,
      };
      const width = endPosition.x - startPosition.x;
      const height = endPosition.y - startPosition.y;
    
      selectionOverlay.style.left = `${adjustedStartPosition.x}px`;
      selectionOverlay.style.top = `${adjustedStartPosition.y}px`;
      selectionOverlay.style.width = `${width}px`;
      selectionOverlay.style.height = `${height}px`;
    }
  }
  
  function removeSelectionOverlay() {
    if (selectionOverlay) {
      document.body.removeChild(selectionOverlay);
      selectionOverlay = null;
    }
  }

  function getImageData(start, end, callback) {
    chrome.runtime.sendMessage({
        action: 'captureScreenshot',
        startPosition: start,
        endPosition: end,
    }, function(response) {
        if (response && response.imgSrc) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const image = new Image();
            image.src = response.imgSrc;
            image.onload = function() {
                // Calculate the width and height of the capture area
                const width = Math.abs(end.x - start.x);
                const height = Math.abs(end.y - start.y);
                // Draw the captured image onto the canvas
                context.drawImage(image, start.x, start.y, width, height, 0, 0, width, height);
                // Get the data URL of the cropped image from the canvas
                const croppedImageDataURL = canvas.toDataURL('image/png');
                console.log('Dimensions of the cropped image:', width, height);
                // Call the callback function with the cropped image data URL
                callback(croppedImageDataURL);
            }
        } else {
            // Call the callback function with an error indicator or appropriate fallback
            callback(null);
        }
    });
  }

function centerText(element) {
  element.style.display = 'flex';
  element.style.alignItems = 'center';
  element.style.justifyContent = 'center';
}

async function getApiKey() {
  return new Promise((resolve) => {
      chrome.storage.local.get("apiKey", function(result) {
          const apiKey = result.apiKey;
          resolve({ apiKey });
      });
  });
}
}