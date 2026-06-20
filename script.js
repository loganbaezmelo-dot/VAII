// Import direct from Google's official stable Firebase SDK CDN networks
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

// Firebase App Configuration Setup
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

const cityInput = document.getElementById('city-input');
const datalist = document.getElementById('city-suggestions');
const weatherBtn = document.getElementById('weather-btn');
const newsBtn = document.getElementById('news-btn');
const marketBtn = document.getElementById('market-btn');
const clockBtn = document.getElementById('clock-btn');
const drawBtn = document.getElementById('draw-btn');
const executeActionBtn = document.getElementById('execute-action-btn');
const output = document.getElementById('weather-output');
const routingWarning = document.getElementById('routing-warning');
const helpToggle = document.getElementById('help-toggle');
const helpGuide = document.getElementById('help-guide');

let isLoginMode = true;
let debounceTimer;
let currentMode = 'info'; 

// Keyboards suggestions presets mapping
const defaultInfoSuggestions = [
    "Open Gemini", "Open DeepMind", "Open YouTube", "Open Wikipedia", "Open Minecraft", "Open YouTube Music"
];
const defaultMarketSuggestions = ["BTC", "ETH", "AAPL", "GOOGL", "SOL"];
const defaultClockSuggestions = ["London", "Tokyo", "New York", "Paris", "Los Angeles"];
const defaultDrawSuggestions = [
    "A neon cyberpunk switch console artwork",
    "Retro arcade machine sitting in an empty vaporwave room",
    "Hyper-detailed digital painting of a cosmic fantasy library",
    "Futuristic command center terminal minimal vector style"
];

function setAppInputMode(newMode, placeholderText, activeBtn) {
    currentMode = newMode;
    if (cityInput) {
        cityInput.placeholder = placeholderText;
        cityInput.className = ""; 
        cityInput.classList.add(`mode-${newMode}`);
        cityInput.value = ""; 
    }
    if (datalist) datalist.innerHTML = ""; 
    document.querySelectorAll('.mode-select').forEach(btn => btn.classList.remove('active'));
    if (activeBtn) activeBtn.classList.add('active');
    populateStaticSuggestions();
}

function populateStaticSuggestions() {
    if (currentMode === 'info') buildDatalistNodes(defaultInfoSuggestions);
    else if (currentMode === 'market') buildDatalistNodes(defaultMarketSuggestions);
    else if (currentMode === 'clock') buildDatalistNodes(defaultClockSuggestions);
    else if (currentMode === 'draw') buildDatalistNodes(defaultDrawSuggestions);
}

