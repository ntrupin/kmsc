const buttons = ["oleft", "oright", "flinc", "fldec"].map((id) => {
    return document.querySelector(`button#${id}`);
});

buttons.forEach((b) => {
    b.addEventListener("click", (e) => {
        send(e.target.id);
    });
});

send("connect");