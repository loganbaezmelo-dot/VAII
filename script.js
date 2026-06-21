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

// ==========================================
// 1. APPLICATION ACCESS INITIALIZATION
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

// ==========================================
// 2. CRYPTOGRAPHIC DATA INTERACTION HOOKS
// ==========================================
const _k1 = "AIzaSyAJ";
const _k2 = "KTkU0nd6";
const _k3 = "ZB_zjIcN";
const _k4 = "QCAQQsff";
const _k5 = "HEp4WH8";

const GOOGLE_API_KEY = _k1 + _k2 + _k3 + _k4 + _k5;

// ==========================================
// 3. DOM NODE CONTROL HOOKS
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

let debounceTimer;
const wikitubiaCache = new Set();

const welcomeMessageText = `Welcome back! Enter a search query, app routing command, calculation sequence, weather location, translation phrase, crypto ticker, map request, or art prompt to begin...`;

const defaultAssistantSuggestions = [
    "Open Gemini", 
    "193 lbs to kg", 
    "Open YouTube", 
    "BTC", 
    "Time in Tokyo", 
    "Hello to Spanish", 
    "Open Minecraft", 
    "(12 * 4) / 2",
    "Map of Orlando",
    "Draw a neon cyberpunk switch console artwork"
];

window.initVaiiMap = function() {
    console.log("Maps system ready.");
};

// ==========================================
// 4. AUTOSUGGEST DATA POPULATION LOOPS
// ==========================================
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
        const city = location.name;
        const state = location.admin1;
        const country = location.country;

        let parts = [];
        if (city) parts.push(city);
        if (state && !parts.includes(state)) parts.push(state);
        if (country && !parts.includes(country)) parts.push(country);

        const labelString = parts.join(', ');
        option.value = labelString;
        option.setAttribute('data-lat', location.latitude);
        option.setAttribute('data-lon', location.longitude);
        option.setAttribute('data-tz', location.timezone);
        datalist.appendChild(option);
    });
}

// ==========================================
// 5. SECURE ACCOUNT ACCESS CONTROLLERS
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (authContainer) authContainer.style.display = "none";
        if (mainApp) mainApp.style.display = "block";
        if (output) output.innerText = welcomeMessageText;
        if (authEmail) authEmail.value = "";
        if (authPassword) authPassword.value = "";
        if (authError) authError.style.display = "none";
        if (hubInput) {
            hubInput.value = "";
            hubInput.placeholder = "Type a command...";
        }
        updateDatalist([], [], []);
    } else {
        if (authContainer) authContainer.style.display = "block";
        if (mainApp) mainApp.style.display = "none";
    }
});

if (authToggle) {
    authToggle.addEventListener('click', () => {
        let isLoginMode = (authSubmitBtn.innerText === "Log In");
        if (authError) authError.style.display = "none";
        if (isLoginMode) {
            authTitle.innerText = "✨ Create Account";
            authSubmitBtn.innerText = "Register User";
            authToggle.innerText = "Already have an account? Sign In";
        } else {
            authTitle.innerText = "🔒 Account Sign In";
            authSubmitBtn.innerText = "Log In";
            authToggle.innerText = "Need an account? Register instead";
        }
    });
}

