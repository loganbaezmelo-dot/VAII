import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ==========================================
// 1. CONFIG & KEYS
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyA6RmZ6rquzUR1dct30s355PzLu-r1_fwE",
    authDomain: "vaiinternet.firebaseapp.com",
    projectId: "vaiinternet",
    storageBucket: "vaiinternet.firebasestorage.app",
    messagingSenderId: "367548633672",
    appId: "1:367548633672:web:44da44d1761085424b3e7d",
    measurementId: "G-0XBYP585WQ"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const GOOGLE_API_KEY = "AIzaSyAJ" + "KTkU0nd6" + "ZB_zjIcN" + "QCAQQsff" + "HEp4WH8";
const GEMINI_VISION_KEY = "AQ.Ab8RN" + "6JH2s8Lpq" + "PfRqjRgs" + "OgOMy2f76" + "HU4b4Xmg_CYURTOmgJQ";

const BASELINE_FALLBACK_TREE = [
    { name: "Gemini 3.5", id: "gemini-3.5-flash" },
    { name: "Gemini 3.1", id: "gemini-3.1-flash" },
    { name: "Gemini 3", id: "gemini-3-flash" },
    { name: "Gemini 2.5", id: "gemini-2.5-flash" },
    { name: "Gemini 2", id: "gemini-2-flash" },
    { name: "Gemma 4 31B", id: "gemma-4-31b" },
    { name: "Gemma 4 26B", id: "gemma-4-26b" }
];

// ==========================================
// 2. DOM & STATE
// ==========================================
const authContainer = document.getElementById('auth-container');
const mainApp = document.getElementById('main-app');
const authTitle = document.getElementById('auth-title');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const googleSigninBtn = document.getElementById('google-signin-btn');
const authToggle = document.getElementById('auth-toggle');
const authError = document.getElementById('auth-error');
const logoutActionBtn = document.getElementById('logout-action-btn');

const hubInput = document.getElementById('hub-input');
const datalist = document.getElementById('hub-suggestions');
const executeActionBtn = document.getElementById('execute-action-btn');
const output = document.getElementById('weather-output');
const routingWarning = document.getElementById('routing-warning');

const helpToggle = document.getElementById('help-toggle');
const helpGuide = document.getElementById('help-guide');
const historyToggle = document.getElementById('history-toggle');
const historyDrawer = document.getElementById('history-drawer');
const historyList = document.getElementById('history-list');
const newChatBtn = document.getElementById('new-chat-btn');

const prefsToggleBtn = document.getElementById('prefs-toggle-btn');
const prefsDrawer = document.getElementById('prefs-drawer');
const prefsCloseBtn = document.getElementById('prefs-close-btn');
const prefsInstructionsInput = document.getElementById('prefs-instructions-input');
const prefsSaveBtn = document.getElementById('prefs-save-btn');

const cameraTriggerBtn = document.getElementById('camera-trigger-btn');
const imageFileInput = document.getElementById('image-file-input');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreviewThumbnail = document.getElementById('image-preview-thumbnail');
const imagePreviewFilename = document.getElementById('image-preview-filename');
const imageClearBtn = document.getElementById('image-clear-btn');

let debounceTimer;
let searchAbortController = null;
let activeImageBase64 = null; 
let activeImageMimeType = null;
const wikitubiaCache = new Set();

let chatHistory = [];
let currentSessionId = null;

const welcomeVaiiText = `Welcome to VAII Native! Enter a search query, app routing command, calculation sequence, weather location, translation phrase, crypto ticker, map request, or art prompt to begin...`;
const welcomeGeminiText = `Welcome to the Gemini Ecosystem! This is a persistent conversational space. Start typing below to begin a continuous chat thread...`;

const defaultAssistantSuggestions = [
    "Open Gemini", "193 lbs to kg", "Open YouTube", "BTC", "Time in Tokyo", 
    "Hello to Spanish", "Open Minecraft", "(12 * 4) / 2", "Map of Orlando", 
    "Draw a neon cyberpunk switch console artwork"
];

window.initVaiiMap = function() {
    console.log("Maps system ready.");
};

// ==========================================
// 3. UTILS & RENDERERS
// ==========================================
function renderMarkdown(text) {
    if (!text) return "";
    let safeHtml = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); 
    safeHtml = safeHtml.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    safeHtml = safeHtml.replace(/\*(.*?)\*/g, "<em>$1</em>");
    safeHtml = safeHtml.replace(/^[\s]*[\*\-]\s+(.*)$/gm, "<li style='margin-left: 15px; margin-bottom: 4px;'>$1</li>");
    safeHtml = safeHtml.replace(/\n/g, "<br>");
    return safeHtml;
}

function updateWelcomeMessageText() {
    if (!output) return;
    const selectedMode = document.querySelector('input[name="vaii-mode"]:checked')?.value;
    output.innerHTML = (selectedMode === "gemini") ? welcomeGeminiText : welcomeVaiiText;
}

function getSavedSessions() {
    try {
        return JSON.parse(localStorage.getItem('vaii_chat_sessions')) || [];
    } catch (e) {
        return [];
    }
}

function saveSessionsToDisk(sessions) {
    localStorage.setItem('vaii_chat_sessions', JSON.stringify(sessions));
}

