# ⚡ VAII
> **Virtual Assistant with Internet Integrations**

VAII is a lightweight, frontend-only web application designed to act as a localized, multi-modal smart assistant. Built entirely on vanilla JavaScript (ES6 Modules), HTML5, and CSS3, it bypasses the need for heavy backend frameworks by interacting directly with a matrix of REST APIs and Google Cloud services.

The architecture is divided into two distinct processing engines: **VAII Native** (for live, widget-based web integrations) and the **Gemini Ecosystem** (for persistent, text-based conversational memory).

---

## 🛠️ Core Engine Modes

### 1. VAII Native (Integration Mode)
The primary runtime chassis. This mode intercepts user queries and routes them to specific external APIs to render interactive HTML widgets directly in the DOM.

* **🧠 Knowledge Base:** Fetches live lexical definitions via the **Wiktionary API** and summary extracts via the **Wikipedia API**.
* **👁️ Vision Engine:** Processes user-uploaded Base64 image data using the **Gemini 3.5 Flash** model to provide detailed visual analysis.
* **🗺️ Interactive Maps:** Renders live, interactive embedded maps using the **Google Maps JavaScript API** based on location queries.
* **☀️ Weather & Time Telemetry:** Pulls real-time climate readings, wind speeds, and localized timezones using the **Open-Meteo Geocoding and Forecast APIs**.
* **🔴 Creator Metrics:** Fetches live subscriber and view counts for specific influencers utilizing the **YouTube Data API v3**.
* **🌐 Web Routing:** Parses domains and custom commands (e.g., `open youtube`) to securely trigger window redirections.
* **🔢 Native Calculator & Converter:** Processes raw arithmetic via strict JavaScript execution and handles metric/imperial unit conversions.
* **🗣️ Language Translation:** Routes semantic phrases through the **MyMemory Translation API**.
* **📈 Market Trackers:** Queries the **CoinGecko API** for real-time cryptocurrency values and 24-hour change metrics.
* **🎨 AI Art Generation:** Compiles custom visual graphics via **Pollinations AI** based on prompt descriptions.

### 2. Gemini Ecosystem (Conversational Mode)
A heavily restricted, isolated conversational layer. 
* **Persistent Memory:** Tracks dialogue history across multiple turns.
* **Fallback Matrix:** Utilizes a cascading fallback tree (Latest Gemini models to earliest then Gemma models) to ensure 100% uptime if a specific model hits rate limits.
* **Custom Persona:** Supports user-defined system instructions saved to local storage to alter the assistant's behavioral parameters.
* **Strict Isolation:** Explicitly blocked from accessing native integrations (weather, maps, etc.) to maintain a pure text-based environment.

---

## ⚠️ APK Compilation Warning

There is no officially distributed APK or public API key set for VAII. If developers attempt to compile their own local instance of VAII into a native Android APK using standard web-to-APK wrappers (such as AppsGeyser or basic Android WebViews), **the application will fail at the login screen.**

This is due to strict Google Cloud security policies (`Error 403: disallowed_useragent`). Google actively blocks OAuth sign-in flows from loading inside embedded WebViews to prevent potential keystroke interception. Therefore, the "Sign in with Google" functionality is incompatible with theoretical third-party APK wrappers.

---

## 🔑 Environment & Setup

To run this application locally, you must supply and configure the following API keys within `script.js`:

1.  **Firebase Config:** Initialize your project with your specific `apiKey`, `authDomain`, and `projectId`.
2.  **Google Maps API Key:** Required for spatial rendering.
3.  **Google Cloud / Gemini API Key:** Required for both the Vision Engine and the Gemini Ecosystem fallback tree.
4.  **YouTube Data API Key:** Required for live subscriber tracking.

*Note: Ensure your API keys are restricted via the Google Cloud Console to your specific authorized domains to prevent quota theft.*

---

## 📁 File Structure

The architecture is deliberately kept flat to ensure rapid load times and zero-build-step iterations:

* `index.html`: The monolithic UI layout, including CSS styling and all structural widget containers.
* `script.js`: The central logic controller, housing Firebase initialization, API fetch routing, DOM manipulation, and the Gemini chat engine.