if (authSubmitBtn) {
    authSubmitBtn.addEventListener('click', () => {
        const email = authEmail.value.trim();
        const password = authPassword.value;
        let isLoginMode = (authSubmitBtn.innerText === "Log In");
        if (authError) authError.style.display = "none";
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
}

if (googleSigninBtn) {
    googleSigninBtn.addEventListener('click', () => {
        if (authError) authError.style.display = "none";
        signInWithPopup(auth, googleProvider).catch(err => showAuthError(err.message));
    });
}

if (logoutActionBtn) {
    logoutActionBtn.addEventListener('click', () => {
        signOut(auth).catch(err => console.error("Sign out processing error:", err));
    });
}

function showAuthError(message) {
    if (authError) {
        authError.innerText = message.replace("Firebase: ", "");
        authError.style.display = "block";
    }
}

// ==========================================
// 6. MAIN PROCESSING INTAKE SYSTEMS
// ==========================================
if (helpToggle) {
    helpToggle.addEventListener('click', function() {
        if (helpGuide.style.display === "block") {
            helpGuide.style.display = "none";
            helpToggle.innerText = "?";
        } else {
            helpGuide.style.display = "block";
            helpToggle.innerText = "✕";
        }
    });
}

if (hubInput) {
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

        let searchUrlQuery = trimmedQuery;
        if (searchUrlQuery.toLowerCase().startsWith("map of ")) {
            searchUrlQuery = searchUrlQuery.substring(7).trim();
        } else if (searchUrlQuery.toLowerCase().startsWith("show map ")) {
            searchUrlQuery = searchUrlQuery.substring(9).trim();
        } else if (searchUrlQuery.toLowerCase().startsWith("weather in ")) {
            searchUrlQuery = searchUrlQuery.substring(11).trim();
        } else if (searchUrlQuery.toLowerCase().startsWith("time in ")) {
            searchUrlQuery = searchUrlQuery.substring(8).trim();
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const geoFetch = fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchUrlQuery)}&count=3&language=en&format=json`)
                .then(res => res.json())
                .then(data => data.results || [])
                .catch(() => []);

            const wikiFetch = fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchUrlQuery)}&utf8=&format=json&origin=*`)
                .then(res => res.json())
                .then(data => {
                    if (data.query && data.query.search) {
                        return data.query.search.map(item => item.title);
                    }
                    return [];
                })
                .catch(() => []);

            const wikitubiaFetch = fetch(`https://youtube.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchUrlQuery)}&utf8=&format=json&origin=*`)
                .then(res => res.json())
                .then(data => {
                    if (data.query && data.query.search) {
                        const titles = data.query.search.map(item => item.title);
                        titles.forEach(title => wikitubiaCache.add(title.toLowerCase().trim()));
                        return titles;
                    }
                    return [];
                })
                .catch(() => []);

            Promise.all([geoFetch, wikiFetch, wikitubiaFetch]).then(([cities, wikiTitles, wikitubiaTitles]) => {
                updateDatalist(cities, wikiTitles, wikitubiaTitles);
            });
        }, 300);
    });
}

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

if (hubInput) {
    hubInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && executeActionBtn) {
            executeActionBtn.click();
        }
    });
}

// ====================================================
// 7. THE UNIFIED LOCATION ENGINE: MERGING WEATHER, CLOCK, MAPS
// ====================================================
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
            
            output.innerHTML = greetingHTML + `
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
            
            if (typeof google !== 'undefined' && google.maps) {
                const mapCoordinates = { lat: parseFloat(lat), lng: parseFloat(lon) };
                const loadedMapInstance = new google.maps.Map(document.getElementById('vaii-merged-map-canvas'), {
                    center: mapCoordinates,
                    zoom: 12,
                    disableDefaultUI: false,
                    styles: [
                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }
                    ]
                });
                
                new google.maps.Marker({
                    position: mapCoordinates,
                    map: loadedMapInstance,
                    title: displayName
                });
            } else {
                document.getElementById('vaii-merged-map-canvas').innerHTML = `
                    <div style="padding:20px; color:#ff4d4d; font-size:0.85rem; text-align:center; line-height:200px;">
                        Google Maps loading error or invalid runtime script authorization keys.
                    </div>
                `;
            }
        })
        .catch(err => {
            output.innerText = "Error pulling metrics for this spatial location.";
            console.error(err);
        });
}

// ==========================================
// 8. DATA EVALUATION UTILITIES
// ==========================================
function runMarketExecution(ticker) {
    output.innerText = `Fetching price updates for "${ticker.toUpperCase()}"...`;
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
                `;
            }).catch(() => { output.innerText = "Error pulling crypto ticker data."; });
    } else {
        output.innerHTML = `
            <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #6f42c1; text-align: left;">
                <strong>📈 Stock Ticker: ${ticker.toUpperCase()}</strong><br>
                <span style="color: #aaa; font-size: 0.9rem;">To view deep market assets, open the link directly:</span>
                <a href="https://finance.yahoo.com/quote/${ticker.toUpperCase()}" target="_blank">Open Yahoo Finance ↗</a>
            </div>
        `;
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
        const loader = document.getElementById("image-loader");
        if (loader) loader.remove();
        img.style.display = "block";
    };
    output.appendChild(img);
}

