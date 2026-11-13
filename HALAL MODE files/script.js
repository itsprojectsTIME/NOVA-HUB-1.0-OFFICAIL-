
console.log("🌙 Halal Mode loaded successfully!");

document.addEventListener("DOMContentLoaded", () => {
    console.log("Welcome to Halal Mode!");
});
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
prayertime();
const link = `https://nova-hub-1-0-api.onrender.com/getprayerrecords`
async function getprayerrecords() {
    const response = await fetch(link)
    const data = await response.json();
    console.log(data)
}
