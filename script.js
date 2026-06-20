import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

// DOM CONTROL NODES
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

let isLoginMode = true;
let debounceTimer;

const welcomeMessageText = `Welcome back! Enter a search query, app routing command, calculation sequence, weather location, translation phrase, crypto key, or art prompt to begin...`;

// Integrated universal system suggestion bar
const defaultAssistantSuggestions = [
    "Open Gemini", 
    "193 lbs to kg", 
    "Open YouTube", 
    "BTC", 
    "Time in Tokyo", 
    "Hello to Spanish", 
    "Open Minecraft", 
    "(12 * 4) / 2",
    "Draw a neon cyberpunk switch console artwork",
    "Draw a retro arcade machine sitting in an empty vaporwave room"
];

// Unified suggestion box compiler supporting concurrent Wiki sources
function updateDatalist(cities = [], wikiTitles = [], wikitubiaTitles = []) {
    if (!datalist) return;
    datalist.innerHTML = "";
    
    // 1. Inject core structural guides first
    defaultAssistantSuggestions.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        datalist.appendChild(option);
    });
    
    // 2. Inject live extracted Wikipedia search entry references
    wikiTitles.forEach(title => {
        const option = document.createElement('option');
        option.value = title;
        datalist.appendChild(option);
    });

    // 3. Inject live extracted Wikitubia search entry references
    wikitubiaTitles.forEach(title => {
        const option = document.createElement('option');
        option.value = title;
        datalist.appendChild(option);
    });
    
    // 4. Inject live calculated geocoding location parameters
    cities.forEach(location => {
        const option = document.createElement('option');
        const city = location.name;
        const state = location.admin1;
        const country = location.country;

        let parts = [];
        if (city) parts.push(city);
        if (state && !parts.includes(state)) parts.push(state);
        if (country && !parts.includes(country)) parts.push(country);

        option.value = parts.join(', ');
        option.setAttribute('data-lat', location.latitude);
        option.setAttribute('data-lon', location.longitude);
        option.setAttribute('data-tz', location.timezone);
        datalist.appendChild(option);
    });
}

// ==========================================
// 1. FIREBASE AUTHENTICATION INITIALIZATION
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        authContainer.style.display = "none";
        mainApp.style.display = "block";
        output.innerText = welcomeMessageText;
        authEmail.value = "";
        authPassword.value = "";
        authError.style.display = "none";
        if (hubInput) {
            hubInput.value = "";
            hubInput.placeholder = "Type a command...";
        }
        updateDatalist([], [], []);
    } else {
        authContainer.style.display = "block";
        mainApp.style.display = "none";
    }
});

authToggle.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    authError.style.display = "none";
    if (isLoginMode) {
        authTitle.innerText = "🔒 Account Sign In";
        authSubmitBtn.innerText = "Log In";
        authToggle.innerText = "Need an account? Register instead";
    } else {
        authTitle.innerText = "✨ Create Account";
        authSubmitBtn.innerText = "Register App User";
        authToggle.innerText = "Already have an account? Sign In";
    }
});

authSubmitBtn.addEventListener('click', () => {
    const email = authEmail.value.trim();
    const password = authPassword.value;
    authError.style.display = "none";
    if (!email || !password) {
        showAuthError("Please fill out all credential inputs.");
        return;
    }
    if (isLoginMode) {
        signInWithEmailAndPassword(auth, email, password).catch(err => showAuthError(err.message));
    } else {
        createUserWithEmailAndPassword(auth, email, password).catch(err => showAuthError(err.message));
    }
});

googleSigninBtn.addEventListener('click', () => {
    authError.style.display = "none";
    signInWithPopup(auth, googleProvider).catch(err => showAuthError(err.message));
});

logoutActionBtn.addEventListener('click', () => {
    signOut(auth).catch(err => console.error("Sign out fail:", err));
});

function showAuthError(message) {
    authError.innerText = message.replace("Firebase: ", "");
    authError.style.display = "block";
}

