const send = (data) => {
    window.parent.postMessage(data, "*");
}

const receive = (callback) => {
    window.addEventListener("message", e => callback(e["data"]));
}

window.send = send;
window.receive = receive;