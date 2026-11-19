
const pdfUrl = "https://nova-hub-1-0-api.onrender.com/quran";

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

let quranPDF;
let currentPage = 1;
let rendering = false;

const canvas = document.getElementById("quran-canvas");
const ctx = canvas.getContext("2d");

async function loadQuran() {
    try {
        document.getElementById("quran-loading").textContent =
            "Loading the Holy Quran...";

        quranPDF = await pdfjsLib.getDocument(pdfUrl).promise;

        document.getElementById("quran-loading").textContent = "";

        renderPage(currentPage);
    } catch (error) {
        console.error("Quran loading error:", error);

        document.getElementById("quran-loading").textContent =
            "Could not load the Quran. Please try again.";
    }
}

async function renderPage(pageNumber) {
    if (!quranPDF || rendering) return;

    rendering = true;

    try {
        canvas.classList.add("page-changing");
        const page = await quranPDF.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.0 });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
            canvasContext: ctx,
            viewport: viewport
        }).promise;
        requestAnimationFrame(() => {
    canvas.classList.remove("page-changing");
});

        document.getElementById("quran-page").textContent =
            `Page ${pageNumber} / ${quranPDF.numPages}`;

        document.getElementById("quran-prev").disabled =
            pageNumber === 1;

        document.getElementById("quran-next").disabled =
            pageNumber === quranPDF.numPages;

    } catch (error) {
        console.error("Page rendering error:", error);
    } finally {
        rendering = false;
    }
}

document.getElementById("quran-prev").addEventListener("click", () => {
    if (currentPage > 1 && !rendering) {
        currentPage--;
        renderPage(currentPage);
    }
});

document.getElementById("quran-next").addEventListener("click", () => {
    if (quranPDF && currentPage < quranPDF.numPages && !rendering) {
        currentPage++;
        renderPage(currentPage);
    }
});

loadQuran();
