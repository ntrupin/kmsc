const send = (data) => {
    window.parent.postMessage(data, "*");
}

const receive = (callback) => {
    window.addEventListener("message", e => callback(e["data"]));
}