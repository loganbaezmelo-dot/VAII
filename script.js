const cityInput = document.getElementById('city-input');
const datalist = document.getElementById('city-suggestions');
const weatherBtn = document.getElementById('weather-btn');
const newsBtn = document.getElementById('news-btn');
const output = document.getElementById('weather-output');

let debounceTimer;

// Handle live autocomplete suggestions and instant warnings while typing
cityInput.addEventListener('input', function() {
    const query = cityInput.value; // Keep original casing and spaces for checking
    const trimmedQuery = query.trim();
    
    // INSTANT WARNING LOOKUP: Triggers the moment "Open " is typed
    if (query.toLowerCase().startsWith('open ')) {
        datalist.innerHTML = ""; // Kill suggestions
        
        // Only show the warning if the output box isn't already showing a launch link
        if (!output.innerHTML.includes('Resolved Address:')) {
            output.innerHTML = `
                <div style="color: #ffa500; font-size: 0.85rem; font-style: italic; line-height: 1.4; text-align: left; padding: 4px;">
                    ⚠️ Website routing is not 100% accurate because the AI cannot scrape live websites. Keep typing the app name...
                </div>
            `;
        }
        return;
    }

    if (trimmedQuery.length < 3) {
        datalist.innerHTML = "";
        return;
    }

    // Skip geocoding lookups completely if the user is typing an internet link
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

// WEATHER BUTTON ACTION
weatherBtn.addEventListener('click', function() {
    const fullInput = cityInput.value.trim();
    if (!fullInput) {
        output.innerText = "Please type a location first.";
        return;
    }
    
    output.innerText = "Searching coordinates...";

    const options = Array.from(datalist.options);
    const matchedOption = options.find(opt => opt.value === fullInput);

    if (matchedOption) {
        const lat = matchedOption.getAttribute('data-lat');
        const lon = matchedOption.getAttribute('data-lon');
        getWeatherData(lat, lon, fullInput);
    } else {
        const searchCity = fullInput.split(',')[0].trim();
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCity)}&count=1&language=en&format=json`)
            .then(res => res.json())
            .then(geoData => {
                if (!geoData.results || geoData.results.length === 0) {
                    output.innerText = "Location not found.";
                    return;
                }
                const loc = geoData.results[0];
                getWeatherData(loc.latitude, loc.longitude, fullInput);
            })
            .catch(err => {
                output.innerText = "Error fetching location.";
                console.error(err);
            });
    }
});

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
        })
        .catch(err => {
            output.innerText = "Error fetching live weather data.";
            console.error(err);
        });
}

// INFO BUTTON ACTION
newsBtn.addEventListener('click', function() {
    let query = cityInput.value.trim();
    if (!query) {
        output.innerText = "Please type a topic, location, or website URL.";
        return;
    }

    // 1. SMART COMMAND DETECTOR WITH RANDOM SUBDOMAIN ROUTING ("Open ...")
    if (query.toLowerCase().startsWith("open ")) {
        let appName = query.substring(5).trim().toLowerCase().replace(/['"]+/g, '');
        
        if (!appName) {
            output.innerText = "Please specify what you want to open.";
            return;
        }

        output.innerText = `Resolving routing for "${appName}"...`;

        // RANDOM SHUFFLE & EXPLICIT OVERRIDES
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

    // 2. LINK PASSTHROUGH ROUTER
    const isUrlPattern = /\.[a-z]{2,6}/i.test(query);
    const hasProtocol = query.startsWith('http://') || query.startsWith('https://');

    if (hasProtocol || isUrlPattern) {
        let targetUrl = query;
        if (!hasProtocol) {
            targetUrl = 'https://' + query;
        }
        launchTargetUrl(targetUrl);
        return;
    }

    // 3. DICTIONARY CHECKER FOR SINGLE WORDS
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
});

// SHARED UTILITY TO RENDER LAUNCH INTERFACE AND OPEN LINK
function launchTargetUrl(url) {
    const appendBox = document.createElement('div');
    appendBox.innerHTML = `
        <div class="news-header-msg" style="color: #888; font-style: italic; margin-bottom: 4px; font-size: 0.9rem; line-height: 1.4;">Navigating to external web link...</div>
        <div style="color: #ffa500; font-size: 0.78rem; font-style: italic; margin-bottom: 12px; line-height: 1.3;">⚠️ Website routing is not 100% accurate because the AI cannot scrape live websites.</div>
        <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #007bff; text-align: left; margin-bottom: 15px;">
            🔗 <strong>Resolved Address:</strong> <span style="color: #4da3ff; word-break: break-all;">${url}</span>
        </div>
        <a href="${url}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #007bff; border-radius: 6px; padding: 10px 14px; color: white; text-decoration: none; font-weight: bold; font-size: 0.95rem;">
            <span>Launch Link</span>
            <span>Open Site ↗</span>
        </a>
    `;
    
    if(output.innerHTML.includes("🎲")) {
        output.innerHTML = output.innerHTML + appendBox.innerHTML;
    } else {
        output.innerHTML = appendBox.innerHTML;
    }
    
    window.open(url, '_blank');
}

// CORE WIKIPEDIA SNIPPET & SUMMARY LOGIC CONTAINER
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
                            if (
                                cleanSnippet.toLowerCase().includes("wiktionary") || 
                                cleanSnippet.toLowerCase().includes("refer to:") ||
                                cleanSnippet === ""
                            ) {
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
