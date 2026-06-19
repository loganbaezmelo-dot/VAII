const cityInput = document.getElementById('city-input');
const datalist = document.getElementById('city-suggestions');
const weatherBtn = document.getElementById('weather-btn');
const newsBtn = document.getElementById('news-btn');
const output = document.getElementById('weather-output');

let debounceTimer;

// Handle live autocomplete suggestions while typing
cityInput.addEventListener('input', function() {
    const query = cityInput.value.trim();
    
    if (query.length < 3) {
        datalist.innerHTML = "";
        return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`)
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
    const query = cityInput.value.trim();
    if (!query) {
        output.innerText = "Please type a topic or location.";
        return;
    }

    output.innerText = `Searching information for "${query}"...`;

    // Step 1: Search Wikipedia for the best matching page name
    fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`)
        .then(res => res.json())
        .then(searchData => {
            if (!searchData.query.search || searchData.query.search.length === 0) {
                output.innerText = `Could not extract summary text for "${query}". Try a broader topic!`;
                return;
            }

            const results = searchData.query.search;
            const topPageTitle = results[0].title;

            // Step 2: Grab the summary snippet from Wikipedia REST API
            fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topPageTitle.replace(/ /g, '_'))}`)
                .then(res => res.json())
                .then(summaryData => {
                    let infoText = summaryData.extract || "";
                    let finalTitle = topPageTitle;
                    let articleUrl = summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(topPageTitle)}`;

                    // If it hits a broad disambiguation directory page ("may refer to:"), switch dynamically to list snippets instead
                    if (summaryData.type === "disambiguation" || infoText.toLowerCase().includes("may refer to")) {
                        let snippets = [];
                        results.slice(0, 3).forEach((item) => {
                            let cleanSnippet = item.snippet.replace(/<[^>]*>/g, '').trim();
                            if (cleanSnippet && !cleanSnippet.endsWith('.')) {
                                cleanSnippet += "...";
                            }
                            if (cleanSnippet) {
                                snippets.push(cleanSnippet);
                            }
                        });
                        infoText = snippets.join(" | ");
                        finalTitle = `Search Results for "${query}"`;
                        articleUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`;
                    }

                    if (!infoText) {
                        output.innerText = `No clear summary found for "${query}".`;
                        return;
                    }

                    let newsHTML = `<div class="news-header-msg" style="color: #888; font-style: italic; margin-bottom: 12px; font-size: 0.9rem; line-height: 1.4;">I have provided the most relevant text of each information source related to "${query}".</div>`;
                    
                    newsHTML += `
                        <div class="aggregated-text" style="font-size: 0.95rem; color: #e0e0e0; line-height: 1.6; margin-bottom: 20px; background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">
                            <strong>${finalTitle}:</strong> ${infoText}
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
});
