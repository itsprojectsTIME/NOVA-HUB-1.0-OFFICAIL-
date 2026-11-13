



// NOTES
const noteInput = document.getElementById("noteInput");

if (noteInput) {
    noteInput.value = localStorage.getItem("novaNote") || "";

    noteInput.addEventListener("input", () => {
        localStorage.setItem("novaNote", noteInput.value);
    });
}

// TASKS
const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");

function saveTasks() {
    const tasks = [];

    taskList.querySelectorAll("li").forEach((task) => {
        tasks.push({
            text: task.textContent,
            completed: task.classList.contains("completed")
        });
    });

    localStorage.setItem("novaTasks", JSON.stringify(tasks));
}

function addTask(taskText) {
    const li = document.createElement("li");
    li.textContent = taskText;

    li.addEventListener("click", () => {
        li.classList.toggle("completed");
        saveTasks();
    });

    taskList.appendChild(li);
}

function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem("novaTasks")) || [];

    savedTasks.forEach((task) => {
        addTask(task.text);

        if (task.completed) {
            taskList.lastElementChild.classList.add("completed");
        }
    });
}

if (taskInput && addTaskButton && taskList) {
    loadTasks();

    addTaskButton.addEventListener("click", () => {
        const taskText = taskInput.value.trim();

        if (taskText === "") return;

        addTask(taskText);
        saveTasks();
        taskInput.value = "";
    });
}
const liveClock = document.getElementById("liveClock");

async function updateClock() {
    if (!liveClock) return;

    try {
        const response = await fetch("https://nova-hub-1-0-api.onrender.com/about");
        const data = await response.json();

        liveClock.textContent = new Date(data.timestamp).toLocaleString();
    } catch (error) {
        console.error("Clock error:", error);
    }
}

if (liveClock) {
    updateClock();
    setInterval(updateClock, 1000);
}
document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "m") {
        const terminal = document.getElementById("secretTerminal");
if (terminal) terminal.style.display = "block";
    }
});

function closeSecret() {
    document.getElementById("secretTerminal").style.display = "none";
}
let secretCode = "";

document.addEventListener("keydown", (event) => {
    secretCode += event.key.toLowerCase();

    if (secretCode.length > 4) {
        secretCode = secretCode.slice(-4);
    }

    if (secretCode === "nova") {
        document.body.style.transition = "0.3s";
        document.body.style.filter = "invert(1) hue-rotate(180deg)";

        setTimeout(() => {
            document.body.style.filter = "none";
            alert("☠ DARK NOVA FOUND YOU ☠\nYou discovered the secret.");
        }, 1000);

        secretCode = "";
    }
});
let hackCode = "";

document.addEventListener("keydown", (event) => {
    hackCode += event.key.toLowerCase();
    hackCode = hackCode.slice(-4);

    if (hackCode === "hack") {
        document.body.innerHTML = `
            <div style="
                background:black;
                color:#ff0033;
                min-height:100vh;
                text-align:center;
                padding-top:20vh;
                font-family:monospace;
            ">
                <h1>⚠ SYSTEM BREACHED ⚠</h1>
                <h2>ACCESSING DARK NOVA FILES...</h2>
                <p>Decrypting secrets...</p>
                <p>ERROR 404: BRAIN NOT FOUND 💀</p>
                <button onclick="location.reload()">RESTORE SYSTEM</button>
            </div>
        `;
    }
});
const messagesCard = document.getElementById("project-messages");

if (messagesCard) {
    messagesCard.addEventListener("click", function() {
        alert("Welcome to Messages!");
    });
}
document.addEventListener("keydown", (Event) =>{
    if (Event.altKey && Event.key.toLowerCase() === "a") {
        const adminPanel = document.getElementById("openadmin");
if (adminPanel) adminPanel.style.display = "block";       
    }
});
const submitButton = document.getElementById("submit-button");

if (submitButton) {
    submitButton.addEventListener("click", async () => {
        const password = document.getElementById("password").value;

        const response = await fetch("https://nova-hub-1-0-api.onrender.com/adminpass", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ password: password })
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = "admin.html";
        } else {
            alert("WRONG PASSWORD!");
        }
    });
}

