async function loadapistatus() {
    try {
        let response = await fetch("http://localhost:3000/status");

        if (!response.ok) {
            throw new Error("API request failed");
        }

        let data = await response.json();

        document.getElementById("apiStatus").textContent =
            `Status: ${data.status}, Uptime: ${data.uptime.toFixed(2)} seconds, Version: ${data.version}`;

        console.log(data);
        console.log("API is online");

    } catch (error) {
        document.getElementById("apiStatus").textContent =
            "Status: OFFLINE";

        console.error("API ERROR:", error);
    }
}

loadapistatus();
setInterval(loadapistatus, 1000);

const messageInput = document.getElementById("messageInput")
const sendMessage  = document.getElementById("sendMessage")
const messagesList = document.getElementById("messagesList")

sendMessage.addEventListener("click", async () => {
    const message = messageInput.value.trim();

    if (message === "") {
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        if (data.success) {
            const li = document.createElement("li");
            li.textContent = data.message;
            messagesList.appendChild(li);

            messageInput.value = "";
        }

    } catch (error) {
        console.error("Message failed:", error);
    }
});

async function fetchmessages() {
    try {
        const response = await fetch("http://localhost:3000/messages");

        if (!response.ok) {
            throw new Error("Failed to load messages");
        }

        const data = await response.json();

        messagesList.innerHTML = "";

        data.messages.forEach((msg) => {
            const li = document.createElement("li");
            li.textContent = msg.message;
            messagesList.appendChild(li);
        });

    } catch (error) {
        console.error("Loading messages failed:", error);
    }
}

fetchmessages();