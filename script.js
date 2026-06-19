cat << 'EOF' > script.js
document.getElementById('weather-btn').addEventListener('click', function() {
    const city = document.getElementById('city-input').value;
    const output = document.getElementById('weather-output');
    
    output.innerText = "Fetching live data...";
    
    // Hit the open web service directly from the browser
    fetch(`https://wttr.in/${city}?format=3`)
        .then(response => response.text())
        .then(data => {
            output.innerText = data.trim();
        })
        .catch(err => {
            output.innerText = "Error connecting to service.";
        });
});
EOF