function saveCurrentSessionState(customGeneratedTitle = null) {
    if (chatHistory.length <= 2) return; 
    let sessions = getSavedSessions();
    let currentSession = sessions.find(s => s.id === currentSessionId);
    
    if (!currentSessionId) {
        currentSessionId = 'session_' + Date.now();
        let fallbackTitle = "Gemini Chat Thread";
        if (chatHistory[2] && chatHistory[2].role === 'user') {
            fallbackTitle = chatHistory[2].parts[0].text.substring(0, 25) + "...";
        }
        currentSession = { id: currentSessionId, title: customGeneratedTitle || fallbackTitle, history: chatHistory };
        sessions.unshift(currentSession);
    } else if (currentSession) {
        currentSession.history = chatHistory;
        if (customGeneratedTitle) {
            currentSession.title = customGeneratedTitle;
        }
    }
    saveSessionsToDisk(sessions);
    renderHistoryListItems();
}

function renderHistoryListItems() {
    if (!historyList) return;
    historyList.innerHTML = "";
    let sessions = getSavedSessions();
    
    if (sessions.length === 0) {
        historyList.innerHTML = `<div style="color: #666; font-size: 0.8rem; font-style: italic; text-align: center; padding: 8px 0;">No saved conversational tracks.</div>`;
        return;
    }
    
    sessions.forEach(session => {
        const row = document.createElement('div');
        row.style = "display: flex; justify-content: space-between; align-items: center; background: #1a1a1a; border: 1px solid #2d2d2d; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: background 0.15s ease; margin-bottom: 4px;";
        row.onmouseenter = () => row.style.background = "#222";
        row.onmouseleave = () => row.style.background = "#1a1a1a";
        
        const textWrapper = document.createElement('span');
        textWrapper.innerText = session.title;
        textWrapper.style = "flex: 1; font-size: 0.82rem; color: #ddd; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; margin-right: 8px;";
        
        textWrapper.addEventListener('click', () => {
            currentSessionId = session.id;
            chatHistory = session.history;
            renderFullChatLogBubble();
            const modeToggleInput = document.querySelector('input[name="vaii-mode"][value="gemini"]');
            if (modeToggleInput) modeToggleInput.checked = true;
            if (historyDrawer) historyDrawer.style.display = "none";
            if (historyToggle) historyToggle.innerText = "📜";
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.innerText = "🗑️";
        deleteButton.style = "background: none; border: none; color: #dc3545; cursor: pointer; padding: 2px 6px; font-size: 0.85rem; transition: opacity 0.15s;";
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            let updatedList = getSavedSessions().filter(s => s.id !== session.id);
            saveSessionsToDisk(updatedList);
            if (currentSessionId === session.id) {
                initializeFreshChatSession();
            }
            renderHistoryListItems();
        });
        
        row.appendChild(textWrapper);
        row.appendChild(deleteButton);
        historyList.appendChild(row);
    });
}

function initializeFreshChatSession() {
    currentSessionId = null;
    chatHistory = [];
    updateWelcomeMessageText(); 
}

function renderFullChatLogBubble() {
    if (!output) return;
    output.innerHTML = "";
    
    let dialogueItems = chatHistory.filter(msg => {
        let textStr = msg.parts[0].text;
        return !textStr.includes("proprietary features belong exclusively") && !textStr.includes("System connection established");
    });
    
    if (dialogueItems.length === 0) {
        output.innerHTML = welcomeGeminiText;
        return;
    }
    
    dialogueItems.forEach(msg => {
        const isUserTurn = (msg.role === 'user');
        const bubble = document.createElement('div');
        bubble.style = isUserTurn 
            ? "background: #2a2a2a; padding: 10px 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left; margin-bottom: 10px;"
            : "background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #6f42c1; text-align: left; margin-bottom: 10px;";
            
        let footerMetadataLabel = (!isUserTurn && msg.activeModelName) 
            ? `<div style="font-size: 0.68rem; color: #555; border-top: 1px solid #222; margin-top: 8px; padding-top: 4px; font-style: italic;">Running on this model: "${msg.activeModelName}"</div>` 
            : "";

        bubble.innerHTML = `
            <div style="font-size: 0.72rem; color: #888; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">
                ${isUserTurn ? '👤 You' : '✨ Gemini Ecosystem'}
            </div>
            <div style="color: #eee; font-size: 0.95rem; line-height: 1.5;">${renderMarkdown(msg.parts[0].text)}</div>
            ${footerMetadataLabel}
        `;
        output.appendChild(bubble);
    });
    output.scrollTop = output.scrollHeight;
}

function updateDatalist(cities = [], wikiTitles = [], wikitubiaTitles = []) {
    if (!datalist) return;
    datalist.innerHTML = "";
    
    defaultAssistantSuggestions.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        datalist.appendChild(option);
    });
    wikiTitles.forEach(title => {
        const option = document.createElement('option');
        option.value = title;
        datalist.appendChild(option);
    });
    wikitubiaTitles.forEach(title => {
        const option = document.createElement('option');
        option.value = title;
        datalist.appendChild(option);
    });
    cities.forEach(location => {
        const option = document.createElement('option');
        let parts = [];
        if (location.name) parts.push(location.name);
        if (location.admin1 && !parts.includes(location.admin1)) parts.push(location.admin1);
        if (location.country && !parts.includes(location.country)) parts.push(location.country);

        option.value = parts.join(', ');
        option.setAttribute('data-lat', location.latitude);
        option.setAttribute('data-lon', location.longitude);
        option.setAttribute('data-tz', location.timezone);
        datalist.appendChild(option);
    });
}

function handleVaiiDataOutput(rawTextContent, defaultHtmlOutput, runMapCallback = null) {
    output.innerHTML = defaultHtmlOutput;
    if (runMapCallback) runMapCallback();
}

