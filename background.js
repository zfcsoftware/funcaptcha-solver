chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request.data);
    if (request.action === "fetchLink") {
        fetch(request.url, {
            "headers": {
                "content-type": "application/json"
            },
            "body": JSON.stringify(request.data),
            "method": "POST"
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                sendResponse({ data: data });
            })
            .catch(err => {
                console.error("İstek hatası:", err);
                sendResponse({ data: "Error fetching the link" });
            });
        return true;
    }
});
