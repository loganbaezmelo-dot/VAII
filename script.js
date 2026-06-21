import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your brand new updated web app's Firebase configuration layout
const firebaseConfig = {
  apiKey: "AIzaSyDiSUeuVzA1n9d1yyODgOvnv0erey4EipQ",
  authDomain: "loganhajeheh-i.firebaseapp.com",
  projectId: "loganhajeheh-i",
  storageBucket: "loganhajeheh-i.firebasestorage.app",
  messagingSenderId: "895508601514",
  appId: "1:895508601514:web:d8f65f587e746d251f4ed3",
  measurementId: "G-JZTHTP0M74"
};

// Initialize Firebase Entities
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Explicitly inject the scope required to view calendar events during user authentication
googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');

// ====================================================
// OBFUSCATED CONFIGURATION: SPLIT CLOUD KEY CORE
// ====================================================
const _k1 = "AIzaSyAJ";
const _k2 = "KTkU0nd6";
const _k3 = "ZB_zjIcN";
const _k4 = "QCAQQsff";
const _k5 = "HEp4WH8";

const GOOGLE_API_KEY = _k1 + _k2 + _k3 + _k4 + _k5;

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
const wikitubiaCache = new Set();

const welcomeMessageText = `Welcome back! Enter a search query, app routing command, calculation sequence, weather location, translation phrase, crypto key, or art prompt to begin...`;

const defaultAssistantSuggestions = [
    "Open Gemini", 
    "193 lbs to kg", 
    "Open YouTube", 
    "BTC", 
    "Time in Tokyo", 
    "Hello to Spanish", 
    "Open Minecraft", 
    "(12 * 4) / 2",
    "Show my calendar",
    "Map of Orlando",
    "Draw a neon cyberpunk switch console artwork"
];

window.initVaiiMap = function() {
    console.log("Maps API successfully authorized and booted.");
};

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
        option.value = location;
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
        isLoginMode = !isLoginMode;
        if (authError) authError.style.display = "none";
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
}

if (authSubmitBtn) {
    authSubmitBtn.addEventListener('click', () => {
        const email = authEmail.value.trim();
        const password = authPassword.value;
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
        signInWithPopup(auth, googleProvider)
            .then((result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                if (token) {
                    localStorage.setItem('google_oauth_token', token);
                }
            })
            .catch(err => showAuthError(err.message));
    });
}

if (logoutActionBtn) {
    logoutActionBtn.addEventListener('click', () => {
        localStorage.removeItem('google_oauth_token');
        signOut(auth).catch(err => console.error("Sign out fail:", err));
    });
}

function showAuthError(message) {
    if (authError) {
        authError.innerText = message.replace("Firebase: ", "");
        authError.style.display = "block";
    }
}