function showAuthError(message) {
    if (authError) {
        authError.innerText = message.replace("Firebase: ", "");
        authError.style.display = "block";
    }
}

function clearActiveImage() {
    activeImageBase64 = null;
    activeImageMimeType = null;
    if (imageFileInput) imageFileInput.value = "";
    if (imagePreviewThumbnail) imagePreviewThumbnail.src = "";
    if (imagePreviewContainer) imagePreviewContainer.style.display = "none";
    if (cameraTriggerBtn) cameraTriggerBtn.classList.remove('active');
}

// ==========================================
// 4. CHAT ENGINE (GEMINI FALLBACK LOOP)
// ==========================================
async function executeGeminiDirectChat(userInput) {
    if (chatHistory.length === 0) {
        const localInstructions = localStorage.getItem('vaii_gemini_instructions') || '';
        let systemPrompt = "You are Gemini, an advanced conversational core running inside the VAII architecture frame. STRICT STRUCTURAL RULE: You do NOT possess built-in web services, maps, currency handlers, weather telemetry, or drawing capabilities. All of those proprietary features belong exclusively to a completely separate system engine option on this dashboard named 'VAII Native'. Your singular purpose here is providing deep, persistent multi-turn conversational reasoning and textual chat history records. Keep statements direct and clear.";
        
        if (localInstructions.trim()) {
            systemPrompt += `\n\n[USER SYSTEM INSTRUCTIONS / REQUIRED PERSONALITY PARAMETERS]:\n${localInstructions.trim()}`;
        }

        chatHistory.push({ role: "user", parts: [{ text: systemPrompt }] });
        chatHistory.push({ role: "model", parts: [{ text: "System connection established. Isolated chat parameters synced. I am fully aware of my persona guidelines and that I do not contain VAII Native utilities." }] });
    }

    chatHistory.push({ role: "user", parts: [{ text: userInput }] });
    renderFullChatLogBubble();

    const spinnerBubble = document.createElement('div');
    spinnerBubble.id = "gemini-active-typing-indicator";
    spinnerBubble.style = "text-align: left; padding: 10px; color: #aaa; font-style: italic; display: flex; align-items: center;";
    spinnerBubble.innerHTML = `<div class="loader-spinner"></div> Syncing conversational context vectors...`;
    output.appendChild(spinnerBubble);
    output.scrollTop = output.scrollHeight;

    const sanitizedContents = chatHistory.map(msg => ({
        role: msg.role || "user",
        parts: (msg.parts || []).map(p => ({ text: p.text || "" }))
    }));

    let successfulResponseText = null;
    let successfulModelLabel = "";
    let structuralErrorDetected = null;

    for (let i = 0; i < BASELINE_FALLBACK_TREE.length; i++) {
        const modelObj = BASELINE_FALLBACK_TREE[i];
        const visionUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelObj.id}:generateContent?key=${GEMINI_VISION_KEY}`;
        
        try {
            const response = await fetch(visionUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: sanitizedContents })
            });
            const data = await response.json();

            if (data.error) {
                if (response.status === 400 || data.error.status === "INVALID_ARGUMENT") {
                    structuralErrorDetected = data.error.message;
                    break; 
                }
                console.warn(`Model generation tier [${modelObj.name}] quota full. Cascading downstream...`);
                continue; 
            }

            if (!data.candidates || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0].text) {
                continue;
            }

            successfulResponseText = data.candidates[0].content.parts[0].text;
            successfulModelLabel = modelObj.name;
            break; 
        } catch (err) {
            console.error(`Network exception on model asset [${modelObj.name}]:`, err);
            continue;
        }
    }

    const indicatorNode = document.getElementById("gemini-active-typing-indicator");
    if (indicatorNode) indicatorNode.remove();

    if (structuralErrorDetected) {
        const errorDiv = document.createElement('div');
        errorDiv.style = "background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left; margin-bottom: 10px;";
        errorDiv.innerHTML = `
            <div style="font-size: 0.75rem; color: #ff4d4d; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">⚠️ History Thread Structure Fault</div>
            <div style="color: #eee; font-size: 0.95rem; line-height: 1.5;">
                ${structuralErrorDetected}<br><br>
                <span style="color: #aaa; font-size: 0.85rem;">VAII automatically dropped your last submission entry to keep this specific session from breaking permanently.</span>
            </div>
        `;
        output.appendChild(errorDiv);
        chatHistory.pop(); 
        return;
    }

    if (successfulResponseText !== null) {
        chatHistory.push({ 
            role: "model", 
            parts: [{ text: successfulResponseText }],
            activeModelName: successfulModelLabel 
        });

        renderFullChatLogBubble();
        saveCurrentSessionState();

        if (chatHistory.length === 4) {
            triggerBackgroundTitleGeneration(chatHistory[2].parts[0].text, successfulResponseText, successfulModelLabel);
        }
    } else {
        const errorDiv = document.createElement('div');
        errorDiv.style = "background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left; margin-bottom: 10px;";
        errorDiv.innerHTML = `
            <div style="font-size: 0.75rem; color: #ff4d4d; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">🚨 Critical Server Outage Alert</div>
            <div style="color: #eee; font-size: 0.95rem; line-height: 1.5; font-weight: 500;">
                Every single fallback layer inside the model matrix has completely exhausted its rate-limit quotas. Please wait for token limits to clear.
            </div>
        `;
        output.appendChild(errorDiv);
        chatHistory.pop(); 
    }
}

async function triggerBackgroundTitleGeneration(userMsg, modelResponse, runningModelId) {
    const titlePrompt = `Generate a short, highly descriptive 3 to 5 word summary title for this chat based on these two statements. Respond with ONLY the clean summary text directly, no intro text, no markdown styling markers, and no outer quotation characters.\n\nUser text: "${userMsg}"\nModel text: "${modelResponse}"`;
    const payloadContents = [{ role: "user", parts: [{ text: titlePrompt }] }];
    const activeModel = BASELINE_FALLBACK_TREE.find(m => m.name === runningModelId) || BASELINE_FALLBACK_TREE[0];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel.id}:generateContent?key=${GEMINI_VISION_KEY}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: payloadContents })
        });
        const data = await response.json();
        let cleanedTitle = data.candidates[0].content.parts[0].text.trim().replace(/['"]+/g, ''); 
        if (cleanedTitle && cleanedTitle.length > 2) {
            saveCurrentSessionState(cleanedTitle);
        }
    } catch (e) {
        console.error("Dynamic title loop exception:", e);
    }
}

// ==========================================
// 5. NATIVE MODULES (MAPS, WEATHER, VISION)
// ==========================================
function renderUnifiedLocationCard(lat, lon, zone, displayName, greetingHTML = "") {
    output.innerHTML = greetingHTML + `<div style="color:#888; font-style:italic;">Assembling location data card...</div>`;
    
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
        .then(res => res.json())
        .then(weatherData => {
            const tempCelsius = weatherData.current_weather.temperature;
            const tempFahrenheit = Math.round((tempCelsius * 9/5) + 32);
            const windSpeed = weatherData.current_weather.windspeed;
            
            const timeString = new Date().toLocaleTimeString("en-US", { timeZone: zone, hour: '2-digit', minute: '2-digit' });
            const dateString = new Date().toLocaleDateString("en-US", { timeZone: zone, weekday: 'long', month: 'short', day: 'numeric' });
            
            const htmlOutput = greetingHTML + `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #4da3ff; text-align: left; margin-bottom: 15px;">
                    <div style="font-size: 1.2rem; font-weight: bold; color: #fff; margin-bottom: 12px;">📍 ${displayName}</div>
                    <div style="display: flex; gap: 20px; margin-bottom: 15px; border-bottom: 1px solid #2a2a2a; padding-bottom: 12px;">
                        <div style="flex: 1;">
                            <span style="color: #888; font-size: 0.8rem; text-transform: uppercase;">Current Climate</span><br>
                            <span style="font-size: 1.1rem; font-weight: bold; color: #28a745;">🌡️ ${tempFahrenheit}°F</span> <span style="color:#666; font-size:0.9rem;">(${tempCelsius}°C)</span><br>
                            <span style="color: #ccc; font-size: 0.85rem;">💨 Wind: ${windSpeed} km/h</span>
                        </div>
                        <div style="flex: 1; border-left: 1px solid #2a2a2a; padding-left: 15px;">
                            <span style="color: #888; font-size: 0.8rem; text-transform: uppercase;">Localized Clock</span><br>
                            <span style="font-size: 1.1rem; font-weight: bold; color: #ffc107;">🕒 ${timeString}</span><br>
                            <span style="color: #ccc; font-size: 0.85rem;">📅 ${dateString}</span>
                        </div>
                    </div>
                    <span style="color: #888; font-size: 0.8rem; text-transform: uppercase; display: block; margin-bottom: 6px;">Interactive Mapping</span>
                    <div id="vaii-merged-map-canvas" style="width:100%; height:250px; border-radius:8px; background:#252525; border: 1px solid #333;"></div>
                </div>
            `;
            
            handleVaiiDataOutput("", htmlOutput, () => {
                if (typeof google !== 'undefined' && google.maps) {
                    const mapCoordinates = { lat: parseFloat(lat), lng: parseFloat(lon) };
                    const loadedMapInstance = new google.maps.Map(document.getElementById('vaii-merged-map-canvas'), {
                        center: mapCoordinates, zoom: 12, disableDefaultUI: false,
                        styles: [
                            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }
                        ]
                    });
                    new google.maps.Marker({ position: mapCoordinates, map: loadedMapInstance, title: displayName });
                }
            });
        })
        .catch(err => {
            handleVaiiDataOutput("", "<div>Error pulling metrics for spatial location.</div>");
            console.error(err);
        });
}

function executeVisionAnalysis(promptText) {
    output.innerHTML = `
        <div class="generation-status">
            <div class="loader-spinner"></div>
            <span style="color: #eee; font-size: 0.9rem;">VAII vision engine is processing image parameters...</span>
        </div>
    `;

    const payload = {
        contents: [{
            parts: [
                { text: promptText },
                { inlineData: { mimeType: activeImageMimeType || "image/jpeg", data: activeImageBase64 } }
            ]
        }]
    };

    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_VISION_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            output.innerHTML = `
                <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">
                    <div style="font-size: 0.75rem; color: #ff4d4d; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">⚠️ Google API Error</div>
                    <div style="color: #eee; font-size: 0.95rem; line-height: 1.5;">${data.error.message}</div>
                </div>
            `;
            return;
        }
        const descriptionResult = data.candidates[0].content.parts[0].text;
        output.innerHTML = `
            <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #007bff; text-align: left;">
                <div style="font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; margin-bottom: 8px; letter-spacing: 0.5px;">👁️ Image Analysis Output</div>
                <div style="color: #eee; font-size: 0.95rem; line-height: 1.5; white-space: pre-wrap;">${descriptionResult}</div>
            </div>
        `;
        clearActiveImage();
    }).catch(err => {
        output.innerText = "Network intercept error connecting to Google vision matrices.";
        console.error(err);
    });
}

function runMarketExecution(ticker) {
    output.innerText = `Fetching price updates for "${ticker.toUpperCase()}"...`;
    const cleanTicker = ticker.trim().toLowerCase();
    const cryptoMap = { btc: "bitcoin", eth: "ethereum", solana: "solana" };

    if (cryptoMap[cleanTicker]) {
        fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoMap[cleanTicker]}&vs_currencies=usd&include_24hr_change=true`)
            .then(res => res.json())
            .then(data => {
                const coinData = data[cryptoMap[cleanTicker]];
                const price = coinData.usd;
                const change = coinData.usd_24h_change.toFixed(2);
                const htmlOutput = `
                    <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #6f42c1; text-align: left;">
                        <strong>🪙 ${cryptoMap[cleanTicker].toUpperCase()} (${ticker.toUpperCase()})</strong><br>
                        💰 Price: $${price.toLocaleString()} USD<br>
                        ${change >= 0 ? "📈" : "📉"} 24h Change: ${change}%
                    </div>
                `;
                handleVaiiDataOutput("", htmlOutput);
            }).catch(() => { handleVaiiDataOutput("", "<div>Error pulling crypto ticker data.</div>"); });
    } else {
        const htmlOutput = `
            <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #6f42c1; text-align: left;">
                <strong>📈 Stock Ticker: ${ticker.toUpperCase()}</strong><br>
                <span style="color: #aaa; font-size: 0.9rem;">To view deep market assets, open the link directly:</span>
                <a href="https://finance.yahoo.com/quote/${ticker.toUpperCase()}" target="_blank">Open Yahoo Finance ↗</a>
            </div>
        `;
        handleVaiiDataOutput("", htmlOutput);
    }
}