// ==========================================
// 2. MAIN HUB INTERFACE OPERATIONAL LOOPS
// ==========================================
helpToggle.addEventListener('click', function() {
    if (helpGuide.style.display === "block") {
        helpGuide.style.display = "none";
        helpToggle.innerText = "?";
    } else {
        helpGuide.style.display = "block";
        helpToggle.innerText = "✕";
    }
});

hubInput.addEventListener('input', function() {
    const query = hubInput.value; 
    const trimmedQuery = query.trim();
    
    if (query.toLowerCase().startsWith('open ')) {
        routingWarning.style.display = "block"; 
    } else {
        routingWarning.style.display = "none";
    }

    if (trimmedQuery.length < 3) {
        updateDatalist([], [], []);
        return;
    }

    if (trimmedQuery.startsWith('http://') || trimmedQuery.startsWith('https://') || /\.[a-z]{2,6}/i.test(trimmedQuery)) {
        return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const geoFetch = fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmedQuery)}&count=3&language=en&format=json`)
            .then(res => res.json())
            .then(data => data.results || [])
            .catch(() => []);

        const wikiFetch = fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(trimmedQuery)}&utf8=&format=json&origin=*`)
            .then(res => res.json())
            .then(data => {
                if (data.query && data.query.search) {
                    return data.query.search.map(item => item.title);
                }
                return [];
            })
            .catch(() => []);

        const wikitubiaFetch = fetch(`https://youtube.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(trimmedQuery)}&utf8=&format=json&origin=*`)
            .then(res => res.json())
            .then(data => {
                if (data.query && data.query.search) {
                    return data.query.search.map(item => item.title);
                }
                return [];
            })
            .catch(() => []);

        Promise.all([geoFetch, wikiFetch, wikitubiaFetch]).then(([cities, wikiTitles, wikitubiaTitles]) => {
            updateDatalist(cities, wikiTitles, wikitubiaTitles);
        });
    }, 300);
});

if (executeActionBtn) {
    executeActionBtn.addEventListener('click', function() {
        const query = hubInput.value.trim();
        if (!query) {
            output.innerText = "Please input a term or prompt value first.";
            return;
        }

        if (query.toLowerCase().startsWith("draw ")) {
            let imagePrompt = query.substring(5).trim();
            executeImageGeneration(imagePrompt);
        } else {
            runInfoExecution(query);
        }
    });
}

hubInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && executeActionBtn) {
        executeActionBtn.click();
    }
});

// ----------------------------------------------------
// UNIFIED ASSISTANT SYSTEMS
// ----------------------------------------------------
function runUnifiedWeatherClock(lat, lon, zone, displayName) {
    output.innerText = `Fetching synchronized metrics for ${displayName}...`;
    
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
        .then(res => res.json())
        .then(weatherData => {
            const tempCelsius = weatherData.current_weather.temperature;
            const tempFahrenheit = Math.round((tempCelsius * 9/5) + 32);
            const windSpeed = weatherData.current_weather.windspeed;
            
            const timeString = new Date().toLocaleTimeString("en-US", { timeZone: zone, hour: '2-digit', minute: '2-digit' });
            const dateString = new Date().toLocaleDateString("en-US", { timeZone: zone, weekday: 'long', month: 'short', day: 'numeric' });
            
            output.innerHTML = `
                <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #007bff; text-align: left; margin-bottom: 15px;">
                    <strong>📍 ${displayName}</strong><br><br>
                    <span style="color: #888; font-style: italic; font-size: 0.9rem;">Here is the weather on that location:</span><br>
                    🌡️ Temperature: ${tempFahrenheit}°F (${tempCelsius}°C)<br>
                    💨 Wind Speed: ${windSpeed} km/h
                    <br><br>
                    <span style="color: #888; font-style: italic; font-size: 0.9rem;">Here is the current time on that location:</span><br>
                    🕒 <span style="font-size: 1.5rem; font-weight: bold; color: #fff;">${timeString}</span><br>
                    📅 ${dateString}<br>
                    🌐 Time Zone: <code>${zone}</code>
                </div>
                
                <div class="source-box" style="border-top: 1px solid #333; padding-top: 12px; margin-top: 10px; text-align: left;">
                    <span style="display: block; font-size: 0.75rem; color: #777; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Sources Index</span>
                    <div class="source-list" style="display: flex; flex-direction: column; gap: 6px;">
                        <a href="https://open-meteo.com" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;">
                            <span style="color: #aaa; font-weight: normal;">☀️ Open-Meteo Weather API</span>
                            <span>Open Source →</span>
                        </a>
                        <a href="https://open-meteo.com" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;">
                            <span style="color: #aaa; font-weight: normal;">🌐 Open-Meteo Geocoding Engine</span>
                            <span>Open Source →</span>
                        </a>
                    </div>
                </div>
            `;
        })
        .catch(err => {
            output.innerText = "Error fetching live weather and time metrics.";
            console.error(err);
        });
}

