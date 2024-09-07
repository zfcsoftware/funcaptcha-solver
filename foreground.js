const apiKey = ''

function simulateUserClick(element) {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    element.dispatchEvent(new MouseEvent('mousemove', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
    }));

    element.dispatchEvent(new MouseEvent('mousedown', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
    }));

    element.dispatchEvent(new MouseEvent('mouseup', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
    }));

    element.dispatchEvent(new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
    }));
}



async function blobToBase64(blobUrl) {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return base64String;
}

async function getImageBlob() {
    let repeat = 0
    while ((!document.querySelector("#root .screen img") || !document.querySelector('#root .screen button.button')) && repeat < 10) {
        await new Promise(resolve => setTimeout(resolve, 1000))
    }
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (document.querySelector('.match-game-alert')) return resolve(true)

    if (!document.querySelector("#root .screen img") || !document.querySelector('#root .screen button.button')) return false
    return window.getComputedStyle(document.querySelector("#root .screen img"))
        .getPropertyValue('background-image')
        .match(/url\(["']?(.*?)["']?\)/)
        .filter(item => !item.includes("url") && item.includes("blob:"))[0]
}

function createTask(base64Data, message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            action: "fetchLink",
            url: "https://ipv6.cap.guru/in.php",
            data: {
                "key": apiKey,
                "type": "base64",
                "method": "base64",
                "body": 'data:image/jpeg;base64,' + base64Data,
                "click": "funcap2",
                "textinstructions": message,
                "now": "1",
                json: 1
            }
        }, (response) => {
            resolve(response.data);
        });
    })
}

function taskResult(id) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            action: "fetchLink",
            url: "https://ipv6.cap.guru/res.php",
            data: {
                "key": apiKey,
                action: "get",
                "json": 1,
                id
            }
        }, (response) => {
            resolve(response.data);
        });
    })
}

async function detectClickedLengh(base64Data, message) {
    let taskData = await createTask(base64Data, message)
    if (!taskData || !taskData.request) return false
    let id = taskData.request
    let taskRes = null

    while (taskRes == null) {
        let sessionRes = await taskResult(id)
        if (sessionRes && sessionRes.status == 1) taskRes = sessionRes
        else if (sessionRes.request == "ERROR_CAPTCHA_UNSOLVABLE") taskRes = false
        else await new Promise(resolve => setTimeout(resolve, 1000))
    }
    return taskRes.request
}


async function solveFuncaptcha() {
    let startButton = null
    let repeat = 0
    while (!startButton && repeat < 10) {
        startButton = document.querySelector('#root .screen button.button')
        if (!startButton) await new Promise(resolve => setTimeout(resolve, 1000))
        repeat++
    }
    if (!startButton) return false
    simulateUserClick(startButton)
    let whileStatus = true
    while (whileStatus) {
        if (document.querySelector('.match-game-alert')) {
            simulateUserClick(document.querySelector('#root .screen button.button'))
            whileStatus = false
            solveFuncaptcha()
            continue
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
        let blobData = await getImageBlob()
        if (blobData === true) {
            simulateUserClick(document.querySelector('#root .screen button.button'))
            whileStatus = false
            solveFuncaptcha()
            continue
        }
        if (!blobData) whileStatus = false
        let base64Data = await blobToBase64(blobData)
        let result = await detectClickedLengh(base64Data, document.querySelector('[role="text"]').textContent)

        if (document.querySelector('.match-game-alert')) {
            simulateUserClick(document.querySelector('#root .screen button.button'))
            whileStatus = false
            solveFuncaptcha()
            continue
        }
        for (let i = 0; i < (Number(result) - 1); i++) {
            simulateUserClick(document.querySelector('.right-arrow'))
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        await new Promise(resolve => setTimeout(resolve, 500))
        simulateUserClick(document.querySelector('#root .screen button.button'))
    }
}



window.onload = () => {
    if (document.URL.includes("arkoselabs")) solveFuncaptcha()
}