let country = "saudi arabia";
let city = localStorage.getItem("city") || "Select";

let url = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=4`;

async function prayertime() {
    if (!document.getElementById("date")) return;
    try {
        let response = await fetch(url);
        let data = await response.json();

        if (!data.data || !data.data.timings) {
    throw new Error("Prayer time data is missing");
}
        

        // Store prayer times
        let fajr = data.data.timings.Fajr;
        let dhuhr = data.data.timings.Dhuhr;
        let asr = data.data.timings.Asr;
        let maghrib = data.data.timings.Maghrib;
        let isha = data.data.timings.Isha;

        // Display date
        document.getElementById("date").textContent =
            data.data.date.hijri.date;

        // Display prayer times
        document.getElementById("fajr").textContent = `${fajr} - Fajr`;
        document.getElementById("dhuhr").textContent = `${dhuhr} - Dhuhr`;
        document.getElementById("asr").textContent = `${asr} - Asr`;
        document.getElementById("maghrib").textContent = `${maghrib} - Maghrib`;
        document.getElementById("isha").textContent = `${isha} - Isha`;
        return data.data.timings;

    } catch (error) {
        console.error("Prayer time error:", error);
    }
}


async function comparetime() {
    let prayer = await prayertime();
    if (!prayer) return;

///comparing
let fajr = prayer.Fajr;
let [fajrhours, fajr1minutes] = fajr.split(":").map(Number)
let fajrminutes = fajrhours * 60 + fajr1minutes;



let dhuhr = prayer.Dhuhr;
let [dhuhrhours, dhuhr1minutes] = dhuhr.split(":").map(Number)
let dhuhrminutes = dhuhrhours * 60 + dhuhr1minutes;




let asr = prayer.Asr;
let [asrhours, asr1minutes] = asr.split(":").map(Number)
let asrminutes = asrhours * 60 + asr1minutes;




let maghrib = prayer.Maghrib;
let [maghribhours, maghrib1minutes] = maghrib.split(":").map(Number)
let maghribminutes = maghribhours * 60 + maghrib1minutes;





let isha = prayer.Isha;
let [ishahours, isha1minutes] = isha.split(":").map(Number)
let ishaminutes = ishahours * 60 + isha1minutes;

let prayerTimes = {
    fajr: fajrminutes,
    dhuhr: dhuhrminutes,
    asr: asrminutes,
    maghrib: maghribminutes,
    isha: ishaminutes
};



let now = new Date();

let currentMinutes = now.getHours() * 60 + now.getMinutes();





let nextPrayer = null;
for (let [loop_iguess, prayerMins] of Object.entries(prayerTimes)) {
    if (prayerMins > currentMinutes && nextPrayer === null) {
        nextPrayer = loop_iguess;
    }
}
if (nextPrayer === null) {
    nextPrayer = "Fajr (Tomorrow)";
}
const nextPrayerElement = document.getElementById("nextprayertime");

if (nextPrayerElement) {
    nextPrayerElement.textContent = "Next Prayer: " + nextPrayer;
}
}

comparetime();
function changecity() {
    city = document.getElementById("cityname").value
    localStorage.setItem("city", city);

    url = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=4`;

    comparetime();
}
const cityInput = document.getElementById("cityname");

if (cityInput) {
    cityInput.value = city;
}
prayertime()

async function getnews() {
    document.getElementById("new").textContent = "Loading news...";

    try {
        const response = await fetch("https://nova-hub-1-0-api.onrender.com/news");

        if (!response.ok) {
            throw new Error("Failed to load news");
        }

        const data = await response.json();

        if (!Array.isArray(data.results)) {
            throw new Error("Invalid news response");
        }

        document.getElementById("new").innerHTML =
            data.results.map(article => `
                <div class="news-card">
                    <img src="${article.image_url || ""}" alt="News image">

                    <h3>${article.title}</h3>

                    <p>${article.description || "No description available."}</p>

                    <a href="${article.link}" target="_blank" rel="noopener noreferrer">
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
setInterval(getnews, 15 * 60 * 1000);