function executeImageGeneration(imagePrompt) {
    routingWarning.style.display = "none"; 
    output.innerHTML = `
        <div style="color: #888; font-style: italic; margin-bottom: 12px; font-size: 0.9rem; line-height: 1.4;">🎨 Generating artwork for "${imagePrompt}"...</div>
        <div class="generation-status" id="image-loader">
            <div class="loader-spinner"></div>
            <span style="color: #eee; font-size: 0.9rem;">Assembling pixels...</span>
        </div>
    `;
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/p/${encodeURIComponent(imagePrompt)}?width=1080&height=1080&nologo=true&seed=${seed}`;
    const img = new Image();
    img.src = imageUrl;
    img.style.width = "100%";
    img.style.borderRadius = "8px";
    img.style.marginTop = "10px";
    img.style.display = "none";
    img.style.boxShadow = "0 4px 15px rgba(0,0,0,0.5)";
    img.onload = function() {
        document.getElementById("image-loader")?.remove();
        img.style.display = "block";
    };
    output.appendChild(img);
}

function launchTargetUrl(url) {
    routingWarning.style.display = "block"; 
    const htmlOutput = `
        <div class="news-header-msg" style="color: #888; font-style: italic; margin-bottom: 4px; font-size: 0.9rem; line-height: 1.4;">Navigating to external web link...</div>
        <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #007bff; text-align: left; margin-bottom: 15px;">
            🔗 <strong>Address:</strong> <span style="color: #4da3ff; word-break: break-all;">${url}</span>
        </div>
        <a href="${url}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #007bff; border-radius: 6px; padding: 10px 14px; color: white; text-decoration: none; font-weight: bold; font-size: 0.95rem;">
            <span>Launch Link</span>
            <span>Open Site ↗</span>
        </a>
    `;
    output.innerHTML = htmlOutput;
    window.open(url, '_blank');
}

// ==========================================
// 6. ROUTING LOGIC (VAII NATIVE)
// ==========================================
function runInfoExecution(query) {
    const cleanQuery = query.toLowerCase().trim();
    const cryptoMap = { btc: "bitcoin", eth: "ethereum", solana: "solana" };
    const greetingsList = ["hello", "hi", "hey", "sup", "yo", "greetings"];
    let greetingHTML = "";

    if (greetingsList.includes(cleanQuery)) {
        greetingHTML = `
            <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #17a2b8; text-align: left; margin-bottom: 15px;">
                👋 <strong>Assistant:</strong><br><span>Hello! How can I help you today? System initialized.</span>
            </div>
        `;
    }

    if (cleanQuery.includes("calendar") || cleanQuery.includes("calender") || cleanQuery.includes("schedule") || cleanQuery === "agenda" || cleanQuery.includes("email") || cleanQuery.includes("gmail") || cleanQuery.includes("inbox")) {
        const htmlLayout = greetingHTML + `
            <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">
                ⚠️ <strong>Workspace Elements Disabled:</strong><br><br>
                <span style="color: #aaa; font-size: 0.9rem;">Private calendar and email protocols remain inactive to preserve a standard authorization route.</span>
            </div>
        `;
        handleVaiiDataOutput("", htmlLayout);
        return; 
    }

    const isLocationIntent = cleanQuery.startsWith("map of ") || cleanQuery.startsWith("show map ") || cleanQuery.startsWith("time in ") || cleanQuery.startsWith("weather in ") || cleanQuery.startsWith("weather ") || cleanQuery.startsWith("clock ");

    if (isLocationIntent) {
        let parsedLocation = query.replace(/map of /i, "").replace(/show map /i, "").replace(/time in /i, "").replace(/weather in /i, "").replace(/weather /i, "").replace(/clock /i, "").trim();
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(parsedLocation)}&count=1&language=en&format=json`)
            .then(res => res.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    const loc = data.results[0];
                    renderUnifiedLocationCard(loc.latitude, loc.longitude, loc.timezone, `${loc.name}, ${loc.admin1 || ''} (${loc.country})`, greetingHTML);
                } else {
                    handleVaiiDataOutput("", `<div>Could not extract metrics for "${parsedLocation}".</div>`);
                }
            }).catch(() => { handleVaiiDataOutput("", "<div>Location processing engine connection failure.</div>"); });
        return;
    }

    const options = Array.from(datalist.options);
    const matchedOption = options.find(opt => opt.value.toLowerCase() === cleanQuery);
    if (matchedOption && matchedOption.getAttribute('data-lat')) {
        renderUnifiedLocationCard(matchedOption.getAttribute('data-lat'), matchedOption.getAttribute('data-lon'), matchedOption.getAttribute('data-tz'), matchedOption.value, greetingHTML);
        return;
    }

    if (query.toLowerCase().startsWith("open ")) {
        let appName = query.substring(5).trim().toLowerCase().replace(/['"]+/g, '');
        if (!appName) { output.innerText = "Please specify what you want to open."; return; }
        output.innerText = `Resolving address for "${appName}"...`;
        const randomizedRoutes = {
            "gemini": ["https://gemini.google.com"],
            "google gemini": ["https://gemini.google.com"],
            "youtube music": ["https://music.youtube.com"],
            "minecraft": ["https://minecraft.net"],
            "wikipedia": ["https://wikipedia.org"]
        };
        if (randomizedRoutes[appName]) {
            launchTargetUrl(randomizedRoutes[appName][0]);
            return;
        }
        launchTargetUrl(`https://${appName.replace(/\s+/g, '')}.com`);
        return;
    }

    if (/\.[a-z]{2,6}/i.test(query) || query.startsWith('http://') || query.startsWith('https://')) {
        launchTargetUrl(query.startsWith('http') ? query : 'https://' + query);
        return;
    }

    if (cryptoMap[cleanQuery] || cleanQuery.startsWith("price of ")) {
        runMarketExecution(cleanQuery.startsWith("price of ") ? cleanQuery.substring(9).trim() : cleanQuery);
        return;
    }

    if (/^[0-9+\-*/().\s]+$/.test(query) || cleanQuery.includes(" to ")) {
        try {
            if (!cleanQuery.includes(" to ")) {
                const result = Function(`"use strict"; return (${query})`)();
                const htmlOutput = `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">🔢 <strong>Calculation:</strong><br><span style="font-size: 1.3rem; font-weight: bold;">${query} = ${result}</span></div>`;
                handleVaiiDataOutput("", htmlOutput);
                return;
            }
        } catch(e) {}

        if (cleanQuery.includes(" to ")) {
            const parts = query.split(/ to /i);
            const source = parts[0].trim();
            const targetLanguage = parts[1].trim();
            const unitMatch = source.match(/^([0-9.]+)\s*([a-zA-Z°]+)$/);
            
            if (unitMatch) {
                const num = parseFloat(unitMatch[1]);
                const fromUnit = unitMatch[2].toLowerCase();
                const toUnit = targetLanguage.toLowerCase();
                let conversionResult = null;
                if (fromUnit === "lbs" && toUnit === "kg") conversionResult = `${(num * 0.45359237).toFixed(2)} kg`;
                if (fromUnit === "kg" && toUnit === "lbs") conversionResult = `${(num / 0.45359237).toFixed(2)} lbs`;
                if (fromUnit === "miles" && toUnit === "km") conversionResult = `${(num * 1.60934).toFixed(2)} km`;
                if (fromUnit === "km" && toUnit === "miles") conversionResult = `${(num / 1.60934).toFixed(2)} miles`;
                if (fromUnit === "f" && toUnit === "c") conversionResult = `${((num - 32) * 5 / 9).toFixed(1)}°C`;
                if (fromUnit === "c" && toUnit === "f") conversionResult = `${((num * 9 / 5) + 32).toFixed(1)}°F`;
                
                if (conversionResult) {
                    const htmlOutput = `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">🔄 <strong>Conversion:</strong><br>📤 Result: <strong style="color: #28a745; font-size: 1.3rem; display:block; margin-top:4px;">${conversionResult}</strong></div>`;
                    handleVaiiDataOutput("", htmlOutput);
                    return;
                }
            }
            fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(source)}&langpair=en|${encodeURIComponent(targetLanguage.substring(0,2))}`)
                .then(res => res.json())
                .then(data => {
                    const transText = data.responseData.translatedText;
                    const htmlOutput = `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #4da3ff; text-align: left;">🗣️ <strong>Translation:</strong><br>📤 Result: <strong style="color: #4da3ff; font-size: 1.1rem; display:block; margin-top:4px;">"${transText}"</strong></div>`;
                    handleVaiiDataOutput("", htmlOutput);
                }).catch(() => { handleVaiiDataOutput("", "<div>Translation engine network failure.</div>"); });
            return;
        }
    }

    routingWarning.style.display = "none";
    if (!query.includes(" ")) {
        fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(query.toLowerCase())}`)
            .then(res => res.json())
            .then(dictData => {
                const key = Object.keys(dictData)[0];
                const rawDefinition = dictData[key][0].definitions[0].definition.replace(/<[^>]*>/g, '').trim();
                let wikiData = { wiktionary: { title: query, text: rawDefinition, pos: dictData[key][0].partOfSpeech || "noun" } };
                if (greetingHTML) wikiData.greeting = greetingHTML;
                runUnifiedWikiPipeline(query, wikiData);
            }).catch(() => {
                runUnifiedWikiPipeline(query, { greeting: greetingHTML });
            });
    } else {
        runUnifiedWikiPipeline(query, { greeting: greetingHTML });
    }
}

function runUnifiedWikiPipeline(query, wikiData) {
    const famousYoutubersList = ["jacksucksatlife", "mrbeast", "pewdiepie", "markiplier", "caseoh", "jynxzi"];
    const isInfluencer = famousYoutubersList.some(name => query.toLowerCase().includes(name));

    const youtubeFetch = (isInfluencer && GOOGLE_API_KEY)
        ? fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`)
            .then(res => res.json())
            .then(searchData => {
                if (searchData.items?.length > 0) {
                    return fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${searchData.items[0].id.channelId}&key=${GOOGLE_API_KEY}`)
                        .then(res => res.json())
                        .then(channelData => {
                            if (channelData.items?.length > 0) {
                                const item = channelData.items[0];
                                wikiData.youtube = { title: item.snippet.title, text: item.snippet.description, subs: parseInt(item.statistics.subscriberCount).toLocaleString(), views: parseInt(item.statistics.viewCount).toLocaleString(), customUrl: item.snippet.customUrl || "" };
                            }
                        });
                }
            }).catch(() => null)
        : Promise.resolve();

    const wikipediaFetch = fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`)
        .then(res => res.json())
        .then(wikiSearch => {
            if (wikiSearch.query?.search?.length > 0) {
                return fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiSearch.query.search[0].title.replace(/ /g, '_'))}`)
                    .then(res => res.json())
                    .then(summaryData => { wikiData.wikipedia = { title: wikiSearch.query.search[0].title, text: summaryData.extract }; });
            }
        }).catch(() => null);

    Promise.all([youtubeFetch, wikipediaFetch]).then(() => { compileFinalSourceIndexBox(query, wikiData); });
}

function compileFinalSourceIndexBox(query, wikiData) {
    let blocksHtml = [];

    if (wikiData.wiktionary) {
        blocksHtml.push(`<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;"><strong>${wikiData.wiktionary.title}</strong> (${wikiData.wiktionary.pos}): ${wikiData.wiktionary.text}</div>`);
    }
    if (wikiData.youtube) {
        blocksHtml.push(`<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff0000; text-align: left;"><strong>📺 ${wikiData.youtube.title}</strong><br><span style="font-size: 0.85rem; color: #aaa;">🔴 Subs: ${wikiData.youtube.subs} | Views: ${wikiData.youtube.views}</span><br><br><em>${wikiData.youtube.text}</em></div>`);
    }
    if (wikiData.wikipedia) {
        blocksHtml.push(`<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #007bff; text-align: left;"><strong>${wikiData.wikipedia.title}:</strong> ${wikiData.wikipedia.text}</div>`);
    }

    let totalHTML = wikiData.greeting || "";
    if (blocksHtml.length === 0) {
        handleVaiiDataOutput("", totalHTML + `<div>No matches found for "${query}".</div>`);
        return;
    }
    
    totalHTML += `<div class="news-header-msg" style="color: #888; font-style: italic; margin-bottom: 12px; font-size: 0.9rem; line-height: 1.4;">I have provided the most relevant text of each information source related to "${query}".</div>`;
    totalHTML += blocksHtml.join(`<div style="color: #888; font-style: italic; font-size: 0.85rem; margin: 15px 0 8px 0; text-align: left;">This might also be relevant:</div>`);

    totalHTML += `<div class="source-box" style="border-top: 1px solid #333; padding-top: 12px; margin-top: 15px;"><span style="display: block; font-size: 0.75rem; color: #777; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Sources Index</span><div class="source-list" style="display: flex; flex-direction: column; gap: 6px;">`;

    if (wikiData.wiktionary) {
        totalHTML += `<a href="https://en.wiktionary.org/wiki/${encodeURIComponent(query)}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;"><span style="color: #aaa; font-weight: normal;">📰 Wiktionary</span><span>Open Source →</span></a>`;
    }
    if (wikiData.youtube) {
        const channelPath = wikiData.youtube.customUrl ? wikiData.youtube.customUrl : `@channel`;
        totalHTML += `<a href="https://www.youtube.com/${channelPath}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #ff4444; text-decoration: none; font-size: 0.82rem; font-weight: bold;"><span style="color: #aaa; font-weight: normal;">🔴 YouTube Channel</span><span>Live Metrics →</span></a>`;
    }
    if (wikiData.wikipedia) {
        totalHTML += `<a href="https://en.wikipedia.org/wiki/${encodeURIComponent(wikiData.wikipedia.title)}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;"><span style="color: #aaa; font-weight: normal;">📰 Wikipedia</span><span>Open Source →</span></a>`;
    }
    totalHTML += `</div></div>`;
    handleVaiiDataOutput("", totalHTML);
}

// ==========================================
// 7. EVENT LISTENERS
// ==========================================
document.querySelectorAll('input[name="vaii-mode"]').forEach(r => r.addEventListener('change', updateWelcomeMessageText));

prefsToggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    prefsDrawer.style.display = (prefsDrawer.style.display === "block") ? "none" : "block";
    if (prefsDrawer.style.display === "block") {
        prefsInstructionsInput.value = localStorage.getItem('vaii_gemini_instructions') || '';
        if (helpGuide) helpGuide.style.display = "none";
        if (historyDrawer) historyDrawer.style.display = "none";
    }
});

