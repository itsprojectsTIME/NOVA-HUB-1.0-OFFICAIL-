console.log("LOGIN JS IS RUNNING!");

const form = document.getElementById("loginForm");

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    console.log("LOGIN FORM SUBMITTED!");

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("https://nova-hub-1-0-api.onrender.com/login", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    });

    const data = await response.json();

    if (data.success) {
        document.getElementById("informer").textContent =
            "Welcome back, " + data.username + "!";

        alert("Welcome back, " + data.username + "!");
        window.location.href = "dashboard.html";
    } else {
        document.getElementById("informer").textContent =
            data.error || data.message;
    }
});