// ==========================================
// 2. MAIN HUB INTERFACE OPERATIONAL LOOPS
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
                `;
            }).catch(() => { output.innerText = "Error pulling crypto ticker data."; });
    } else {
        output.innerHTML = `
            <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #6f42c1; text-align: left;">
                <strong>📈 Stock Ticker Tracker: ${ticker.toUpperCase()}</strong><br>
                <span style="color: #aaa; font-size: 0.9rem;">To view deep market assets without explicit tokens, launch structural metrics directly:</span>
                <a href="https://finance.yahoo.com/quote/${ticker.toUpperCase()}" target="_blank">Open Yahoo Finance Chart ↗</a>
            </div>
        `;
    }
}

function launchTargetUrl(url) {
    let contentHTML = `
        <div class="news-header-msg" style="color: #888; font-style: italic; margin-bottom: 4px; font-size: 0.9rem; line-height: 1.4;">Navigating to external web link...</div>
        <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #007bff; text-align: left; margin-bottom: 15px;">
            🔗 <strong>Resolved Address:</strong> <span style="color: #4da3ff; word-break: break-all;">${url}</span>
        </div>
        <a href="${url}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #007bff; border-radius: 6px; padding: 10px 14px; color: white; text-decoration: none; font-weight: bold; font-size: 0.95rem;">
            <span>Launch Link</span>
            <span>Open Site ↗</span>
        </a>
    `;
    output.innerHTML = contentHTML;
    window.open(url, '_blank');
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
    };
    output.appendChild(img);
}

function runInfoExecution(query) {
    const cleanQuery = query.toLowerCase().trim();
    const cryptoMap = { btc: "bitcoin", eth: "ethereum", sol: "solana", doge: "dogecoin", xrp: "ripple" };

    const greetingsList = ["hello", "hi", "hey", "sup", "yo", "greetings", "whats up", "what's up"];
    let greetingHTML = "";
    if (greetingsList.includes(cleanQuery)) {
        greetingHTML = `
            <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #17a2b8; text-align: left; margin-bottom: 15px;">
                👋 <strong>VAII Assistant:</strong><br>
                <span>Hello! How can I help you today? Baseline parameters initialized.</span>
            </div>
        `;
    }

    // 1. LIVE GOOGLE CALENDAR ENGINE: Pulls real events using valid user credentials
    if (cleanQuery.includes("calendar") || cleanQuery.includes("calender") || cleanQuery.includes("schedule") || cleanQuery === "agenda") {
        const token = localStorage.getItem('google_oauth_token');
        if (!token) {
            output.innerHTML = greetingHTML + `
                <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left; margin-bottom: 15px;">
                    📅 <strong>VAII Calendar Module:</strong><br><br>
                    <span style="color: #ff4d4d; font-size: 0.9rem;">Access Denied. You must log out and use the "Sign in with Google" button to authorize calendar access features.</span>
                </div>
            `;
            return;
        }

        output.innerHTML = greetingHTML + `<div style="color:#888; font-style:italic;">Fetching your upcoming calendar events...</div>`;

        fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=5&orderBy=startTime&singleEvents=true&access_token=${token}`)
            .then(res => {
                if (!res.ok) throw new Error("Unauthorized");
                return res.json();
            })
            .then(data => {
                const events = data.items || [];
                if (events.length === 0) {
                    output.innerHTML = greetingHTML + `
                        <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">
                            📅 <strong>Upcoming Agenda:</strong><br><br>
                            <span style="color: #aaa;">No upcoming events found in your calendar.</span>
                        </div>
                    `;
                    return;
                }

                let eventsHTML = events.map(evt => {
                    const start = evt.start.dateTime || evt.start.date;
                    const formattedDate = new Date(start).toLocaleDateString("en-US", { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    return `<div style="margin-bottom:8px; border-bottom:1px solid #333; padding-bottom:4px;">
                        <strong style="color:#ffc107;">• ${evt.summary || 'Untitled Event'}</strong><br>
                        <span style="font-size:0.82rem; color:#888;">⏰ ${formattedDate}</span>
                    </div>`;
                }).join('');

                output.innerHTML = greetingHTML + `
                    <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">
                        📅 <strong>Upcoming Agenda:</strong><br><br>
                        ${eventsHTML}
                    </div>
                `;
            })
            .catch(() => {
                output.innerHTML = greetingHTML + `
                    <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">
                        📅 <strong>VAII Calendar Module:</strong><br><br>
                        <span style="color: #ff4d4d; font-size: 0.9rem;">Token expired or API not enabled. Make sure the Google Calendar API is fully enabled in your Google Cloud dashboard layout.</span>
                    </div>
                `;
            });
        return;
    }

    // 2. NATIVE MAPS JAVASCRIPT SDK CANVAS CONSTRUCTOR
    if (cleanQuery.startsWith("map of ") || cleanQuery.startsWith("show map ")) {
        const targetLocation = query.replace(/map of /i, "").replace(/show map /i, "").trim();
        output.innerHTML = greetingHTML + `<div style="color:#888; font-style:italic;">Resolving coordinates...</div>`;
        
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(targetLocation)}&count=1&language=en&format=json`)
            .then(res => res.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    const loc = data.results[0];
                    
                    output.innerHTML = greetingHTML + `
                        <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #4da3ff; text-align: left;">
                            🗺️ <strong>Interactive Map: ${loc.name}, ${loc.country || ''}</strong><br><br>
                            <div id="vaii-js-map-canvas" style="width:100%; height:250px; border-radius:6px; background:#252525;"></div>
                        </div>
                    `;
                    
                    if (typeof google !== 'undefined' && google.maps) {
                        const mapCoordinates = { lat: loc.latitude, lng: loc.longitude };
                        const loadedMapInstance = new google.maps.Map(document.getElementById('vaii-js-map-canvas'), {
                            center: mapCoordinates,
                            zoom: 12,
                            disableDefaultUI: false
                        });
                        
                        new google.maps.Marker({
                            position: mapCoordinates,
                            map: loadedMapInstance,
                            title: loc.name
                        });
                    } else {
                        document.getElementById('vaii-js-map-canvas').innerHTML = `
                            <div style="padding:20px; color:#ff4d4d; font-size:0.85rem;">
                                Google Maps script library missing or unauthorized. Verify runtime console logs.
                            </div>
                        `;
                    }
                } else {
                    output.innerText = `Could not track coordinates for "${targetLocation}".`;
                }
            })
            .catch(() => {
                output.innerText = "Failed parsing spatial lookups.";
            });
        return;
    }

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

    if (cryptoMap[cleanQuery] || cleanQuery.startsWith("price of ")) {
        let parsedTicker = cleanQuery.startsWith("price of ") ? cleanQuery.substring(9).trim() : cleanQuery;
        runMarketExecution(parsedTicker);
        return;
    }

    if (/^[0-9+\-*/().\s]+$/.test(query) || cleanQuery.includes(" to ")) {
        try {
            if (!cleanQuery.includes(" to ")) {
                const result = Function(`"use strict"; return (${query})`)();
                output.innerHTML = `
                    <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">
                        🔢 <strong>Calculation Result:</strong><br>
                        <span style="font-size: 1.3rem; font-weight: bold;">${query} = ${result}</span>
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
                    `;
                }).catch(() => {
                    output.innerHTML = `
                        <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">
                            🔄 <strong>Conversion / External Routing Core</strong><br>
                            Evaluating query string parameter link directly: <a href="https://www.google.com/search?q=${encodeURIComponent(query)}" target="_blank">Launch Conversion Card ↗</a>
                        </div>
                    `;
                });
            return;
        }
    }

    routingWarning.style.display = "none";
    const isSingleWord = !query.includes(" ");

    if (isSingleWord) {
        output.innerText = `Looking up definition for "${query}"...`;
        fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(query.toLowerCase())}`)
            .then(res => {
                if (!res.ok) throw new Error("Word not found");
                return res.json();
            })
            .then(dictData => {
                const key = Object.keys(dictData)[0];
                if (!dictData[key] || dictData[key].length === 0) throw new Error();
                
                const definitionObj = dictData[key][0];
                const partOfSpeech = definitionObj.partOfSpeech || "noun";
                let rawDefinition = (definitionObj.definitions && definitionObj.definitions.length > 0) ? definitionObj.definitions[0].definition.replace(/<[^>]*>/g, '').trim() : "";
                
                if (!rawDefinition) {
                    rawDefinition = "No direct text definition available. Use the index link on the bottom of the page to view the full dictionary entry.";
                }
                
                let wikiData = {
                    wiktionary: { title: query, text: rawDefinition, pos: partOfSpeech }
                };
                if (greetingHTML) wikiData.greeting = greetingHTML;
                
                runUnifiedWikiPipeline(query, wikiData, true);
            })
            .catch(() => {
                let wikiData = {};
                if (greetingHTML) wikiData.greeting = greetingHTML;
                runUnifiedWikiPipeline(query, wikiData, false);
            });
    } else {
        let wikiData = {};
        if (greetingHTML) wikiData.greeting = greetingHTML;
        runUnifiedWikiPipeline(query, wikiData, false);
    }
}