function runMarketExecution(ticker) {
    output.innerText = `Fetching price index for "${ticker.toUpperCase()}"...`;
    const cleanTicker = ticker.trim().toLowerCase();
    const cryptoMap = { btc: "bitcoin", eth: "ethereum", sol: "solana", doge: "dogecoin", xrp: "ripple" };

    if (cryptoMap[cleanTicker]) {
        fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoMap[cleanTicker]}&vs_currencies=usd&include_24hr_change=true`)
            .then(res => res.json())
            .then(data => {
                const coinData = data[cryptoMap[cleanTicker]];
                const price = coinData.usd;
                const change = coinData.usd_24h_change.toFixed(2);
                const indicator = change >= 0 ? "📈" : "📉";
                output.innerHTML = `
                    <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #6f42c1; text-align: left;">
                        <strong>🪙 ${cryptoMap[cleanTicker].toUpperCase()} (${ticker.toUpperCase()})</strong><br>
                        💰 Price: $${price.toLocaleString()} USD<br>
                        ${indicator} 24h Change: ${change}%
                    </div>
                    
                    <div class="source-box" style="border-top: 1px solid #333; padding-top: 12px; margin-top: 15px;">
                        <span style="display: block; font-size: 0.75rem; color: #777; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Sources Index</span>
                        <div class="source-list" style="display: flex; flex-direction: column;">
                            <a href="https://www.coingecko.com" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;">
                                <span style="color: #aaa; font-weight: normal;">🪙 CoinGecko Network</span>
                                <span>Open Source →</span>
                            </a>
                        </div>
                    </div>
                `;
            }).catch(() => { output.innerText = "Error pulling crypto ticker data."; });
    } else {
        output.innerHTML = `
            <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #6f42c1; text-align: left;">
                <strong>📈 Stock Ticker Tracker: ${ticker.toUpperCase()}</strong><br>
                <span style="color: #aaa; font-size: 0.9rem;">To view deep market assets without explicit tokens, launch structural metrics directly:</span>
                <a href="https://finance.yahoo.com/quote/${ticker.toUpperCase()}" target="_blank" style="display: block; text-align: center; margin-top: 10px; background: #6f42c1; color: white; padding: 8px; border-radius: 6px; text-decoration: none; font-weight: bold;">Open Yahoo Finance Chart ↗</a>
            </div>
            
            <div class="source-box" style="border-top: 1px solid #333; padding-top: 12px; margin-top: 15px;">
                <span style="display: block; font-size: 0.75rem; color: #777; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Sources Index</span>
                <div class="source-list" style="display: flex; flex-direction: column;">
                    <a href="https://finance.yahoo.com" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;">
                        <span style="color: #aaa; font-weight: normal;">📊 Yahoo Finance Portal</span>
                        <span>Open Source →</span>
                    </a>
                </div>
            </div>
        `;
    }
}

function executeImageGeneration(imagePrompt) {
    routingWarning.style.display = "none"; 

    output.innerHTML = `
        <div style="color: #888; font-style: italic; margin-bottom: 12px; font-size: 0.9rem; line-height: 1.4;">
            🎨 Generating artwork for "${imagePrompt}"...
        </div>
        <div class="generation-status" id="image-loader">
            <div class="loader-spinner"></div>
            <span style="color: #eee; font-size: 0.9rem;">VAII AI engine is assembling pixels...</span>
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
        const loader = document.getElementById("image-loader");
        if (loader) loader.remove();
        img.style.display = "block";
        
        const sourceDiv = document.createElement("div");
        sourceDiv.className = "source-box";
        sourceDiv.style.cssText = "border-top: 1px solid #333; padding-top: 12px; margin-top: 15px; text-align: left;";
        sourceDiv.innerHTML = `
            <span style="display: block; font-size: 0.75rem; color: #777; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Sources Index</span>
            <div class="source-list" style="display: flex; flex-direction: column;">
                <a href="https://pollinations.ai" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;">
                    <span style="color: #aaa; font-weight: normal;">🎨 Pollinations AI Network</span>
                    <span>Open Source →</span>
                </a>
            </div>
        `;
        output.appendChild(sourceDiv);
        if (hubInput) {
            hubInput.value = "";
            hubInput.placeholder = "Type a command...";
        }
        updateDatalist([], [], []);
    };

    output.appendChild(img);
}