function buildDatalistNodes(stringArray) {
    if (!datalist) return;
    datalist.innerHTML = "";
    stringArray.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
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
        output.innerText = `Welcome back! Arm an interface tool above and hit the arrow button...`;
        authEmail.value = "";
        authPassword.value = "";
        authError.style.display = "none";
        setAppInputMode('info', "Search topics, apps, or links...", newsBtn);
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

weatherBtn.addEventListener('click', () => setAppInputMode('weather', "Enter city or country location...", weatherBtn));
newsBtn.addEventListener('click', () => setAppInputMode('info', "Search topics, apps, or links...", newsBtn));
marketBtn.addEventListener('click', () => setAppInputMode('market', "Enter stock ticker or crypto token...", marketBtn));
clockBtn.addEventListener('click', () => setAppInputMode('clock', "Enter city name to check timezone...", clockBtn));
drawBtn.addEventListener('click', () => setAppInputMode('draw', "Describe an image prompt...", drawBtn));

cityInput.addEventListener('input', function() {
    const query = cityInput.value; 
    const trimmedQuery = query.trim();
    
    if (query.toLowerCase().startsWith('open ')) {
        datalist.innerHTML = ""; 
        routingWarning.style.display = "block"; 
        return;
    } else {
        routingWarning.style.display = "none";
    }

    if (currentMode !== 'weather') {
        if (trimmedQuery.length === 0) {
            populateStaticSuggestions();
        }
        return;
    }

    if (trimmedQuery.length < 3) {
        datalist.innerHTML = "";
        return;
    }

    if (trimmedQuery.startsWith('http://') || trimmedQuery.startsWith('https://') || /\.[a-z]{2,6}/i.test(trimmedQuery)) {
        datalist.innerHTML = "";
        return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmedQuery)}&count=5&language=en&format=json`)
            .then(res => res.json())
            .then(geoData => {
                datalist.innerHTML = ""; 
                if (!geoData.results) return;

                geoData.results.forEach(location => {
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
                    datalist.appendChild(option);
                });
            })
            .catch(err => console.error("Suggestions error:", err));
    }, 300);
});

if (executeActionBtn) {
    executeActionBtn.addEventListener('click', function() {
        const query = cityInput.value.trim();
        if (!query) {
            output.innerText = "Please input a term or prompt value first.";
            return;
        }

        if (currentMode === 'weather') runWeatherExecution(query);
        else if (currentMode === 'market') runMarketExecution(query);
        else if (currentMode === 'clock') runClockExecution(query);
        else if (currentMode === 'draw') {
            let imagePrompt = query;
            if (imagePrompt.toLowerCase().startsWith("draw ")) {
                imagePrompt = imagePrompt.substring(5).trim();
            }
            executeImageGeneration(imagePrompt);
        } else {
            runInfoExecution(query);
        }
    });
}

cityInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && executeActionBtn) {
        executeActionBtn.click();
    }
});

// ----------------------------------------------------
// ROUTED TARGET SYSTEMS
// ----------------------------------------------------
function runWeatherExecution(searchCity) {
    routingWarning.style.display = "none"; 
    output.innerText = "Searching coordinates...";

    const options = Array.from(datalist.options);
    const matchedOption = options.find(opt => opt.value === searchCity);

    if (matchedOption && matchedOption.getAttribute('data-lat')) {
        const lat = matchedOption.getAttribute('data-lat');
        const lon = matchedOption.getAttribute('data-lon');
        getWeatherData(lat, lon, searchCity);
    } else {
        const parseCity = searchCity.split(',')[0].trim();
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(parseCity)}&count=1&language=en&format=json`)
            .then(res => res.json())
            .then(geoData => {
                if (!geoData.results || geoData.results.length === 0) {
                    output.innerText = "Location not found.";
                    return;
                }
                const loc = geoData.results[0];
                const displayName = `${loc.name}, ${loc.admin1 || ''} ${loc.country}`;
                getWeatherData(loc.latitude, loc.longitude, displayName);
            })
            .catch(err => {
                output.innerText = "Error fetching location coordinates.";
                console.error(err);
            });
    }
}

function getWeatherData(lat, lon, displayName) {
    output.innerText = `Fetching forecast for ${displayName}...`;
    
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
        .then(res => res.json())
        .then(weatherData => {
            const tempCelsius = weatherData.current_weather.temperature;
            const tempFahrenheit = Math.round((tempCelsius * 9/5) + 32);
            
            output.innerHTML = `
                <strong>📍 ${displayName}</strong><br>
                🌡️ Temperature: ${tempFahrenheit}°F (${tempCelsius}°C)<br>
                💨 Wind Speed: ${weatherData.current_weather.windspeed} km/h
            `;
            setAppInputMode('info', "Search topics, apps, or links...", newsBtn);
        })
        .catch(err => {
            output.innerText = "Error fetching live weather data.";
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
                <a href="https://finance.yahoo.com/quote/${ticker.toUpperCase()}" target="_blank" style="display: block; text-align: center; margin-top: 10px; background: #6f42c1; color: white; padding: 8px; border-radius: 6px; text-decoration: none; font-weight: bold;">Open Yahoo Finance Chart ↗</a>
            </div>
        `;
    }
}

function runClockExecution(location) {
    output.innerText = `Resolving local clock context for "${location}"...`;
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`)
        .then(res => res.json())
        .then(data => {
            if (!data.results || data.results.length === 0) throw new Error();
            const zone = data.results[0].timezone;
            const timeString = new Date().toLocaleTimeString("en-US", { timeZone: zone, hour: '2-digit', minute: '2-digit' });
            const dateString = new Date().toLocaleDateString("en-US", { timeZone: zone, weekday: 'long', month: 'short', day: 'numeric' });
            
            output.innerHTML = `
                <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #fd7e14; text-align: left;">
                    <strong>🕒 ${data.results[0].name}, ${data.results[0].country}</strong><br>
                    <span style="font-size: 1.8rem; font-weight: bold; color: #fff; display: block; margin: 5px 0;">${timeString}</span>
                    📅 ${dateString}<br>
                    🌐 Time Zone: <code>${zone}</code>
                </div>
            `;
        }).catch(() => { output.innerText = "Time zone data missing for specified territory configuration."; });
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
        setAppInputMode('info', "Search topics, apps, or links...", newsBtn);
    };

    output.appendChild(img);
}

