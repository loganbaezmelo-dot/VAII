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

// Initialize instances inside our primary module lifecycle context
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// AUTH CONTROL NODES
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

// SYSTEM APP WORKSPACE NODES
const cityInput = document.getElementById('city-input');
const weatherBtn = document.getElementById('weather-btn');
const newsBtn = document.getElementById('news-btn');
const drawBtn = document.getElementById('draw-btn');
const executeActionBtn = document.getElementById('execute-action-btn');
const output = document.getElementById('weather-output');
const routingWarning = document.getElementById('routing-warning');
const helpToggle = document.getElementById('help-toggle');
const helpGuide = document.getElementById('help-guide');

let isLoginMode = true;
let debounceTimer;

// Global tracking variable for current function context ('weather', 'info', or 'draw')
let currentMode = 'info'; 

// Coordinates tracking cache for weather queries
let selectedLatitude = null;
let selectedLongitude = null;

// Helper to smoothly recalibrate styling and placeholders on context shift
function setAppInputMode(newMode, placeholderText, activeBtn) {
    currentMode = newMode;
    
    if (cityInput) {
        cityInput.placeholder = placeholderText;
        cityInput.className = ""; 
        cityInput.classList.add(`mode-${newMode}`);
        cityInput.value = ""; // Empty string on context jump
    }

    selectedLatitude = null;
    selectedLongitude = null;

    // Manage button tab highlights cleanly
    document.querySelectorAll('.mode-select').forEach(btn => btn.classList.remove('active'));
    if (activeBtn) activeBtn.classList.add('active');
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
        setAppInputMode('info', "Search topic, open apps,\nor enter URL address...", newsBtn);
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
        authSubmitBtn.style.background = "#007bff";
        authToggle.innerText = "Need an account? Register instead";
    } else {
        authTitle.innerText = "✨ Create Account";
        authSubmitBtn.innerText = "Register App User";
        authSubmitBtn.style.background = "#28a745";
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
        signInWithEmailAndPassword(auth, email, password)
            .catch(err => showAuthError(err.message));
    } else {
        createUserWithEmailAndPassword(auth, email, password)
            .catch(err => showAuthError(err.message));
    }
});

googleSigninBtn.addEventListener('click', () => {
    authError.style.display = "none";
    signInWithPopup(auth, googleProvider)
        .catch(err => showAuthError(err.message));
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

// Shortened context strings splitting lines cleanly inside the box using \n
weatherBtn.addEventListener('click', function() {
    setAppInputMode('weather', "Type global location name;\nFetch meteorology metrics...", weatherBtn);
});

newsBtn.addEventListener('click', function() {
    setAppInputMode('info', "Search topic, open apps,\nor enter URL address...", newsBtn);
});

drawBtn.addEventListener('click', function() {
    setAppInputMode('draw', "Describe artwork scene concept;\nAssemble AI image render...", drawBtn);
});

cityInput.addEventListener('input', function() {
    const query = cityInput.value; 
    
    if (query.toLowerCase().startsWith('open ')) {
        routingWarning.style.display = "block"; 
    } else {
        routingWarning.style.display = "none";
    }
});

// Master Execution Dispatcher: Fired solely by clicking the custom Enter arrow button
if (executeActionBtn) {
    executeActionBtn.addEventListener('click', function() {
        const query = cityInput.value.trim();
        if (!query) {
            output.innerText = "Please input a term or prompt value first.";
            return;
        }

        if (currentMode === 'weather') {
            runWeatherExecution(query);
        } else if (currentMode === 'draw') {
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

// Keyboard Passthrough matching textarea key code maps
cityInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevents a literal newline from typing into textarea
        if (executeActionBtn) executeActionBtn.click();
    }
});

// ----------------------------------------------------
// ROUTED TARGET SYSTEMS
// ----------------------------------------------------
function runWeatherExecution(searchCity) {
    routingWarning.style.display = "none"; 
    output.innerText = "Searching coordinates...";

    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCity)}&count=1&language=en&format=json`)
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
            setAppInputMode('info', "Search topic, open apps,\nor enter URL address...", newsBtn);
        })
        .catch(err => {
            output.innerText = "Error fetching live weather data.";
            console.error(err);
        });
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
        setAppInputMode('info', "Search topic, open apps,\nor enter URL address...", newsBtn);
    };

    output.appendChild(img);
}

function runInfoExecution(query) {
    if (query.toLowerCase().startsWith("draw ")) {
        let imagePrompt = query.substring(5).trim();
        if (!imagePrompt) {
            output.innerText = "Please specify what you want to draw.";
            return;
        }
        executeImageGeneration(imagePrompt);
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
            "google gemini": ["https://gemini.google.com", "https://gemini.com"],
            "google deepmind": ["https://deepmind.google/"],
            "deepmind": ["https://deepmind.google/"],
            "youtube music": ["https://music.youtube.com", "https://youtube.com/music"],
            "minecraft": ["https://minecraft.net"],
            "wikipedia": ["https://wikipedia.org"]
        };

        if (randomizedRoutes[appName]) {
            const routesList = randomizedRoutes[appName];
            const randomChoice = routesList[Math.floor(Math.random() * routesList.length)];
            output.innerHTML = `<div style="font-size:0.8rem; color:#888; margin-bottom:5px;">🎲 Random selection active (${routesList.length} choices found)</div>`;
            launchTargetUrl(randomChoice);
            return;
        }

        let safeDomainName = appName.replace(/\s+/g, '');
        const domainExtensions = ["com", "org", "net", "co"];
        let testUrls = domainExtensions.map(ext => `https://${safeDomainName}.${ext}`);

        let tryFetchVariant = (index) => {
            if (index >= testUrls.length) {
                launchTargetUrl(`https://${safeDomainName}.com`);
                return;
            }

            let targetTest = testUrls[index];
            fetch(targetTest, { mode: 'no-cors' })
                .then(() => {
                    launchTargetUrl(targetTest);
                })
                .catch(() => {
                    tryFetchVariant(index + 1);
                });
        };

        tryFetchVariant(0);
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
                let rawDefinition = definitionObj.definitions[0].definition.replace(/<[^>]*>/g, '').trim();
                
                let infoHTML = `<div class="news-header-msg" style="color: #888; font-style: italic; margin-bottom: 12px; font-size: 0.9rem; line-height: 1.4;">I have provided the most relevant text of each information source related to "${query}".</div>`;
                infoHTML += `
                    <div class="aggregated-text" style="font-size: 0.95rem; color: #e0e0e0; line-height: 1.6; margin-bottom: 20px; background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">
                        <strong>${query.charAt(0).toUpperCase() + query.slice(1)}</strong> (${partOfSpeech.toLowerCase()}): ${rawDefinition}
                    </div>
                `;

                infoHTML += `
                    <div class="source-box" style="border-top: 1px solid #333; padding-top: 12px;">
                        <span style="display: block; font-size: 0.75rem; color: #777; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Sources Index</span>
                        <div class="source-list" style="display: flex; flex-direction: column;">
                            <a href="https://en.wiktionary.org/wiki/${encodeURIComponent(query)}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;">
                                <span style="color: #aaa; font-weight: normal;">📰 Wiktionary</span>
                                <span>Open Source →</span>
                            </a>
                        </div>
                    </div>
                `;
                output.innerHTML = infoHTML;
            })
            .catch(() => {
                runWikipediaEngine(query);
            });
    } else {
        runWikipediaEngine(query);
    }
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