function runInfoExecution(query) {
    const cleanQuery = query.toLowerCase().trim();
    const cryptoMap = { btc: "bitcoin", eth: "ethereum", sol: "solana", doge: "dogecoin", xrp: "ripple" };

    if (cleanQuery.startsWith("time in ") || cleanQuery.startsWith("weather in ") || cleanQuery.startsWith("weather ") || cleanQuery.startsWith("clock ")) {
        let parsedLocation = query.replace(/time in /i, "").replace(/weather in /i, "").replace(/weather /i, "").replace(/clock /i, "").trim();
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(parsedLocation)}&count=1&language=en&format=json`)
            .then(res => res.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    const loc = data.results[0];
                    const displayName = `${loc.name}, ${loc.admin1 || ''} ${loc.country}`;
                    runUnifiedWeatherClock(loc.latitude, loc.longitude, loc.timezone, displayName);
                } else {
                    output.innerText = `Could not resolve location parameters for "${parsedLocation}".`;
                }
            })
            .catch(() => { output.innerText = "Error tracking location parameters."; });
        return;
    }

    const options = Array.from(datalist.options);
    const matchedOption = options.find(opt => opt.value.toLowerCase() === cleanQuery);
    if (matchedOption && matchedOption.getAttribute('data-lat')) {
        const lat = matchedOption.getAttribute('data-lat');
        const lon = matchedOption.getAttribute('data-lon');
        const tz = matchedOption.getAttribute('data-tz');
        runUnifiedWeatherClock(lat, lon, tz, matchedOption.value);
        return;
    }

    if (cryptoMap[cleanQuery] || cleanQuery.startsWith("price of ")) {
        let parsedTicker = cleanQuery.startsWith("price of ") ? cleanQuery.substring(9).trim() : cleanQuery;
        runMarketExecution(parsedTicker);
        return;
    }

    if (/^[0-9+\-*/().\s]+$/.test(query) || cleanQuery.includes("to")) {
        try {
            if (!cleanQuery.includes("to")) {
                const result = Function(`"use strict"; return (${query})`)();
                output.innerHTML = `
                    <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">
                        🔢 <strong>Calculation Result:</strong><br>
                        <span style="font-size: 1.3rem; font-weight: bold;">${query} = ${result}</span>
                    </div>
                    
                    <div class="source-box" style="border-top: 1px solid #333; padding-top: 12px; margin-top: 15px;">
                        <span style="display: block; font-size: 0.75rem; color: #777; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Sources Index</span>
                        <div class="source-list" style="display: flex; flex-direction: column;">
                            <div style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #eee; font-size: 0.82rem;">
                                <span style="color: #aaa;">⚙️ Native V8 Math Runtime</span>
                                <span style="color: #777; font-size:0.75rem;">Local Execution</span>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }
        } catch(e) {}

        if (cleanQuery.includes(" to ")) {
            const parts = query.split(/ to /i);
            const source = parts[0].trim();
            const targetLanguage = parts[1].trim();

            const unitRegex = /^([0-9.]+)\s*([a-zA-Z°]+)$/;
            const unitMatch = source.match(unitRegex);
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
                    output.innerHTML = `
                        <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">
                            🔄 <strong>Unit Conversion Core:</strong><br>
                            📥 Input Query: <em>"${query}"</em><br>
                            📤 Calculation Result: <strong style="color: #28a745; font-size: 1.3rem; display:block; margin-top:4px;">${conversionResult}</strong>
                        </div>
                        
                        <div class="source-box" style="border-top: 1px solid #333; padding-top: 12px; margin-top: 15px;">
                            <span style="display: block; font-size: 0.75rem; color: #777; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Sources Index</span>
                            <div class="source-list" style="display: flex; flex-direction: column;">
                                <div style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #eee; font-size: 0.82rem;">
                                    <span style="color: #aaa;">📐 Local Metric Transform Equations</span>
                                    <span style="color: #777; font-size:0.75rem;">Local Execution</span>
                                </div>
                            </div>
                        </div>
                    `;
                    return;
                }
            }

            output.innerText = `Processing translation loop...`;
            fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(source)}&langpair=en|${encodeURIComponent(targetLanguage.substring(0,2))}`)
                .then(res => res.json())
                .then(data => {
                    output.innerHTML = `
                        <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">
                            🗣️ <strong>Translation Asset Core:</strong><br>
                            📥 Original (EN): <em>"${source}"</em><br>
                            📤 Translated (${targetLanguage.toUpperCase()}): <strong style="color: #4da3ff; font-size: 1.1rem; display:block; margin-top:4px;">"${data.responseData.translatedText}"</strong>
                        </div>
                        
                        <div class="source-box" style="border-top: 1px solid #333; padding-top: 12px; margin-top: 15px;">
                            <span style="display: block; font-size: 0.75rem; color: #777; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Sources Index</span>
                            <div class="source-list" style="display: flex; flex-direction: column;">
                                <a href="https://mymemory.translated.net" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;">
                                    <span style="color: #aaa; font-weight: normal;">🗣️ MyMemory Translate API</span>
                                    <span>Open Source →</span>
                                </a>
                            </div>
                        </div>
                    `;
                }).catch(() => {
                    output.innerHTML = `
                        <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">
                            🔄 <strong>Conversion / External Routing Core</strong><br>
                            Evaluating query string parameter link directly: <a href="https://www.google.com/search?q=${encodeURIComponent(query)}" target="_blank" style="color: #4da3ff;">Launch Conversion Card ↗</a>
                        </div>
                    `;
                });
            return;
        }
    }

    if (query.toLowerCase().startsWith("open ")) {
        routingWarning.style.display = "block"; 
        let appName = query.substring(5).trim().toLowerCase().replace(/['"]+/g, '');
        
        if (!appName) {
            output.innerText = "Please specify what you want to open.";
            return;
        }

        output.innerText = `Resolving routing for "${appName}"...`;

        const randomizedRoutes = {
            "gemini": ["https://gemini.google.com", "https://gemini.com"],
            "google gemini": ["https://gemini.google.com"],
            "google deepmind": ["https://deepmind.google/"],
            "deepmind": ["https://deepmind.google/"],
            "youtube music": ["https://music.youtube.com", "https://youtube.com/music"],
            "minecraft": ["https://minecraft.net"],
            "wikipedia": ["https://wikipedia.org"]
        };

        if (randomizedRoutes[appName]) {
            const routesList = randomizedRoutes[appName];
            const randomChoice = routesList[Math.floor(Math.random() * routesList.length)];
            launchTargetUrl(randomChoice);
            return;
        }

        let safeDomainName = appName.replace(/\s+/g, '');
        launchTargetUrl(`https://${safeDomainName}.com`);
        return;
    }

    const isUrlPattern = /\.[a-z]{2,6}/i.test(query);
    const hasProtocol = query.startsWith('http://') || query.startsWith('https://');

    if (hasProtocol || isUrlPattern) {
        routingWarning.style.display = "block"; 
        let targetUrl = query;
        if (!hasProtocol) {
            targetUrl = 'https://' + query;
        }
        launchTargetUrl(targetUrl);
        return;
    }

    // Baseline definitions lookup router
    const isSingleWord = !query.includes(" ");
    if (isSingleWord) {
        output.innerText = `Looking up definition for "${query}"...`;
        fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(query.toLowerCase())}`)
            .then(res => res.json())
            .then(dictData => {
                const key = Object.keys(dictData)[0];
                const definitionObj = dictData[key][0];
                const partOfSpeech = definitionObj.partOfSpeech;
                let rawDefinition = (definitionObj.definitions && definitionObj.definitions.length > 0) ? definitionObj.definitions[0].definition.replace(/<[^>]*>/g, '').trim() : "";
                
                if (!rawDefinition) {
                    rawDefinition = "No direct text definition available. Use the index link (the blue text saying 'Open Source' next to the text saying 'Wiktionary') on the bottom of the page to view the full dictionary entry.";
                }
                
                let infoHTML = `<div class="news-header-msg" style="color: #888; font-style: italic; margin-bottom: 12px; font-size: 0.9rem; line-height: 1.4;">I have provided the most relevant text of each information source related to "${query}".</div>`;
                infoHTML += `
                    <div class="aggregated-text" style="font-size: 0.95rem; color: #e0e0e0; line-height: 1.6; margin-bottom: 15px; background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">
                        <strong>${query.charAt(0).toUpperCase() + query.slice(1)}</strong> (${partOfSpeech.toLowerCase()}): ${rawDefinition}
                    </div>
                `;
                
                // Route directly into our priority pipeline framework
                runUnifiedWikiPipeline(query, infoHTML, true);
            })
            .catch(() => {
                runUnifiedWikiPipeline(query, "", false);
            });
    } else {
        runUnifiedWikiPipeline(query, "", false);
    }
}

// Priority Pipeline Layer: Wikitubia takes top slot over standard Wikipedia searches
function runUnifiedWikiPipeline(query, baselineHTML, hasWiktionary) {
    if (!baselineHTML) {
        baselineHTML = `<div class="news-header-msg" style="color: #888; font-style: italic; margin-bottom: 12px; font-size: 0.9rem; line-height: 1.4;">I have provided the most relevant text of each information source related to "${query}".</div>`;
    }

    // Step 1: Hit Wikitubia Fandom network cluster first
    fetch(`https://youtube.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`)
        .then(res => res.json())
        .then(fandomSearch => {
            const hasTubiaArticle = fandomSearch.query?.search && fandomSearch.query.search.length > 0;
            
            if (hasTubiaArticle) {
                const tubiaTitle = fandomSearch.query.search[0].title;
                fetch(`https://youtube.fandom.com/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(tubiaTitle)}&format=json&origin=*`)
                    .then(res => res.json())
                    .then(pageData => {
                        const pages = pageData.query.pages;
                        const pageId = Object.keys(pages)[0];
                        let tubiaExtract = pages[pageId]?.extract || "";
                        
                        if (tubiaExtract) {
                            if (tubiaExtract.length > 350) tubiaExtract = tubiaExtract.substring(0, 350) + "...";
                            
                            // If wiktionary already occupies the first block, add the standard header dividing line style
                            if (hasWiktionary) {
                                baselineHTML += `<div style="color: #888; font-style: italic; font-size: 0.85rem; margin: 15px 0 8px 0; text-align: left;">This might also be relevant:</div>`;
                            }
                            baselineHTML += `
                                <div class="aggregated-text" style="font-size: 0.95rem; color: #e0e0e0; line-height: 1.6; margin-bottom: 15px; background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4444; text-align: left;">
                                    <strong>${tubiaTitle} (Wikitubia):</strong> ${tubiaExtract}
                                </div>
                            `;
                        }
                        
                        // Proceed to fetch Wikipedia as secondary asset placement match
                        appendSecondaryWikipediaLayer(query, baselineHTML, true, tubiaTitle, hasWiktionary);
                    }).catch(() => appendSecondaryWikipediaLayer(query, baselineHTML, false, null, hasWiktionary));
            } else {
                // If Wikitubia returns blank parameters, skip it entirely and pull Wikipedia straight up
                appendSecondaryWikipediaLayer(query, baselineHTML, false, null, hasWiktionary);
            }
        }).catch(() => appendSecondaryWikipediaLayer(query, baselineHTML, false, null, hasWiktionary));
}