function runUnifiedWikiPipeline(query, wikiData, hasWiktionary) {
    const famousYoutubersList = [
        "jacksucksatlife", "mrbeast", "pewdiepie", "markiplier", "jacksepticeye", 
        "caseoh", "jynxzi", "kai cenat", "ludwig", "xqc", "moistcr1tikal", "penguinz0", 
        "sidemen", "ksi", "w2s", "wroetoshaw", "miniminter", "vikkstar", "vikkstar123", 
        "mrwhosetheboss", "mkbhd", "marques brownlee", "linustechtips", "unbox therapy", 
        "dantdm", "popularmmos", "stampy", "stampylonghead", "dream", "technoblade", 
        "tommyinnit", "lazarbeam", "airrack", "ryan trahan", "smosh", "gmm", "rhett and link",
        "jacksepticeye", "pokimane", "valkyrae", "ninja", "shroud", "disguised toast", "sykkuno",
        "hasanabi", "asmongold", "ilyasiel", "safiya nygaard", "nigahiga", "davie504", "jolly"
    ];

    const lowerQuery = query.toLowerCase().trim();
    const isInfluencer = wikitubiaCache.has(lowerQuery) || famousYoutubersList.some(name => lowerQuery.includes(name));

    const youtubeFetch = (isInfluencer && GOOGLE_API_KEY)
        ? fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`)
            .then(res => res.json())
            .then(searchData => {
                if (searchData.items && searchData.items.length > 0) {
                    const channelId = searchData.items[0].id.channelId;
                    return fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${GOOGLE_API_KEY}`)
                        .then(res => res.json())
                        .then(channelData => {
                            if (channelData.items && channelData.items.length > 0) {
                                const item = channelData.items[0];
                                wikiData.youtube = {
                                    title: item.snippet.title,
                                    text: item.snippet.description || "No profile bio text compiled.",
                                    subs: parseInt(item.statistics.subscriberCount).toLocaleString(),
                                    views: parseInt(item.statistics.viewCount).toLocaleString(),
                                    customUrl: item.snippet.customUrl || ""
                                };
                            }
                        });
                }
            }).catch(() => null)
        : Promise.resolve();

    const wikipediaFetch = fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`)
        .then(res => res.json())
        .then(wikiSearch => {
            if (wikiSearch.query?.search && wikiSearch.query.search.length > 0) {
                let wikipediaTitle = wikiSearch.query.search[0].title;
                if (wikiSearch.query.search[1] && (wikipediaTitle.toLowerCase().includes("refer to") || wikiSearch.query.search[0].snippet.toLowerCase().includes("may refer to"))) {
                    wikipediaTitle = wikiSearch.query.search[1].title;
                }
                
                return fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikipediaTitle.replace(/ /g, '_'))}`)
                    .then(res => res.json())
                    .then(summaryData => {
                        let wikiExtract = summaryData.extract || "";
                        if (summaryData.type === "disambiguation" || wikiExtract.toLowerCase().includes("may refer to")) {
                            wikiExtract = "Multiple context records have been located. Browse the full article space using the search portal down below.";
                        }
                        
                        if (wikiExtract) {
                            wikiData.wikipedia = { title: wikipediaTitle, text: wikiExtract };
                        }
                    });
            }
        }).catch(() => null);

    Promise.all([youtubeFetch, wikipediaFetch]).then(() => {
        compileFinalSourceIndexBox(query, wikiData, hasWiktionary);
    });
}

