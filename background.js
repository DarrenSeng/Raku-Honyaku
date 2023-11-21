chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'captureScreenshot') {
        const { startPosition, endPosition } = request;
        const width = Math.abs(endPosition.x - startPosition.x);
        const height = Math.abs(endPosition.y - startPosition.y);
        chrome.tabs.captureVisibleTab( null,{},function(dataUrl) {
            console.log({imgSrc:dataUrl});
                sendResponse({imgSrc:dataUrl});
            });
        return true;
    }
});