function appendSecondaryWikipediaLayer(query, currentHTML, includedTubia, tubiaTitle, hasWiktionary) {
    fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`)
        .then(res => res.json())
        .then(wikiSearch => {
            if (wikiSearch.query?.search && wikiSearch.query.search.length > 0) {
                let wikipediaTitle = wikiSearch.query.search[0].title;
                if (wikiSearch.query.search[1] && (wikipediaTitle.toLowerCase().includes("refer to") || wikiSearch.query.search[0].snippet.toLowerCase().includes("may refer to"))) {
                    wikipediaTitle = wikiSearch.query.search[1].title;
                }
                
                fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikipediaTitle.replace(/ /g, '_'))}`)
                    .then(res => res.json())
                    .then(summaryData => {
                        let wikiExtract = summaryData.extract || "";
                        if (summaryData.type === "disambiguation" || wikiExtract.toLowerCase().includes("may refer to")) {
                            wikiExtract = "Multiple context records have been located. Browse the full article space using the search portal down below.";
                        }
                        
                        if (wikiExtract) {
                            // Divider rules: show dividing text if EITHER Wikt or Tubia took a spot above it
                            if (includedTubia || hasWiktionary) {
                                currentHTML += `<div style="color: #888; font-style: italic; font-size: 0.85rem; margin: 15px 0 8px 0; text-align: left;">This might also be relevant:</div>`;
                            }
                            currentHTML += `
                                <div class="aggregated-text" style="font-size: 0.95rem; color: #e0e0e0; line-height: 1.6; margin-bottom: 20px; background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #007bff; text-align: left;">
                                    <strong>${wikipediaTitle}:</strong> ${wikiExtract}
                                </div>
                            `;
                        }
                        compileFinalSourceIndexBox(query, currentHTML, true, wikipediaTitle, includedTubia, tubiaTitle, hasWiktionary);
                    }).catch(() => compileFinalSourceIndexBox(query, currentHTML, false, null, includedTubia, tubiaTitle, hasWiktionary));
            } else {
                compileFinalSourceIndexBox(query, currentHTML, false, null, includedTubia, tubiaTitle, hasWiktionary);
            }
        }).catch(() => compileFinalSourceIndexBox(query, currentHTML, false, null, includedTubia, tubiaTitle, hasWiktionary));
}

