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

// NEWS BUTTON ACTION WITH DEDICATED SOURCE BOX SEPARATION
newsBtn.addEventListener('click', function() {
    const query = cityInput.value.trim();
    if (!query) {
        output.innerText = "Please type a topic or location for news.";
        return;
    }

    output.innerText = `Searching news for "${query}"...`;

    const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;

    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            if (!data.items || data.items.length === 0) {
                output.innerText = `No recent news articles found for "${query}".`;
                return;
            }

            let newsHTML = `<div class="news-header-msg" style="color: #888; font-style: italic; margin-bottom: 15px; font-size: 0.9rem; line-height: 1.4;">I have provided the most relevant text of each news article related to "${query}".</div>`;

            data.items.slice(0, 4).forEach(item => {
                // Extract clean description text
                let plainDescription = item.description.replace(/<[^>]*>/g, '').trim();
                
                // Smart parse: Cleanly strip the publication source name out of the raw text block if it duplicates the headline
                let cleanTitle = item.title;
                let sourceName = "News Source";

                // Google News format usually puts the source at the end of the title after a hyphen
                if (cleanTitle.includes(' - ')) {
                    const segments = cleanTitle.split(' - ');
                    sourceName = segments.pop().trim();
                    cleanTitle = segments.join(' - ').trim();
                }

                // If description contains the source text at the end, clean it up
                if (plainDescription.endsWith(sourceName)) {
                    plainDescription = plainDescription.substring(0, plainDescription.lastIndexOf(sourceName)).trim();
                }

                newsHTML += `
                    <div class="news-item" style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #333;">
                        <span class="news-title" style="color: #ffffff; font-weight: bold; display: block; margin-bottom: 6px; font-size: 1rem; line-height: 1.3;">${cleanTitle}</span>
                        <div class="news-desc" style="font-size: 0.88rem; color: #b3b3b3; margin-bottom: 8px; line-height: 1.4;">${plainDescription || 'No preview text summary found.'}</div>
                        
                        <!-- Tiny, separate box showing the actual article source link -->
                        <div class="source-container" style="display: flex; gap: 8px; align-items: center; margin-top: 6px;">
                            <span class="source-tag" style="background: #333; color: #aaa; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; font-weight: 500;">📰 ${sourceName}</span>
                            <a class="news-link" href="${item.link}" target="_blank" style="color: #4da3ff; text-decoration: none; font-size: 0.85rem; font-weight: bold;">Read Full Article →</a>
                        </div>
                    </div>
                `;
            });

            output.innerHTML = newsHTML;
        })
        .catch(err => {
            output.innerText = "Error loading news feed.";
            console.error(err);
        });
});