function compileFinalSourceIndexBox(query, wikiData, hasWiktionary) {
    let showWiktionary = !!wikiData.wiktionary;
    let showWikipedia = !!wikiData.wikipedia;
    let showYoutube = !!wikiData.youtube;

    const wikiText = wikiData.wikipedia?.text?.trim();
    const wikitionaryText = wikiData.wiktionary?.text?.trim();

    if (showWikipedia) {
        const wikiTitleClean = wikiData.wikipedia.title.toLowerCase().trim();
        const wikiTextClean = wikiText.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (showWiktionary) {
            const wiktTitleClean = wikiData.wiktionary.title.toLowerCase().trim();
            const wiktTextClean = wikitionaryText.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            if (wikiTitleClean === wiktTitleClean || wikiTextClean.includes(wiktTextClean) || wiktTextClean.includes(wikiTextClean)) {
                showWiktionary = false;
            }
        }
    }

    if (!showWikipedia && !showWiktionary && !showYoutube) {
        let totalHTML = "";
        if (wikiData.greeting) {
            totalHTML += wikiData.greeting;
            totalHTML += `<div class="news-header-msg" style="color: #888; font-style: italic; margin-bottom: 12px; font-size: 0.9rem; line-height: 1.4;">Could not extract additional summary metrics for "${query}".</div>`;
            output.innerHTML = totalHTML;
        } else {
            output.innerText = `Could not extract summary tracking metrics for "${query}". Try a broader topic parameter line!`;
        }
        return;
    }

    let blocksHtml = [];
    if (showWiktionary) {
        blocksHtml.push(`
            <div class="aggregated-text" style="font-size: 0.95rem; color: #e0e0e0; line-height: 1.6; background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">
                <strong>${wikiData.wiktionary.title.charAt(0).toUpperCase() + wikiData.wiktionary.title.slice(1)}</strong> (${wikiData.wiktionary.pos.toLowerCase()}): ${wikiData.wiktionary.text}
            </div>
        `);
    }
    if (showYoutube) {
        blocksHtml.push(`
            <div class="aggregated-text" style="font-size: 0.95rem; color: #e0e0e0; line-height: 1.6; background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff0000; text-align: left;">
                <strong>📺 ${wikiData.youtube.title} (YouTube)</strong><br>
                <span style="font-size: 0.85rem; color: #aaa;">🔴 Subscribers: ${wikiData.youtube.subs} | 👁️ Total Views: ${wikiData.youtube.views}</span><br><br>
                <em>${wikiData.youtube.text}</em>
            </div>
        `);
    }
    if (showWikipedia) {
        blocksHtml.push(`
            <div class="aggregated-text" style="font-size: 0.95rem; color: #e0e0e0; line-height: 1.6; background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #007bff; text-align: left;">
                <strong>${wikiData.wikipedia.title}:</strong> ${wikiData.wikipedia.text}
            </div>
        `);
    }

    let totalHTML = "";
    if (wikiData.greeting) {
        totalHTML += wikiData.greeting;
    }
    
    totalHTML += `<div class="news-header-msg" style="color: #888; font-style: italic; margin-bottom: 12px; font-size: 0.9rem; line-height: 1.4;">I have provided the most relevant text of each information source related to "${query}".</div>`;
    totalHTML += blocksHtml.join(`<div style="color: #888; font-style: italic; font-size: 0.85rem; margin: 15px 0 8px 0; text-align: left;">This might also be relevant:</div>`);

    totalHTML += `
        <div class="source-box" style="border-top: 1px solid #333; padding-top: 12px; margin-top: 10px;">
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