function compileFinalSourceIndexBox(query, totalHTML, includeWikiLink, wikiTitle, includeTubiaLink, tubiaTitle, hasWiktionary) {
    // If absolutely zero databases return values, display fallback alert core string line
    if (!includeWikiLink && !includeTubiaLink && !hasWiktionary) {
        output.innerText = `Could not extract summary tracking metrics for "${query}". Try a broader topic parameter line!`;
        return;
    }

    totalHTML += `
        <div class="source-box" style="border-top: 1px solid #333; padding-top: 12px; margin-top: 10px;">
            <span style="display: block; font-size: 0.75rem; color: #777; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Sources Index</span>
            <div class="source-list" style="display: flex; flex-direction: column; gap: 6px;">
    `;

    if (hasWiktionary) {
        totalHTML += `
            <a href="https://en.wiktionary.org/wiki/${encodeURIComponent(query)}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;">
                <span style="color: #aaa; font-weight: normal;">📰 Wiktionary</span>
                <span>Open Source →</span>
            </a>
        `;
    }

    if (includeTubiaLink && tubiaTitle) {
        totalHTML += `
            <a href="https://youtube.fandom.com/wiki/${encodeURIComponent(tubiaTitle)}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;">
                <span style="color: #aaa; font-weight: normal;">🔥 Wikitubia</span>
                <span>Fandom Wiki →</span>
            </a>
        `;
    }

    if (includeWikiLink && wikiTitle) {
        totalHTML += `
            <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(wikiTitle)}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;">
                <span style="color: #aaa; font-weight: normal;">📰 Wikipedia</span>
                <span>Open Source →</span>
            </a>
        `;
    }

    totalHTML += `</div></div>`;
    output.innerHTML = totalHTML;
}
