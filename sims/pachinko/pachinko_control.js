const btns = document.querySelectorAll("button.btn");
btns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        send(e.target.getAttribute("id"));
    });
});