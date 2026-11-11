
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
alert("ABOUT TO CONTACT SERVER");
try {
    const response = await fetch("https://nova-hub-1-0-api.onrender.com/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            email,
            password
        })
    });

    alert("SERVER STATUS: " + response.status);

    const data = await response.json();
    document.getElementById("informer").textContent = data.message;

} catch (error) {
    alert("FETCH ERROR: " + error.message);
    console.error(error);
}
});
