
const timestamp = new Date().toISOString().split("T")[0];
document.addEventListener("DOMContentLoaded", () => {
    console.log("Welcome to Halal Mode!");
});
let country = "saudi arabia";
let city = localStorage.getItem("city") || "Riyadh";

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
    cityInput.addEventListener("change", changecity);
}
prayertime();
const link = `https://nova-hub-1-0-api.onrender.com/getprayerrecords`
async function getprayerrecords() {
    const response = await fetch(link, {
    credentials: "include"
});
    const data = await response.json();
    data.records.forEach(record => {
    const checkbox = document.getElementById(
    record.prayer_name.toLowerCase() + "-check"
);

if (checkbox) {
    checkbox.checked = record.completed;
}
});
}
getprayerrecords();
function updateCompletionMessage() {
    const prayers = [
        "fajr-check",
        "dhuhr-check",
        "asr-check",
        "maghrib-check",
        "isha-check"
    ];

    const allCompleted = prayers.every(id =>
        document.getElementById(id).checked
    );

    const message = document.getElementById("completion-message");

    message.textContent = allCompleted
        ? "🌙 Alhamdulillah! All five prayers completed today!"
        : "";
        const completedCount = prayers.filter(id =>
    document.getElementById(id).checked
).length;

document.getElementById("prayer-progress").textContent =
    `${completedCount} / 5 prayers completed`;
}
document.querySelectorAll('#prayercounts input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener("change", updateCompletionMessage);
    checkbox.addEventListener("change", () => {
    fetch("https://nova-hub-1-0-api.onrender.com/saveprayer", {
        method: "POST",
        credentials: "include",
        headers: {
    "Content-Type": "application/json"
},
body: JSON.stringify({
    prayer_name: checkbox.value,
    completed:checkbox.checked,
    prayer_date: `${timestamp}`
})
    });
});
});
new Date(timestamp).toLocaleString();
function openAdhkar(type) {
    const title = document.getElementById("adhkar-title");
    const list = document.getElementById("adhkar-list");
        title.textContent = type + " Adhkar";
currentAdhkar = type === "Morning"
    ? adhkarData["أذكار الصباح"]
    : adhkarData["أذكار المساء"];
currentIndex = 0;
remainingCount = Number(currentAdhkar[currentIndex].count);
list.textContent = currentAdhkar[currentIndex].content;
}

document.getElementById("morning-adhkar").addEventListener("click", () => {
    openAdhkar("Morning");
    document.getElementById("adhkar-counter-left").textContent = "1/25";
    document.getElementById("repeat-counter").textContent = remainingCount
});

document.getElementById("evening-adhkar").addEventListener("click", () => {
    openAdhkar("Evening");
    document.getElementById("adhkar-counter-left").textContent = "1/25";
    document.getElementById("repeat-counter").textContent = remainingCount
});
updateCompletionMessage();
let adhkarData = [];
async function getadhkar() {
    const res = await fetch('https://nova-hub-1-0-api.onrender.com/athkar');
    const  data = await res.json();
    adhkarData = data;
    
}
document.getElementById("repeat-button").addEventListener("click", () => {
    if (remainingCount > 0) {
        remainingCount--;
        document.getElementById("repeat-counter").textContent = remainingCount
    }
})
    let currentAdhkar = [];
    let remainingCount = 0;
    let currentIndex = 0;

    `${currentIndex + 1}/${currentAdhkar.length}`
getadhkar();
document.getElementById("next").addEventListener("click", () => {
    if (currentIndex < currentAdhkar.length - 1) {
        currentIndex++
        remainingCount = Number(currentAdhkar[currentIndex].count);
document.getElementById("repeat-counter").textContent = remainingCount;
        document.getElementById("adhkar-counter-left").textContent = "1/25";
        document.getElementById("adhkar-counter-left").textContent = `${currentIndex + 1}/25`
        document.getElementById("adhkar-list").textContent = `${currentAdhkar[currentIndex].content}`
    }
    else {
        console.log(currentIndex)
        document.getElementById("adhkar-list").textContent = "🌙 Alhamdulillah! You've completed your adhkar for today!"
    }
});
document.getElementById("back").addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--
        remainingCount = Number(currentAdhkar[currentIndex].count);
document.getElementById("repeat-counter").textContent = remainingCount;
        document.getElementById("adhkar-list").textContent = `${currentAdhkar[currentIndex].content}`
        document.getElementById("adhkar-counter-left").textContent =
    `${currentIndex + 1}/25`;
    }
});
async function checkLogin() {
    const response = await fetch(
        "https://nova-hub-1-0-api.onrender.com/profile",
        {
            credentials: "include"
        }
    );

    const data = await response.json();
    if (data.success) {
    console.log("Welcome, " + data.username);
    document.getElementById("welcome").textContent = "Welcome to Halal Mode ,"  +  data.username
    }
else {
    console.log("Not logged in!");

    const loginLink = document.createElement("a");

    loginLink.href = "https://nova-hub.darknova.workers.dev/login";
    loginLink.textContent = "please login in through here";
    loginLink.id = "loginlink"

    document.body.appendChild(loginLink);
const message = document.getElementById("displayiflogin");

message.textContent = "Please log in to access your prayer records.";

message.appendChild(loginLink);
}
    console.log(data);
}
checkLogin();