function runInfoExecution(query) {
    if (/^[0-9+\-*/().\s]+$/.test(query) || query.toLowerCase().includes("to")) {
        try {
            if (!query.toLowerCase().includes("to")) {
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

        if (query.toLowerCase().includes(" to ")) {
            const parts = query.split(/ to /i);
            const source = parts[0].trim();
            const targetLanguage = parts[1].trim();

            // Unit Converter Guard Block: Check for structural conversions before throwing strings to the language API
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

            output.innerText = `Processing processing translation loop...`;
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
                if (!dictData[key] || dictData[key].length === 0) {
                    throw new Error("No definition layout");
                }
                
                const definitionObj = dictData[key][0];
                const partOfSpeech = definitionObj.partOfSpeech;
                
                let rawDefinition = "";
                if (definitionObj.definitions && definitionObj.definitions.length > 0) {
                    rawDefinition = definitionObj.definitions[0].definition.replace(/<[^>]*>/g, '').trim();
                }
                
                if (!rawDefinition) {
                    rawDefinition = "No direct text definition available. Use the index link (the blue text saying 'Open Source' next to the text saying 'Wiktionary') on the bottom of the page to view the full dictionary entry.";
                }
                
                let infoHTML = `<div class="news-header-msg" style="color: #888; font-style: italic; margin-bottom: 12px; font-size: 0.9rem; line-height: 1.4;">I have provided the most relevant text of each information source related to "${query}".</div>`;
                infoHTML += `
                    <div class="aggregated-text" style="font-size: 0.95rem; color: #e0e0e0; line-height: 1.6; margin-bottom: 15px; background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">
                        <strong>${query.charAt(0).toUpperCase() + query.slice(1)}</strong> (${partOfSpeech.toLowerCase()}): ${rawDefinition}
                    </div>
                `;

                fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`)
                    .then(wikiRes => wikiRes.json())
                    .then(wikiSearchData => {
                        if (wikiSearchData.query.search && wikiSearchData.query.search.length > 0) {
                            let topPageTitle = wikiSearchData.query.search[0].title;
                            
                            if (wikiSearchData.query.search[1] && (topPageTitle.toLowerCase().includes("refer to") || wikiSearchData.query.search[0].snippet.toLowerCase().includes("may refer to"))) {
                                topPageTitle = wikiSearchData.query.search[1].title;
                            }
                            
                            fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topPageTitle.replace(/ /g, '_'))}`)
                                .then(summaryRes => summaryRes.json())
                                .then(summaryData => {
                                    let wikiText = summaryData.extract || "";
                                    
                                    if (summaryData.type === "disambiguation" || wikiText.toLowerCase().includes("may refer to")) {
                                        wikiText = "Multiple context records have been located. Browse the full article space using the search portal down below.";
                                    }
                                    
                                    if (wikiText) {
                                        infoHTML += `
                                            <div style="color: #888; font-style: italic; font-size: 0.85rem; margin: 15px 0 8px 0; text-align: left;">
                                                This might also be relevant:
                                            </div>
                                            <div class="aggregated-text" style="font-size: 0.95rem; color: #e0e0e0; line-height: 1.6; margin-bottom: 20px; background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #007bff; text-align: left;">
                                                <strong>${topPageTitle}:</strong> ${wikiText}
                                            </div>
                                        `;
                                    }
                                    
                                    infoHTML += `
                                        <div class="source-box" style="border-top: 1px solid #333; padding-top: 12px; margin-top: 10px;">
                                            <span style="display: block; font-size: 0.75rem; color: #777; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Sources Index</span>
                                            <div class="source-list" style="display: flex; flex-direction: column; gap: 6px;">
                                                <a href="https://en.wiktionary.org/wiki/${encodeURIComponent(query)}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;">
                                                    <span style="color: #aaa; font-weight: normal;">📰 Wiktionary</span>
                                                    <span>Open Source →</span>
                                                </a>
                                                <a href="${summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(topPageTitle)}`}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;">
                                                    <span style="color: #aaa; font-weight: normal;">📰 Wikipedia</span>
                                                    <span>Open Source →</span>
                                                </a>
                                            </div>
                                        </div>
                                    `;
                                    output.innerHTML = infoHTML;
                                });
                        } else {
                            appendWiktionaryOnlySources(query, infoHTML);
                        }
                    })
                    .catch(() => {
                        appendWiktionaryOnlySources(query, infoHTML);
                    });
            })
            .catch(() => {
                runWikipediaEngine(query);
            });
    } else {
        runWikipediaEngine(query);
    }
}

function appendWiktionaryOnlySources(query, baselineHTML) {
    baselineHTML += `
        <div class="source-box" style="border-top: 1px solid #333; padding-top: 12px; margin-top: 10px;">
            <span style="display: block; font-size: 0.75rem; color: #777; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Sources Index</span>
            <div class="source-list" style="display: flex; flex-direction: column;">
                <a href="https://en.wiktionary.org/wiki/${encodeURIComponent(query)}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;">
                    <span style="color: #aaa; font-weight: normal;">📰 Wiktionary</span>
                    <span>Open Source →</span>
                </a>
            </div>
        </div>
    `;
    output.innerHTML = baselineHTML;
}

function launchTargetUrl(url) {
    const isDiceRoll = output.innerHTML.includes("🎲");
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
    
    if (isDiceRoll) {
        output.innerHTML = `<div style="font-size:0.8rem; color:#888; margin-bottom:5px;">🎲 Random selection active</div>` + contentHTML;
    } else {
        output.innerHTML = contentHTML;
    }
    window.open(url, '_blank');
}

function runWikipediaEngine(query) {
    output.innerText = `Searching information for "${query}"...`;

    fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`)
        .then(res => res.json())
        .then(searchData => {
            if (!searchData.query.search || searchData.query.search.length === 0) {
                output.innerText = `Could not extract summary text for "${query}". Try a broader topic!`;
                return;
            }

            const results = searchData.query.search;
            const topPageTitle = results[0].title;

            fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topPageTitle.replace(/ /g, '_'))}`)
                .then(res => res.json())
                .then(summaryData => {
                    let infoText = summaryData.extract || "";
                    let showTitlePrefix = true;
                    let finalTitle = topPageTitle;
                    let articleUrl = summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(topPageTitle)}`;

                    if (summaryData.type === "disambiguation" || infoText.toLowerCase().includes("may refer to")) {
                        let snippets = [];
                        showTitlePrefix = false;
                        results.forEach((item) => {
                            let cleanSnippet = item.snippet.replace(/<[^>]*>/g, '').trim();
                            if (cleanSnippet.toLowerCase().includes("wiktionary") || cleanSnippet.toLowerCase().includes("refer to:") || cleanSnippet === "") {
                                return;
                            }
                            if (cleanSnippet && !cleanSnippet.endsWith('.')) {
                                cleanSnippet += "...";
                            }
                            if (snippets.length < 3) {
                                snippets.push(cleanSnippet);
                            }
                        });
                        infoText = snippets.join(" <span style='color: #444;'>|</span> ");
                        articleUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`;
                    }

                    if (!infoText) {
                        output.innerText = `No clear summary found for "${query}".`;
                        return;
                    }

                    let newsHTML = `<div class="news-header-msg" style="color: #888; font-style: italic; margin-bottom: 12px; font-size: 0.9rem; line-height: 1.4;">I have provided the most relevant text of each information source related to "${query}".</div>`;
                    let inlineContent = showTitlePrefix ? `<strong>${finalTitle}:</strong> ${infoText}` : infoText;

                    newsHTML += `
                        <div class="aggregated-text" style="font-size: 0.95rem; color: #e0e0e0; line-height: 1.6; margin-bottom: 20px; background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">
                            ${inlineContent}
                        </div>
                    `;

                    newsHTML += `
                        <div class="source-box" style="border-top: 1px solid #333; padding-top: 12px;">
                            <span style="display: block; font-size: 0.75rem; color: #777; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Sources Index</span>
                            <div class="source-list" style="display: flex; flex-direction: column;">
                                <a href="${articleUrl}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;">
                                    <span style="color: #aaa; font-weight: normal;">📰 Wikipedia</span>
                                    <span>Open Source →</span>
                                </a>
                            </div>
                        </div>
                    `;
                    output.innerHTML = newsHTML;
                });
        })
        .catch(err => {
            output.innerText = "Error pulling content summary.";
            console.error(err);
        });
}
