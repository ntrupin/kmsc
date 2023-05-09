const clicker = document.querySelector("button#clicker");
const counter = document.querySelector("b#counter");

if (clicker) {
    clicker.addEventListener("click", () => {
        send("inc");
    });
}

if (counter) {
    let count = 0;
    receive(data => {
        if (data == "inc") {
            counter.innerHTML = (++count);
        }
    });
}