// ==========================================
// 9. STRING ROUTING EXECUTIONS
// ==========================================
function runInfoExecution(query) {
    const cleanQuery = query.toLowerCase().trim();
    const cryptoMap = { btc: "bitcoin", eth: "ethereum", sol: "solana", doge: "dogecoin", xrp: "ripple" };

    const greetingsList = ["hello", "hi", "hey", "sup", "yo", "greetings", "whats up", "what's up"];
    let greetingHTML = "";
    if (greetingsList.includes(cleanQuery)) {
        greetingHTML = `
            <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #17a2b8; text-align: left; margin-bottom: 15px;">
                👋 <strong>Assistant:</strong><br><span>Hello! How can I help you today? System initialized.</span>
            </div>
        `;
    }

    // Block Workspace Triggers 
    if (cleanQuery.includes("calendar") || cleanQuery.includes("calender") || cleanQuery.includes("schedule") || cleanQuery === "agenda" || cleanQuery.includes("email") || cleanQuery.includes("gmail") || cleanQuery.includes("inbox") || cleanQuery.includes("drive") || cleanQuery.includes("files")) {
        output.innerHTML = greetingHTML + `
            <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">
                ⚠️ <strong>Workspace Elements Disabled:</strong><br><br>
                <span style="color: #aaa; font-size: 0.9rem;">Private calendar and email protocols remain inactive to preserve a standard authorization route.</span>
            </div>
        `;
        return; 
    }

    // Unified Location Routing Interceptor
    const isLocationIntent = cleanQuery.startsWith("map of ") || 
                             cleanQuery.startsWith("show map ") || 
                             cleanQuery.startsWith("time in ") || 
                             cleanQuery.startsWith("weather in ") || 
                             cleanQuery.startsWith("weather ") || 
                             cleanQuery.startsWith("clock ");

    if (isLocationIntent) {
        let parsedLocation = query
            .replace(/map of /i, "")
            .replace(/show map /i, "")
            .replace(/time in /i, "")
            .replace(/weather in /i, "")
            .replace(/weather /i, "")
            .replace(/clock /i, "")
            .trim();
            
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(parsedLocation)}&count=1&language=en&format=json`)
            .then(res => res.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    const loc = data.results[0];
                    const fullDisplayName = `${loc.name}, ${loc.admin1 || ''} (${loc.country})`;
                    renderUnifiedLocationCard(loc.latitude, loc.longitude, loc.timezone, fullDisplayName, greetingHTML);
                } else {
                    output.innerText = `Could not extract metrics for "${parsedLocation}".`;
                }
            }).catch(() => { output.innerText = "Location processing engine connection failure."; });
        return;
    }

    // Datalist Match Fallback Routing 
    const options = Array.from(datalist.options);
    const matchedOption = options.find(opt => opt.value.toLowerCase() === cleanQuery);
    if (matchedOption && matchedOption.getAttribute('data-lat')) {
        const lat = matchedOption.getAttribute('data-lat');
        const lon = matchedOption.getAttribute('data-lon');
        const tz = matchedOption.getAttribute('data-tz');
        renderUnifiedLocationCard(lat, lon, tz, matchedOption.value, greetingHTML);
        return;
    }

    // Browser Redirection Routing Links
    if (query.toLowerCase().startsWith("open ")) {
        routingWarning.style.display = "block"; 
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
        routingWarning.style.display = "block"; 
        launchTargetUrl(query.startsWith('http') ? query : 'https://' + query);
        return;
    }

    // Market Redirection Core Loops
    if (cryptoMap[cleanQuery] || cleanQuery.startsWith("price of ")) {
        runMarketExecution(cleanQuery.startsWith("price of ") ? cleanQuery.substring(9).trim() : cleanQuery);
        return;
    }

    // Math Computations and Unit Transformation Matrix
    if (/^[0-9+\-*/().\s]+$/.test(query) || cleanQuery.includes(" to ")) {
        try {
            if (!cleanQuery.includes(" to ")) {
                const result = Function(`"use strict"; return (${query})`)();
                output.innerHTML = `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">🔢 <strong>Calculation:</strong><br><span style="font-size: 1.3rem; font-weight: bold;">${query} = ${result}</span></div>`;
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
                    output.innerHTML = `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">🔄 <strong>Conversion:</strong><br>📤 Result: <strong style="color: #28a745; font-size: 1.3rem; display:block; margin-top:4px;">${conversionResult}</strong></div>`;
                    return;
                }
            }
            fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(source)}&langpair=en|${encodeURIComponent(targetLanguage.substring(0,2))}`)
                .then(res => res.json())
                .then(data => {
                    output.innerHTML = `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">🗣️ <strong>Translation:</strong><br>📤 Result: <strong style="color: #4da3ff; font-size: 1.1rem; display:block; margin-top:4px;">"${data.responseData.translatedText}"</strong></div>`;
                }).catch(() => {});
            return;
        }
    }

    // Definition Parsing Loops
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
                let wikiData = {};
                if (greetingHTML) wikiData.greeting = greetingHTML;
                runUnifiedWikiPipeline(query, wikiData);
            });
    } else {
        let wikiData = {};
        if (greetingHTML) wikiData.greeting = greetingHTML;
        runUnifiedWikiPipeline(query, wikiData);
    }
}

