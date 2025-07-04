const STORAGE_KEY = "qr_quiz_log";

function getLog() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveLogEntry(type, data) {
    const log = getLog();
    log.push({ time: new Date().toISOString(), type, data });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
    console.log(getLog())
}