prefsSaveBtn?.addEventListener('click', () => {
    localStorage.setItem('vaii_gemini_instructions', prefsInstructionsInput.value.trim());
    prefsDrawer.style.display = "none";
    initializeFreshChatSession();
});

helpToggle?.addEventListener('click', () => {
    helpGuide.style.display = (helpGuide.style.display === "block") ? "none" : "block";
    if (historyDrawer) historyDrawer.style.display = "none";
    if (prefsDrawer) prefsDrawer.style.display = "none";
});

historyToggle?.addEventListener('click', () => {
    historyDrawer.style.display = (historyDrawer.style.display === "block") ? "none" : "block";
    if (historyDrawer.style.display === "block") renderHistoryListItems();
    if (helpGuide) helpGuide.style.display = "none";
    if (prefsDrawer) prefsDrawer.style.display = "none";
});

newChatBtn?.addEventListener('click', () => {
    initializeFreshChatSession();
    if (historyDrawer) historyDrawer.style.display = "none";
});

hubInput?.addEventListener('input', () => {
    const query = hubInput.value; 
    const trimmedQuery = query.trim();
    if (routingWarning) routingWarning.style.display = trimmedQuery.toLowerCase().startsWith('open ') ? "block" : "none";

    if (searchAbortController) searchAbortController.abort();
    if (trimmedQuery.length < 3 || trimmedQuery.toLowerCase().startsWith('open ') || /\.[a-z]{2,6}/i.test(trimmedQuery)) {
        updateDatalist([], [], []); 
        clearTimeout(debounceTimer); 
        return; 
    }

    let searchUrlQuery = trimmedQuery.replace(/map of |show map |weather in |time in /i, "").trim();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        searchAbortController = new AbortController();
        const signal = searchAbortController.signal;

        const geoFetch = fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchUrlQuery)}&count=3&language=en&format=json`, { signal })
            .then(res => res.json()).then(data => data.results || []).catch(() => []);
        const wikiFetch = fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchUrlQuery)}&utf8=&format=json&origin=*`, { signal })
            .then(res => res.json()).then(data => data.query?.search?.map(item => item.title) || []).catch(() => []);
        const wikitubiaFetch = fetch(`https://youtube.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchUrlQuery)}&utf8=&format=json&origin=*`, { signal })
            .then(res => res.json()).then(data => data.query?.search?.map(item => item.title) || []).catch(() => []);

        Promise.all([geoFetch, wikiFetch, wikitubiaFetch]).then(([cities, wikiTitles, wikitubiaTitles]) => {
            updateDatalist(cities, wikiTitles, wikitubiaTitles);
        }).catch(() => {});
    }, 300);
});