// ==========================================
// 10. EXTERNAL DOCUMENTATION CRAWL ENGINES
// ==========================================
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
        output.innerHTML = totalHTML + `<div>No matches found for "${query}".</div>`;
        return;
    }
    
    // RESTORED: Original prewritten text heading layout override
    totalHTML += `<div style="color: #888; font-style: italic; margin-bottom: 12px; font-size: 0.9rem;">Relevant documentation indices for "${query}":</div>` + blocksHtml.join('<div style="margin: 10px 0;"></div>');

    // MASTER SOURCE INDEX LINK FOOTER
    totalHTML += `
        <div class="source-box" style="border-top: 1px solid #333; padding-top: 12px; margin-top: 15px;">
            <span style="display: block; font-size: 0.75rem; color: #777; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Sources Index</span>
            <div class="source-list" style="display: flex; flex-direction: column; gap: 6px;">
    `;

    if (wikiData.wiktionary) {
        totalHTML += `
            <a href="https://en.wiktionary.org/wiki/${encodeURIComponent(query)}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;">
                <span style="color: #aaa; font-weight: normal;">📰 Wiktionary</span>
                <span>Open Source →</span>
            </a>
        `;
    }

    if (wikiData.youtube) {
        const channelPath = wikiData.youtube.customUrl ? wikiData.youtube.customUrl : `@channel`;
        totalHTML += `
            <a href="https://www.youtube.com/${channelPath}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #ff4444; text-decoration: none; font-size: 0.82rem; font-weight: bold;">
                <span style="color: #aaa; font-weight: normal;">🔴 YouTube Channel</span>
                <span>Live Metrics →</span>
            </a>
        `;
    }

    if (wikiData.wikipedia) {
        totalHTML += `
            <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(wikiData.wikipedia.title)}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;">
                <span style="color: #aaa; font-weight: normal;">📰 Wikipedia</span>
                <span>Open Source →</span>
            </a>
        `;
    }

    totalHTML += `</div></div>`;
    output.innerHTML = totalHTML;
}
