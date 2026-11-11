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
setInterval(loadapistatus, 10000);

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
            li.textContent = data.data.message;
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
async function getnews() {
    document.getElementById("new").textContent = "Loading news...";
    try {
        const response = await fetch("http://localhost:3000/news");

        if (!response.ok) {
            throw new Error("Failed to load news");
        }

        const data = await response.json();
        if (!Array.isArray(data.articles)) {
    throw new Error("Invalid news response");
}

        document.getElementById("new").innerHTML =
            data.articles.map(article => `
                <div class="news-card">
    <img src="${article.image || ""}" alt="News image">

    <h3>${article.title}</h3>

    <p>${article.description || "No description available."}</p>

    <a href="${article.url}" target="_blank" rel="noopener noreferrer">
        Read More →
    </a>
</div>
            `).join("");

    } catch (error) {
        console.error("News error:", error);
        document.getElementById("new").textContent =
            "Failed to load news.";
    }
}
getnews();
setInterval(getnews, 24 * 60 * 60 * 1000);