executeActionBtn?.addEventListener('click', () => {
    const query = hubInput.value.trim();
    const mode = document.querySelector('input[name="vaii-mode"]:checked').value;
    
    if (activeImageBase64) {
        executeVisionAnalysis(query || "Describe this image content in clear detail.");
        return;
    }
    if (!query) return;

    if (mode === "gemini") {
        executeGeminiDirectChat(query);
    } else {
        if (query.toLowerCase().startsWith("draw ")) {
            executeImageGeneration(query.substring(5).trim());
        } else {
            runInfoExecution(query);
        }
    }
});

hubInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') executeActionBtn?.click();
});

authToggle?.addEventListener('click', () => {
    const isLoginMode = (authSubmitBtn.innerText === "Log In");
    authError.style.display = "none";
    authTitle.innerText = isLoginMode ? "✨ Create Account" : "🔒 Account Sign In";
    authSubmitBtn.innerText = isLoginMode ? "Register User" : "Log In";
    authToggle.innerText = isLoginMode ? "Already have an account? Sign In" : "Need an account? Register instead";
});

authSubmitBtn?.addEventListener('click', () => {
    const email = authEmail.value.trim();
    const password = authPassword.value;
    const isLoginMode = (authSubmitBtn.innerText === "Log In");
    authError.style.display = "none";
    if (!email || !password) return showAuthError("Please fill out all credentials.");
    
    if (isLoginMode) signInWithEmailAndPassword(auth, email, password).catch(err => showAuthError(err.message));
    else createUserWithEmailAndPassword(auth, email, password).catch(err => showAuthError(err.message));
});

googleSigninBtn?.addEventListener('click', () => {
    authError.style.display = "none";
    signInWithPopup(auth, googleProvider).catch(err => showAuthError(err.message));
});

logoutActionBtn?.addEventListener('click', () => signOut(auth).catch(err => console.error(err)));

onAuthStateChanged(auth, (user) => {
    if (user) {
        authContainer.style.display = "none";
        mainApp.style.display = "block";
        initializeFreshChatSession();
        clearActiveImage();
        renderHistoryListItems();
        if (prefsInstructionsInput) prefsInstructionsInput.value = localStorage.getItem('vaii_gemini_instructions') || '';
        updateDatalist([], [], []);
    } else {
        authContainer.style.display = "block";
        mainApp.style.display = "none";
    }
});
