alert("NOVA HUB CREATE ACCOUNT ONLINE!");
const form = document.getElementById("CreateAccountForm");
form.addEventListener("submit", async function(event) {

    event.preventDefault();
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;
if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
}
const response = await fetch("http://localhost:3000/register", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        username: username,
        email: email,
        password: password
    })
});
const data = await response.json();

if (response.ok) { 
    alert("Account created successfully!");
    document.getElementById("informer").textContent = ("Account created successfully!")
    window.location.href = "login.html";
} else {
    document.getElementById("informer").textContent = data.message;
}


});
