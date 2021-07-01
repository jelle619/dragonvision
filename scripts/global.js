// Change cursor state during loading
document.addEventListener("DOMContentLoaded", function (event) {
    document.body.style.cursor = "wait";
    window.onload = function () { document.body.style.cursor = "default"; };
});



// Console warning
console.log("%cHere be dragons! 🐲", "color: blue; font-size: 35px; font-weight: 800;");
console.log("%cThis is a browser feature intended for developers. If someone told you to paste something here, it is a scam and will give them access to your dataset and/or personal data.", "color: black; font-size: 20px;");