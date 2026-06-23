import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ==========================================
// 1. CONFIG & KEYS
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

const GOOGLE_API_KEY = "AIzaSyAJ" + "KTkU0nd6" + "ZB_zjIcN" + "QCAQQsff" + "HEp4WH8";
const GEMINI_VISION_KEY = "AQ.Ab8RN" + "6JH2s8Lpq" + "PfRqjRgs" + "OgOMy2f76" + "HU4b4Xmg_CYURTOmgJQ";

const BASELINE_FALLBACK_TREE = [
    { name: "Gemini 3.5", id: "gemini-3.5-flash" },
    { name: "Gemini 3.1", id: "gemini-3.1-flash" },
    { name: "Gemini 3", id: "gemini-3-flash" },
    { name: "Gemini 2.5", id: "gemini-2.5-flash" },
    { name: "Gemini 2", id: "gemini-2-flash" },
    { name: "Gemma 4 31B", id: "gemma-4-31b" },
    { name: "Gemma 4 26B", id: "gemma-4-26b" }
];

const LOCAL_FOOD_DB = {
    "burger": [
        { name: "Wendy's", item: "Baconator with fries" },
        { name: "Five Guys", item: "Bacon Cheeseburger with Cajun Fries" },
        { name: "Shake Shack", item: "ShackBurger and a milkshake" },
        { name: "In-N-Out Burger", item: "Double-Double Animal Style" },
        { name: "McDonald's", item: "Big Mac meal" },
        { name: "Burger King", item: "Whopper with cheese" },
        { name: "Smashburger", item: "Classic Double Smash" },
        { name: "Whataburger", item: "Patty Melt" },
        { name: "Carl's Jr", item: "Western Bacon Cheeseburger" },
        { name: "Hardee's", item: "Monster Thickburger" },
        { name: "Culver's", item: "ButterBurger Cheese" },
        { name: "Steak 'n Shake", item: "Original Double 'n Cheese" },
        { name: "Jack in the Box", item: "Ultimate Cheeseburger" },
        { name: "Dairy Queen", item: "FlameThrower GrillBurger" },
        { name: "Sonic Drive-In", item: "SuperSONIC Double Cheeseburger" }
    ],
    "fries": [
        { name: "Five Guys", item: "Large Cajun Fries" },
        { name: "McDonald's", item: "Large World Famous Fries" },
        { name: "Wendy's", item: "Baconator Fries" },
        { name: "Checkers", item: "Fully Loaded Fries" },
        { name: "Rally's", item: "Famous Seasoned Fries" },
        { name: "Arby's", item: "Curly Fries" },
        { name: "Chick-fil-A", item: "Waffle Potato Fries" },
        { name: "Shake Shack", item: "Cheese Fries" },
        { name: "Steak 'n Shake", item: "Cheese 'n Bacon Fries" },
        { name: "Taco Bell", item: "Nacho Fries" }
    ],
    "pizza": [
        { name: "Domino's Pizza", item: "ExtravaganZZa Specialty Pizza" },
        { name: "Pizza Hut", item: "Meat Lover's Pan Pizza" },
        { name: "Papa John's", item: "The Works Pizza" },
        { name: "Little Caesars", item: "Hot-N-Ready Pepperoni" },
        { name: "Papa Murphy's", item: "Cowboy Take 'N' Bake" },
        { name: "Marco's Pizza", item: "Pepperoni Magnifico" },
        { name: "Jet's Pizza", item: "Detroit-Style Deep Dish" },
        { name: "Blaze Pizza", item: "Build Your Own Artisanal Pizza" },
        { name: "MOD Pizza", item: "Mad Dog Pizza" },
        { name: "California Pizza Kitchen", item: "Original BBQ Chicken Pizza" },
        { name: "Mellow Mushroom", item: "Holy Shiitake Pie" },
        { name: "Cici's", item: "Mac & Cheese Pizza" },
        { name: "Sbarro", item: "XL NY Style Pepperoni Slice" },
        { name: "Hungry Howie's", item: "Flavored Crust Pizza" },
        { name: "Godfather's Pizza", item: "Classic Combo" }
    ],
    "chicken": [
        { name: "Chick-fil-A", item: "Spicy Chicken Sandwich" },
        { name: "Popeyes", item: "Classic Chicken Sandwich" },
        { name: "KFC", item: "Famous Bowl" },
        { name: "Church's Chicken", item: "Spicy Bone-In Chicken" },
        { name: "Bojangles", item: "Cajun Chicken Filet Biscuit" },
        { name: "Zaxby's", item: "Chicken Finger Plate" },
        { name: "Raising Cane's", item: "The Box Combo" },
        { name: "El Pollo Loco", item: "Fire-Grilled Chicken Meal" },
        { name: "Wingstop", item: "Lemon Pepper Wings" },
        { name: "Buffalo Wild Wings", item: "Honey BBQ Boneless Wings" },
        { name: "Jollibee", item: "Chickenjoy" },
        { name: "PDQ", item: "Crispy Chicken Tenders" }
    ],
    "mexican": [
        { name: "Taco Bell", item: "Crunchwrap Supreme" },
        { name: "Chipotle", item: "Steak Burrito Bowl" },
        { name: "Qdoba", item: "3-Cheese Queso Burrito" },
        { name: "Moe's Southwest Grill", item: "Homewrecker Burrito" },
        { name: "Del Taco", item: "The Del Taco" },
        { name: "Baja Fresh", item: "Baja Burrito" },
        { name: "Taco John's", item: "Potato Olés" },
        { name: "Torchy's Tacos", item: "Trailer Park Taco" },
        { name: "On The Border", item: "Fajitas" },
        { name: "Chuy's", item: "Chick-a-Chuy Chimi" },
        { name: "Fuzzy's Taco Shop", item: "Baja Tacos" }
    ],
    "sandwich": [
        { name: "Subway", item: "Italian B.M.T." },
        { name: "Jersey Mike's", item: "Original Italian" },
        { name: "Jimmy John's", item: "Vito Sub" },
        { name: "Firehouse Subs", item: "Hook & Ladder" },
        { name: "Panera Bread", item: "Bacon Turkey Bravo" },
        { name: "Quiznos", item: "Classic Italian" },
        { name: "Potbelly", item: "A Wreck Sandwich" },
        { name: "Schlotzsky's", item: "The Original" },
        { name: "Jason's Deli", item: "Muffaletta" },
        { name: "McAlister's Deli", item: "McAlister's Club" },
        { name: "Arby's", item: "Classic Roast Beef" },
        { name: "Penn Station", item: "Philly Cheesesteak" },
        { name: "Which Wich", item: "The Wicked" }
    ],
    "coffee": [
        { name: "Starbucks", item: "Caramel Macchiato" },
        { name: "Dunkin'", item: "Iced Coffee with Hazelnut" },
        { name: "Peet's Coffee", item: "Major Dickason's Blend" },
        { name: "Dutch Bros", item: "Golden Eagle" },
        { name: "Caribou Coffee", item: "Campfire Mocha" },
        { name: "Tim Hortons", item: "Iced Capp" },
        { name: "The Coffee Bean", item: "Ice Blended Drink" },
        { name: "Biggby Coffee", item: "Caramel Marvel" },
        { name: "Scooter's Coffee", item: "Caramelicious" },
        { name: "Philz Coffee", item: "Mint Mojito Iced Coffee" }
    ],
    "ice cream": [
        { name: "Baskin-Robbins", item: "Mint Chocolate Chip" },
        { name: "Dairy Queen", item: "Oreo Blizzard" },
        { name: "Cold Stone Creamery", item: "Founder's Favorite" },
        { name: "Ben & Jerry's", item: "Half Baked" },
        { name: "Haagen-Dazs", item: "Dulce de Leche Dazzler" },
        { name: "Rita's", item: "Mango Gelati" },
        { name: "Culver's", item: "Turtle Sundae" },
        { name: "Braum's", item: "Premium Ice Cream Cone" },
        { name: "Bruster's", item: "Waffle Cone" },
        { name: "Marble Slab", item: "Sweet Cream with Mix-ins" }
    ],
    "donuts": [
        { name: "Dunkin'", item: "Boston Kreme Donut" },
        { name: "Krispy Kreme", item: "Original Glazed" },
        { name: "Tim Hortons", item: "Timbits" },
        { name: "Shipley Do-Nuts", item: "Glazed Do-Nut" },
        { name: "Voodoo Doughnut", item: "Bacon Maple Bar" },
        { name: "Duck Donuts", item: "Bacon in the Sun" },
        { name: "Stan's Donuts", item: "Biscoff Banana Pocket" }
    ],
    "breakfast": [
        { name: "IHOP", item: "Rooty Tooty Fresh 'N Fruity" },
        { name: "Denny's", item: "Grand Slam" },
        { name: "Waffle House", item: "All-Star Special" },
        { name: "Cracker Barrel", item: "Momma's Pancake Breakfast" },
        { name: "First Watch", item: "Million Dollar Bacon" },
        { name: "Bob Evans", item: "Farmer's Choice" },
        { name: "Village Inn", item: "Lumberjack Breakfast" },
        { name: "Perkins", item: "Tremendous Twelve" },
        { name: "Snooze", item: "Pineapple Upside Down Pancakes" },
        { name: "The Original Pancake House", item: "Apple Pancake" }
    ],
    "asian": [
        { name: "Panda Express", item: "Orange Chicken with Chow Mein" },
        { name: "P.F. Chang's", item: "Lettuce Wraps" },
        { name: "Pei Wei", item: "Kung Pao Chicken" },
        { name: "Yoshinoya", item: "Gyudon Beef Bowl" },
        { name: "Sarku Japan", item: "Chicken Teriyaki" },
        { name: "Genghis Grill", item: "Build Your Own Bowl" },
        { name: "Kona Grill", item: "Macadamia Nut Chicken" },
        { name: "Benihana", item: "Hibachi Steak" },
        { name: "Sushi-San", item: "Spicy Tuna Roll" },
        { name: "Nobu", item: "Black Cod Miso" }
    ],
    "seafood": [
        { name: "Red Lobster", item: "Cheddar Bay Biscuits & Shrimp" },
        { name: "Long John Silver's", item: "Fish & Chicken Platter" },
        { name: "Captain D's", item: "Deluxe Seafood Platter" },
        { name: "Bonefish Grill", item: "Bang Bang Shrimp" },
        { name: "Joe's Crab Shack", item: "Crab Bucket" },
        { name: "Bubba Gump Shrimp", item: "Dumb Luck Coconut Shrimp" },
        { name: "McCormick & Schmick's", item: "Fresh Catch" },
        { name: "Legal Sea Foods", item: "New England Clam Chowder" }
    ],
    "steakhouse": [
        { name: "Outback Steakhouse", item: "Bloomin' Onion & Sirloin" },
        { name: "Texas Roadhouse", item: "Bone-In Ribeye with Rolls" },
        { name: "LongHorn Steakhouse", item: "Flo's Filet" },
        { name: "Ruth's Chris", item: "Petite Filet" },
        { name: "Capital Grille", item: "Dry Aged NY Strip" },
        { name: "Fogo de Chao", item: "Full Churrasco Experience" },
        { name: "Black Angus", item: "Campfire Feast" },
        { name: "Morton's", item: "Center-Cut Filet Mignon" },
        { name: "Saltgrass", item: "Pat's Ribeye" },
        { name: "Fleming's", item: "Prime Tomahawk" }
    ],
    "italian": [
        { name: "Olive Garden", item: "Tour of Italy" },
        { name: "Carrabba's", item: "Chicken Bryan" },
        { name: "Maggiano's", item: "Rigatoni D" },
        { name: "Macaroni Grill", item: "Penne Rustica" },
        { name: "Fazoli's", item: "Baked Ziti" },
        { name: "Buca di Beppo", item: "Spaghetti with Meatballs" },
        { name: "Old Spaghetti Factory", item: "Mizithra Cheese & Browned Butter" },
        { name: "Carbone", item: "Spicy Rigatoni Vodka" }
    ]
};

// Pre-compile the suggestions array for instant datalist rendering
const ALL_FOOD_SUGGESTIONS = [];
Object.keys(LOCAL_FOOD_DB).forEach(cat => ALL_FOOD_SUGGESTIONS.push(`Order ${cat}`));
Object.values(LOCAL_FOOD_DB).flat().forEach(b => {
    ALL_FOOD_SUGGESTIONS.push(`Order from ${b.name}`);
    ALL_FOOD_SUGGESTIONS.push(`Order ${b.item.toLowerCase()} from ${b.name}`);
});

// ==========================================
// 2. DOM & STATE
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
const historyToggle = document.getElementById('history-toggle');
const historyDrawer = document.getElementById('history-drawer');
const historyList = document.getElementById('history-list');
const newChatBtn = document.getElementById('new-chat-btn');

const prefsToggleBtn = document.getElementById('prefs-toggle-btn');
const prefsDrawer = document.getElementById('prefs-drawer');
const prefsCloseBtn = document.getElementById('prefs-close-btn');
const prefsInstructionsInput = document.getElementById('prefs-instructions-input');
const prefsSaveBtn = document.getElementById('prefs-save-btn');

const cameraTriggerBtn = document.getElementById('camera-trigger-btn');
const imageFileInput = document.getElementById('image-file-input');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreviewThumbnail = document.getElementById('image-preview-thumbnail');
const imagePreviewFilename = document.getElementById('image-preview-filename');
const imageClearBtn = document.getElementById('image-clear-btn');

let debounceTimer;
let searchAbortController = null;
let activeImageBase64 = null; 
let activeImageMimeType = null;
const wikitubiaCache = new Set();

let chatHistory = [];
let currentSessionId = null;

const welcomeVaiiText = `Welcome to VAII Native! Enter a search query, app routing command, calculation sequence, weather location, translation phrase, crypto ticker, map request, or art prompt to begin...`;
const welcomeGeminiText = `Welcome to the Gemini Ecosystem! This is a persistent conversational space. Start typing below to begin a continuous chat thread...`;

const defaultAssistantSuggestions = [
    "Open Gemini", "193 lbs to kg", "Open YouTube", "BTC", "Time in Tokyo", 
    "Hello to Spanish", "Open Minecraft", "(12 * 4) / 2", "Map of Orlando", 
    "Draw a neon cyberpunk switch console artwork"
];

window.initVaiiMap = function() {
    console.log("Maps system ready.");
};

// ==========================================
// 3. UTILS & RENDERERS
// ==========================================
function renderMarkdown(text) {
    if (!text) return "";
    let safeHtml = text.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">"); 
    safeHtml = safeHtml.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    safeHtml = safeHtml.replace(/\*(.*?)\*/g, "<em>$1</em>");
    safeHtml = safeHtml.replace(/^[\s]*[\*\-]\s+(.*)$/gm, "<li style='margin-left: 15px; margin-bottom: 4px;'>$1</li>");
    safeHtml = safeHtml.replace(/\n/g, "<br>");
    return safeHtml;
}

function updateWelcomeMessageText() {
    if (!output) return;
    const selectedMode = document.querySelector('input[name="vaii-mode"]:checked')?.value;
    output.innerHTML = (selectedMode === "gemini") ? welcomeGeminiText : welcomeVaiiText;
}

function getSavedSessions() {
    try {
        return JSON.parse(localStorage.getItem('vaii_chat_sessions')) || [];
    } catch (e) {
        return [];
    }
}

function saveSessionsToDisk(sessions) {
    localStorage.setItem('vaii_chat_sessions', JSON.stringify(sessions));
}

function saveCurrentSessionState(customGeneratedTitle = null) {
    if (chatHistory.length <= 2) return; 
    let sessions = getSavedSessions();
    let currentSession = sessions.find(s => s.id === currentSessionId);
    
    if (!currentSessionId) {
        currentSessionId = 'session_' + Date.now();
        let fallbackTitle = "Gemini Chat Thread";
        if (chatHistory[2] && chatHistory[2].role === 'user') {
            fallbackTitle = chatHistory[2].parts[0].text.substring(0, 25) + "...";
        }
        currentSession = { id: currentSessionId, title: customGeneratedTitle || fallbackTitle, history: chatHistory };
        sessions.unshift(currentSession);
    } else if (currentSession) {
        currentSession.history = chatHistory;
        if (customGeneratedTitle) {
            currentSession.title = customGeneratedTitle;
        }
    }
    saveSessionsToDisk(sessions);
    renderHistoryListItems();
}

function renderHistoryListItems() {
    if (!historyList) return;
    historyList.innerHTML = "";
    let sessions = getSavedSessions();
    
    if (sessions.length === 0) {
        historyList.innerHTML = `<div style="color: #666; font-size: 0.8rem; font-style: italic; text-align: center; padding: 8px 0;">No saved conversational tracks.</div>`;
        return;
    }
    
    sessions.forEach(session => {
        const row = document.createElement('div');
        row.style = "display: flex; justify-content: space-between; align-items: center; background: #1a1a1a; border: 1px solid #2d2d2d; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: background 0.15s ease; margin-bottom: 4px;";
        row.onmouseenter = () => row.style.background = "#222";
        row.onmouseleave = () => row.style.background = "#1a1a1a";
        
        const textWrapper = document.createElement('span');
        textWrapper.innerText = session.title;
        textWrapper.style = "flex: 1; font-size: 0.82rem; color: #ddd; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; margin-right: 8px;";
        
        textWrapper.addEventListener('click', () => {
            currentSessionId = session.id;
            chatHistory = session.history;
            renderFullChatLogBubble();
            const modeToggleInput = document.querySelector('input[name="vaii-mode"][value="gemini"]');
            if (modeToggleInput) modeToggleInput.checked = true;
            if (historyDrawer) historyDrawer.style.display = "none";
            if (historyToggle) historyToggle.innerText = "📜";
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.innerText = "🗑️";
        deleteButton.style = "background: none; border: none; color: #dc3545; cursor: pointer; padding: 2px 6px; font-size: 0.85rem; transition: opacity 0.15s;";
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            let updatedList = getSavedSessions().filter(s => s.id !== session.id);
            saveSessionsToDisk(updatedList);
            if (currentSessionId === session.id) {
                initializeFreshChatSession();
            }
            renderHistoryListItems();
        });
        
        row.appendChild(textWrapper);
        row.appendChild(deleteButton);
        historyList.appendChild(row);
    });
}

function initializeFreshChatSession() {
    currentSessionId = null;
    chatHistory = [];
    updateWelcomeMessageText(); 
}

function renderFullChatLogBubble() {
    if (!output) return;
    output.innerHTML = "";
    
    let dialogueItems = chatHistory.filter(msg => {
        let textStr = msg.parts[0].text;
        return !textStr.includes("proprietary features belong exclusively") && !textStr.includes("System connection established");
    });
    
    if (dialogueItems.length === 0) {
        output.innerHTML = welcomeGeminiText;
        return;
    }
    
    dialogueItems.forEach(msg => {
        const isUserTurn = (msg.role === 'user');
        const bubble = document.createElement('div');
        bubble.style = isUserTurn 
            ? "background: #2a2a2a; padding: 10px 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left; margin-bottom: 10px;"
            : "background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #6f42c1; text-align: left; margin-bottom: 10px;";
            
        let footerMetadataLabel = (!isUserTurn && msg.activeModelName) 
            ? `<div style="font-size: 0.68rem; color: #555; border-top: 1px solid #222; margin-top: 8px; padding-top: 4px; font-style: italic;">Running on this model: "${msg.activeModelName}"</div>` 
            : "";

        bubble.innerHTML = `
            <div style="font-size: 0.72rem; color: #888; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">
                ${isUserTurn ? '👤 You' : '✨ Gemini Ecosystem'}
            </div>
            <div style="color: #eee; font-size: 0.95rem; line-height: 1.5;">${renderMarkdown(msg.parts[0].text)}</div>
            ${footerMetadataLabel}
        `;
        output.appendChild(bubble);
    });
    output.scrollTop = output.scrollHeight;
}

function updateDatalist(cities = [], wikiTitles = [], wikitubiaTitles = [], foodSuggestions = []) {
    if (!datalist) return;
    datalist.innerHTML = "";
    
    foodSuggestions.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        datalist.appendChild(option);
    });

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
        let parts = [];
        if (location.name) parts.push(location.name);
        if (location.admin1 && !parts.includes(location.admin1)) parts.push(location.admin1);
        if (location.country && !parts.includes(location.country)) parts.push(location.country);

        option.value = parts.join(', ');
        option.setAttribute('data-lat', location.latitude);
        option.setAttribute('data-lon', location.longitude);
        option.setAttribute('data-tz', location.timezone);
        datalist.appendChild(option);
    });
}

function handleVaiiDataOutput(rawTextContent, defaultHtmlOutput, runMapCallback = null) {
    output.innerHTML = defaultHtmlOutput;
    if (runMapCallback) runMapCallback();
}

function showAuthError(message) {
    if (authError) {
        authError.innerText = message.replace("Firebase: ", "");
        authError.style.display = "block";
    }
}

function clearActiveImage() {
    activeImageBase64 = null;
    activeImageMimeType = null;
    if (imageFileInput) imageFileInput.value = "";
    if (imagePreviewThumbnail) imagePreviewThumbnail.src = "";
    if (imagePreviewContainer) imagePreviewContainer.style.display = "none";
    if (cameraTriggerBtn) cameraTriggerBtn.classList.remove('active');
}

// ==========================================
// 4. CHAT ENGINE (GEMINI FALLBACK LOOP)
// ==========================================
async function executeGeminiDirectChat(userInput) {
    if (chatHistory.length === 0) {
        const localInstructions = localStorage.getItem('vaii_gemini_instructions') || '';
        let systemPrompt = "You are Gemini, an advanced conversational core running inside the VAII architecture frame. STRICT STRUCTURAL RULE: You do NOT possess built-in web services, maps, currency handlers, weather telemetry, or drawing capabilities. All of those proprietary features belong exclusively to a completely separate system engine option on this dashboard named 'VAII Native'. Your singular purpose here is providing deep, persistent multi-turn conversational reasoning and textual chat history records. Keep statements direct and clear.";
        
        if (localInstructions.trim()) {
            systemPrompt += `\n\n[USER SYSTEM INSTRUCTIONS / REQUIRED PERSONALITY PARAMETERS]:\n${localInstructions.trim()}`;
        }

        chatHistory.push({ role: "user", parts: [{ text: systemPrompt }] });
        chatHistory.push({ role: "model", parts: [{ text: "System connection established. Isolated chat parameters synced. I am fully aware of my persona guidelines and that I do not contain VAII Native utilities." }] });
    }

    chatHistory.push({ role: "user", parts: [{ text: userInput }] });
    renderFullChatLogBubble();

    const spinnerBubble = document.createElement('div');
    spinnerBubble.id = "gemini-active-typing-indicator";
    spinnerBubble.style = "text-align: left; padding: 10px; color: #aaa; font-style: italic; display: flex; align-items: center;";
    spinnerBubble.innerHTML = `<div class="loader-spinner"></div> Syncing conversational context vectors...`;
    output.appendChild(spinnerBubble);
    output.scrollTop = output.scrollHeight;

    const sanitizedContents = chatHistory.map(msg => ({
        role: msg.role || "user",
        parts: (msg.parts || []).map(p => ({ text: p.text || "" }))
    }));

    let successfulResponseText = null;
    let successfulModelLabel = "";
    let structuralErrorDetected = null;

    for (let i = 0; i < BASELINE_FALLBACK_TREE.length; i++) {
        const modelObj = BASELINE_FALLBACK_TREE[i];
        const visionUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelObj.id}:generateContent?key=${GEMINI_VISION_KEY}`;
        
        try {
            const response = await fetch(visionUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: sanitizedContents })
            });
            const data = await response.json();

            if (data.error) {
                if (response.status === 400 || data.error.status === "INVALID_ARGUMENT") {
                    structuralErrorDetected = data.error.message;
                    break; 
                }
                console.warn(`Model generation tier [${modelObj.name}] quota full. Cascading downstream...`);
                continue; 
            }

            if (!data.candidates || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0].text) {
                continue;
            }

            successfulResponseText = data.candidates[0].content.parts[0].text;
            successfulModelLabel = modelObj.name;
            break; 
        } catch (err) {
            console.error(`Network exception on model asset [${modelObj.name}]:`, err);
            continue;
        }
    }

    const indicatorNode = document.getElementById("gemini-active-typing-indicator");
    if (indicatorNode) indicatorNode.remove();

    if (structuralErrorDetected) {
        const errorDiv = document.createElement('div');
        errorDiv.style = "background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left; margin-bottom: 10px;";
        errorDiv.innerHTML = `
            <div style="font-size: 0.75rem; color: #ff4d4d; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">⚠️ History Thread Structure Fault</div>
            <div style="color: #eee; font-size: 0.95rem; line-height: 1.5;">
                ${structuralErrorDetected}<br><br>
                <span style="color: #aaa; font-size: 0.85rem;">VAII automatically dropped your last submission entry to keep this specific session from breaking permanently.</span>
            </div>
        `;
        output.appendChild(errorDiv);
        chatHistory.pop(); 
        return;
    }

    if (successfulResponseText !== null) {
        chatHistory.push({ 
            role: "model", 
            parts: [{ text: successfulResponseText }],
            activeModelName: successfulModelLabel 
        });

        renderFullChatLogBubble();
        saveCurrentSessionState();

        if (chatHistory.length === 4) {
            triggerBackgroundTitleGeneration(chatHistory[2].parts[0].text, successfulResponseText, successfulModelLabel);
        }
    } else {
        const errorDiv = document.createElement('div');
        errorDiv.style = "background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left; margin-bottom: 10px;";
        errorDiv.innerHTML = `
            <div style="font-size: 0.75rem; color: #ff4d4d; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">🚨 Critical Server Outage Alert</div>
            <div style="color: #eee; font-size: 0.95rem; line-height: 1.5; font-weight: 500;">
                Every single fallback layer inside the model matrix has completely exhausted its rate-limit quotas. Please wait for token limits to clear.
            </div>
        `;
        output.appendChild(errorDiv);
        chatHistory.pop(); 
    }
}

async function triggerBackgroundTitleGeneration(userMsg, modelResponse, runningModelId) {
    const titlePrompt = `Generate a short, highly descriptive 3 to 5 word summary title for this chat based on these two statements. Respond with ONLY the clean summary text directly, no intro text, no markdown styling markers, and no outer quotation characters.\n\nUser text: "${userMsg}"\nModel text: "${modelResponse}"`;
    const payloadContents = [{ role: "user", parts: [{ text: titlePrompt }] }];
    const activeModel = BASELINE_FALLBACK_TREE.find(m => m.name === runningModelId) || BASELINE_FALLBACK_TREE[0];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel.id}:generateContent?key=${GEMINI_VISION_KEY}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: payloadContents })
        });
        const data = await response.json();
        let cleanedTitle = data.candidates[0].content.parts[0].text.trim().replace(/['"]+/g, ''); 
        if (cleanedTitle && cleanedTitle.length > 2) {
            saveCurrentSessionState(cleanedTitle);
        }
    } catch (e) {
        console.error("Dynamic title loop exception:", e);
    }
}

// ==========================================
// 5. NATIVE MODULES (MAPS, WEATHER, VISION, FOOD)
// ==========================================
function executeLocalFoodSearch(queryText) {
    routingWarning.style.display = "none";
    
    let originalQuery = queryText.trim();
    let cleanQuery = originalQuery.toLowerCase();
    let explicitLocation = "";
    
    // Extract manual location routing (e.g. " in Orlando", " near Miami")
    const locInMatch = originalQuery.match(/\s+in\s+(.+)$/i);
    const locNearMatch = originalQuery.match(/\s+near\s+(.+)$/i);
    
    if (locInMatch) {
        explicitLocation = locInMatch[1].trim();
        cleanQuery = originalQuery.substring(0, locInMatch.index).toLowerCase().trim();
    } else if (locNearMatch) {
        explicitLocation = locNearMatch[1].trim();
        cleanQuery = originalQuery.substring(0, locNearMatch.index).toLowerCase().trim();
    }

    let dbMatch = null;
    let searchBrandName = "";
    let searchItemName = "";

    // 1. Check for specific brand mention FIRST to prevent random category jumping
    for (let cat in LOCAL_FOOD_DB) {
        let brand = LOCAL_FOOD_DB[cat].find(b => {
            let normName = b.name.toLowerCase().replace(/['\s]/g, '');
            let normQuery = cleanQuery.replace(/['\s]/g, '');
            return normQuery.includes(normName);
        });
        if (brand) {
            dbMatch = brand;
            searchBrandName = dbMatch.name;
            searchItemName = dbMatch.item;
            break;
        }
    }

    // 2. If no specific brand was mentioned, look for a generic category
    if (!dbMatch) {
        let category = Object.keys(LOCAL_FOOD_DB).find(key => cleanQuery.includes(key));
        if (category) {
            const options = LOCAL_FOOD_DB[category];
            dbMatch = options[Math.floor(Math.random() * options.length)];
            searchBrandName = dbMatch.name;
            searchItemName = dbMatch.item;
        }
    }

    // 3. Fallback if absolutely no matches
    if (!searchBrandName) {
        searchBrandName = cleanQuery; 
        searchItemName = cleanQuery;
    }

    let placesSearchQuery = searchBrandName;
    if (explicitLocation) {
        placesSearchQuery += ` in ${explicitLocation}`;
    }

    output.innerHTML = `
        <div class="generation-status">
            <div class="loader-spinner"></div>
            <span style="color: #eee; font-size: 0.9rem;">Processing order request for "${searchItemName}"...</span>
        </div>
    `;

    // Renders if GPS fails or no results match the radius parameters
    const renderFallbackCard = (brandName, suggestionText, fallbackLoc) => {
        // Strip out weird characters to prevent search engine breaks
        const cleanName = brandName.replace(/[^a-zA-Z0-9\s]/g, '');
        const encName = encodeURIComponent(cleanName);
        const encLoc = fallbackLoc ? encodeURIComponent(fallbackLoc) : '';
        
        const ddLink = `https://www.doordash.com/search/store/${encName}/`;
        const goLink = `https://www.google.com/search?q=Order+delivery+from+${encName}${fallbackLoc ? '+near+' + encLoc : ''}`;

        const htmlOutput = `
            <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #007bff; text-align: left; margin-bottom: 15px;">
                <div style="font-size: 0.8rem; color: #007bff; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">🍔 VAII Database Suggestion</div>
                <div style="font-size: 1.2rem; font-weight: bold; color: #fff; margin-bottom: 8px;">${brandName}</div>
                <div style="color: #ccc; font-size: 0.95rem; margin-bottom: 15px;">💡 Suggested: <strong>${suggestionText || queryText}</strong> ${fallbackLoc ? 'near ' + fallbackLoc : ''}</div>
                
                <div style="font-size: 0.75rem; color: #aaa; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">Auto-Routing Delivery Links</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <a href="${ddLink}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #FF3008; border-radius: 6px; padding: 10px 14px; color: #fff; text-decoration: none; font-weight: bold; font-size: 0.9rem;">
                        <span>Route to DoorDash</span><span>➔</span>
                    </a>
                    <a href="${goLink}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #4285F4; border-radius: 6px; padding: 10px 14px; color: #fff; text-decoration: none; font-weight: bold; font-size: 0.9rem;">
                        <span>Google Local Order</span><span>➔</span>
                    </a>
                </div>
            </div>
        `;
        handleVaiiDataOutput("", htmlOutput);
    };

    const processPlacesSearch = (lat, lon) => {
        if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
            return renderFallbackCard(searchBrandName, searchItemName, explicitLocation);
        }

        const request = { query: placesSearchQuery };
        if (lat && lon) {
            request.location = new google.maps.LatLng(lat, lon);
            request.radius = '16000';
        }

        const service = new google.maps.places.PlacesService(document.createElement('div'));
        
        service.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                const bestPlace = results[0];
                
                const placeName = bestPlace.name;
                const rating = bestPlace.rating || "N/A";
                const address = bestPlace.formatted_address || "";
                
                // Embed clean brand name for DoorDash to prevent address string formatting 404 breaks
                const cleanPlaceName = placeName.replace(/[^a-zA-Z0-9\s]/g, '');
                const encPlace = encodeURIComponent(cleanPlaceName);
                
                const doorDashLink = `https://www.doordash.com/search/store/${encPlace}/`;
                const googleOrderLink = `https://www.google.com/search?q=Order+delivery+from+${encPlace}`;
                const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName + " " + address)}`;

                let suggestionHTML = dbMatch ? `<div style="color: #ccc; font-size: 0.95rem; margin-bottom: 4px;">💡 Suggested: <strong>${searchItemName}</strong></div>` : "";

                const htmlOutput = `
                    <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #ff9800; text-align: left; margin-bottom: 15px;">
                        <div style="font-size: 0.8rem; color: #ff9800; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">🍔 GPS Confirmed Match</div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: #fff; margin-bottom: 8px;">${placeName}</div>
                        ${suggestionHTML}
                        <div style="color: #ccc; font-size: 0.95rem; margin-bottom: 4px;">⭐ Rating: ${rating} / 5.0</div>
                        <a href="${mapLink}" target="_blank" style="color: #ff9800; text-decoration: none; font-size: 0.85rem; display: block; margin-bottom: 15px;">📍 ${address} ↗</a>
                        
                        <div style="font-size: 0.75rem; color: #aaa; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">Auto-Routing Delivery Links</div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <a href="${doorDashLink}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #FF3008; border-radius: 6px; padding: 10px 14px; color: #fff; text-decoration: none; font-weight: bold; font-size: 0.9rem;">
                                <span>Route to DoorDash</span><span>➔</span>
                            </a>
                            <a href="${googleOrderLink}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #4285F4; border-radius: 6px; padding: 10px 14px; color: #fff; text-decoration: none; font-weight: bold; font-size: 0.9rem;">
                                <span>Google Local Order</span><span>➔</span>
                            </a>
                        </div>
                    </div>
                `;
                handleVaiiDataOutput("", htmlOutput);
            } else {
                return renderFallbackCard(searchBrandName, searchItemName, explicitLocation);
            }
        });
    };

    if (explicitLocation) {
        processPlacesSearch(null, null); // bypass GPS if manual location is specified
    } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => { processPlacesSearch(position.coords.latitude, position.coords.longitude); },
            () => { processPlacesSearch(null, null); }
        );
    } else {
        processPlacesSearch(null, null);
    }
}

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
            
            const htmlOutput = greetingHTML + `
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
            
            handleVaiiDataOutput("", htmlOutput, () => {
                if (typeof google !== 'undefined' && google.maps) {
                    const mapCoordinates = { lat: parseFloat(lat), lng: parseFloat(lon) };
                    const loadedMapInstance = new google.maps.Map(document.getElementById('vaii-merged-map-canvas'), {
                        center: mapCoordinates, zoom: 12, disableDefaultUI: false,
                        styles: [
                            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }
                        ]
                    });
                    new google.maps.Marker({ position: mapCoordinates, map: loadedMapInstance, title: displayName });
                }
            });
        })
        .catch(err => {
            handleVaiiDataOutput("", "<div>Error pulling metrics for spatial location.</div>");
            console.error(err);
        });
}

function executeVisionAnalysis(promptText) {
    output.innerHTML = `
        <div class="generation-status">
            <div class="loader-spinner"></div>
            <span style="color: #eee; font-size: 0.9rem;">VAII vision engine is processing image parameters...</span>
        </div>
    `;

    const payload = {
        contents: [{
            parts: [
                { text: promptText },
                { inlineData: { mimeType: activeImageMimeType || "image/jpeg", data: activeImageBase64 } }
            ]
        }]
    };

    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_VISION_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            output.innerHTML = `
                <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">
                    <div style="font-size: 0.75rem; color: #ff4d4d; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">⚠️ Google API Error</div>
                    <div style="color: #eee; font-size: 0.95rem; line-height: 1.5;">${data.error.message}</div>
                </div>
            `;
            return;
        }
        const descriptionResult = data.candidates[0].content.parts[0].text;
        output.innerHTML = `
            <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #007bff; text-align: left;">
                <div style="font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; margin-bottom: 8px; letter-spacing: 0.5px;">👁️ Image Analysis Output</div>
                <div style="color: #eee; font-size: 0.95rem; line-height: 1.5; white-space: pre-wrap;">${descriptionResult}</div>
            </div>
        `;
        clearActiveImage();
    }).catch(err => {
        output.innerText = "Network intercept error connecting to Google vision matrices.";
        console.error(err);
    });
}

function runMarketExecution(ticker) {
    output.innerText = `Fetching price updates for "${ticker.toUpperCase()}"...`;
    const cleanTicker = ticker.trim().toLowerCase();
    const cryptoMap = { btc: "bitcoin", eth: "ethereum", solana: "solana" };

    if (cryptoMap[cleanTicker]) {
        fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoMap[cleanTicker]}&vs_currencies=usd&include_24hr_change=true`)
            .then(res => res.json())
            .then(data => {
                const coinData = data[cryptoMap[cleanTicker]];
                const price = coinData.usd;
                const change = coinData.usd_24h_change.toFixed(2);
                const htmlOutput = `
                    <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #6f42c1; text-align: left;">
                        <strong>🪙 ${cryptoMap[cleanTicker].toUpperCase()} (${ticker.toUpperCase()})</strong><br>
                        💰 Price: $${price.toLocaleString()} USD<br>
                        ${change >= 0 ? "📈" : "📉"} 24h Change: ${change}%
                    </div>
                `;
                handleVaiiDataOutput("", htmlOutput);
            }).catch(() => { handleVaiiDataOutput("", "<div>Error pulling crypto ticker data.</div>"); });
    } else {
        const htmlOutput = `
            <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #6f42c1; text-align: left;">
                <strong>📈 Stock Ticker: ${ticker.toUpperCase()}</strong><br>
                <span style="color: #aaa; font-size: 0.9rem;">To view deep market assets, open the link directly:</span>
                <a href="https://finance.yahoo.com/quote/${ticker.toUpperCase()}" target="_blank">Open Yahoo Finance ↗</a>
            </div>
        `;
        handleVaiiDataOutput("", htmlOutput);
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
        document.getElementById("image-loader")?.remove();
        img.style.display = "block";
    };
    output.appendChild(img);
}

function launchTargetUrl(url) {
    routingWarning.style.display = "block"; 
    const htmlOutput = `
        <div class="news-header-msg" style="color: #888; font-style: italic; margin-bottom: 4px; font-size: 0.9rem; line-height: 1.4;">Navigating to external web link...</div>
        <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #007bff; text-align: left; margin-bottom: 15px;">
            🔗 <strong>Address:</strong> <span style="color: #4da3ff; word-break: break-all;">${url}</span>
        </div>
        <a href="${url}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #007bff; border-radius: 6px; padding: 10px 14px; color: white; text-decoration: none; font-weight: bold; font-size: 0.95rem;">
            <span>Launch Link</span>
            <span>Open Site ↗</span>
        </a>
    `;
    output.innerHTML = htmlOutput;
    window.open(url, '_blank');
}

// ==========================================
// 6. ROUTING LOGIC (VAII NATIVE)
// ==========================================
function runInfoExecution(query) {
    const cleanQuery = query.toLowerCase().trim();
    const cryptoMap = { btc: "bitcoin", eth: "ethereum", solana: "solana" };
    const greetingsList = ["hello", "hi", "hey", "sup", "yo", "greetings"];
    let greetingHTML = "";

    if (greetingsList.includes(cleanQuery)) {
        greetingHTML = `
            <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #17a2b8; text-align: left; margin-bottom: 15px;">
                👋 <strong>Assistant:</strong><br><span>Hello! How can I help you today? System initialized.</span>
            </div>
        `;
    }

    if (cleanQuery.includes("calendar") || cleanQuery.includes("calender") || cleanQuery.includes("schedule") || cleanQuery === "agenda" || cleanQuery.includes("email") || cleanQuery.includes("gmail") || cleanQuery.includes("inbox")) {
        const htmlLayout = greetingHTML + `
            <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">
                ⚠️ <strong>Workspace Elements Disabled:</strong><br><br>
                <span style="color: #aaa; font-size: 0.9rem;">Private calendar and email protocols remain inactive to preserve a standard authorization route.</span>
            </div>
        `;
        handleVaiiDataOutput("", htmlLayout);
        return; 
    }

    let isFoodIntent = Object.keys(LOCAL_FOOD_DB).some(cat => cleanQuery.includes(cat)) || 
                       cleanQuery.startsWith("order ") || cleanQuery.startsWith("find ");

    if (isFoodIntent) {
        let foodItem = query.replace(/order me a /i, "")
            .replace(/order a /i, "")
            .replace(/order some /i, "")
            .replace(/order /i, "")
            .replace(/find /i, "")
            .trim();
        executeLocalFoodSearch(foodItem);
        return;
    }

    const isLocationIntent = cleanQuery.startsWith("map of ") || cleanQuery.startsWith("show map ") || cleanQuery.startsWith("time in ") || cleanQuery.startsWith("weather in ") || cleanQuery.startsWith("weather ") || cleanQuery.startsWith("clock ");

    if (isLocationIntent) {
        let parsedLocation = query.replace(/map of /i, "").replace(/show map /i, "").replace(/time in /i, "").replace(/weather in /i, "").replace(/weather /i, "").replace(/clock /i, "").trim();
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(parsedLocation)}&count=1&language=en&format=json`)
            .then(res => res.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    const loc = data.results[0];
                    renderUnifiedLocationCard(loc.latitude, loc.longitude, loc.timezone, `${loc.name}, ${loc.admin1 || ''} (${loc.country})`, greetingHTML);
                } else {
                    handleVaiiDataOutput("", `<div>Could not extract metrics for "${parsedLocation}".</div>`);
                }
            }).catch(() => { handleVaiiDataOutput("", "<div>Location processing engine connection failure.</div>"); });
        return;
    }

    const options = Array.from(datalist.options);
    const matchedOption = options.find(opt => opt.value.toLowerCase() === cleanQuery);
    if (matchedOption && matchedOption.getAttribute('data-lat')) {
        renderUnifiedLocationCard(matchedOption.getAttribute('data-lat'), matchedOption.getAttribute('data-lon'), matchedOption.getAttribute('data-tz'), matchedOption.value, greetingHTML);
        return;
    }

    if (query.toLowerCase().startsWith("open ")) {
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
        launchTargetUrl(query.startsWith('http') ? query : 'https://' + query);
        return;
    }

    if (cryptoMap[cleanQuery] || cleanQuery.startsWith("price of ")) {
        runMarketExecution(cleanQuery.startsWith("price of ") ? cleanQuery.substring(9).trim() : cleanQuery);
        return;
    }

    if (/^[0-9+\-*/().\s]+$/.test(query) || cleanQuery.includes(" to ")) {
        try {
            if (!cleanQuery.includes(" to ")) {
                const result = Function(`"use strict"; return (${query})`)();
                const htmlOutput = `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">🔢 <strong>Calculation:</strong><br><span style="font-size: 1.3rem; font-weight: bold;">${query} = ${result}</span></div>`;
                handleVaiiDataOutput("", htmlOutput);
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
                    const htmlOutput = `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">🔄 <strong>Conversion:</strong><br>📤 Result: <strong style="color: #28a745; font-size: 1.3rem; display:block; margin-top:4px;">${conversionResult}</strong></div>`;
                    handleVaiiDataOutput("", htmlOutput);
                    return;
                }
            }
            fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(source)}&langpair=en|${encodeURIComponent(targetLanguage.substring(0,2))}`)
                .then(res => res.json())
                .then(data => {
                    const transText = data.responseData.translatedText;
                    const htmlOutput = `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #4da3ff; text-align: left;">🗣️ <strong>Translation:</strong><br>📤 Result: <strong style="color: #4da3ff; font-size: 1.1rem; display:block; margin-top:4px;">"${transText}"</strong></div>`;
                    handleVaiiDataOutput("", htmlOutput);
                }).catch(() => { handleVaiiDataOutput("", "<div>Translation engine network failure.</div>"); });
            return;
        }
    }

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
                runUnifiedWikiPipeline(query, { greeting: greetingHTML });
            });
    } else {
        runUnifiedWikiPipeline(query, { greeting: greetingHTML });
    }
}

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
        handleVaiiDataOutput("", totalHTML + `<div>No matches found for "${query}".</div>`);
        return;
    }
    
    totalHTML += `<div class="news-header-msg" style="color: #888; font-style: italic; margin-bottom: 12px; font-size: 0.9rem; line-height: 1.4;">I have provided the most relevant text of each information source related to "${query}".</div>`;
    totalHTML += blocksHtml.join(`<div style="color: #888; font-style: italic; font-size: 0.85rem; margin: 15px 0 8px 0; text-align: left;">This might also be relevant:</div>`);

    totalHTML += `<div class="source-box" style="border-top: 1px solid #333; padding-top: 12px; margin-top: 15px;"><span style="display: block; font-size: 0.75rem; color: #777; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Sources Index</span><div class="source-list" style="display: flex; flex-direction: column; gap: 6px;">`;

    if (wikiData.wiktionary) {
        totalHTML += `<a href="https://en.wiktionary.org/wiki/${encodeURIComponent(query)}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;"><span style="color: #aaa; font-weight: normal;">📰 Wiktionary</span><span>Open Source →</span></a>`;
    }
    if (wikiData.youtube) {
        const channelPath = wikiData.youtube.customUrl ? wikiData.youtube.customUrl : `@channel`;
        totalHTML += `<a href="https://www.youtube.com/${channelPath}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #ff4444; text-decoration: none; font-size: 0.82rem; font-weight: bold;"><span style="color: #aaa; font-weight: normal;">🔴 YouTube Channel</span><span>Live Metrics →</span></a>`;
    }
    if (wikiData.wikipedia) {
        totalHTML += `<a href="https://en.wikipedia.org/wiki/${encodeURIComponent(wikiData.wikipedia.title)}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;"><span style="color: #aaa; font-weight: normal;">📰 Wikipedia</span><span>Open Source →</span></a>`;
    }
    totalHTML += `</div></div>`;
    handleVaiiDataOutput("", totalHTML);
}

// ==========================================
// 7. EVENT LISTENERS
// ==========================================
document.querySelectorAll('input[name="vaii-mode"]').forEach(r => r.addEventListener('change', updateWelcomeMessageText));

prefsToggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    prefsDrawer.style.display = (prefsDrawer.style.display === "block") ? "none" : "block";
    if (prefsDrawer.style.display === "block") {
        prefsInstructionsInput.value = localStorage.getItem('vaii_gemini_instructions') || '';
        if (helpGuide) helpGuide.style.display = "none";
        if (historyDrawer) historyDrawer.style.display = "none";
    }
});

prefsSaveBtn?.addEventListener('click', () => {
    localStorage.setItem('vaii_gemini_instructions', prefsInstructionsInput.value.trim());
    prefsDrawer.style.display = "none";
    initializeFreshChatSession();
});

helpToggle?.addEventListener('click', () => {
    helpGuide.style.display = (helpGuide.style.display === "block") ? "none" : "block";
    if (historyDrawer) historyDrawer.style.display = "none";
    if (prefsDrawer) prefsDrawer.style.display = "none";
});

historyToggle?.addEventListener('click', () => {
    historyDrawer.style.display = (historyDrawer.style.display === "block") ? "none" : "block";
    if (historyDrawer.style.display === "block") renderHistoryListItems();
    if (helpGuide) helpGuide.style.display = "none";
    if (prefsDrawer) prefsDrawer.style.display = "none";
});

newChatBtn?.addEventListener('click', () => {
    initializeFreshChatSession();
    if (historyDrawer) historyDrawer.style.display = "none";
});

cameraTriggerBtn?.addEventListener('click', () => {
    imageFileInput?.click();
});

imageFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const dataUrl = event.target.result;
        const [mimeData, base64Data] = dataUrl.split(',');
        
        activeImageMimeType = mimeData.split(':')[1].split(';')[0];
        activeImageBase64 = base64Data;

        imagePreviewThumbnail.src = dataUrl;
        imagePreviewFilename.innerText = file.name;
        imagePreviewContainer.style.display = "flex";
        cameraTriggerBtn.classList.add('active');
    };
    reader.readAsDataURL(file);
});

imageClearBtn?.addEventListener('click', () => {
    clearActiveImage();
});

hubInput?.addEventListener('input', () => {
    const query = hubInput.value; 
    const trimmedQuery = query.trim();
    if (routingWarning) routingWarning.style.display = trimmedQuery.toLowerCase().startsWith('open ') ? "block" : "none";

    let foodSuggestions = [];
    let cleanInput = trimmedQuery.toLowerCase();
    
    if (/^(o|or|ord|orde|order|f|fi|fin|find)/i.test(cleanInput)) {
        let searchTarget = cleanInput.replace(/^(order|find)\s+/i, '').trim();
        if (searchTarget.length > 0) {
            foodSuggestions = ALL_FOOD_SUGGESTIONS.filter(s => s.toLowerCase().includes(searchTarget)).slice(0, 12);
        } else {
            foodSuggestions = ALL_FOOD_SUGGESTIONS.slice(0, 12);
        }
    }

    if (searchAbortController) searchAbortController.abort();
    if (trimmedQuery.length < 3 || trimmedQuery.toLowerCase().startsWith('open ') || /\.[a-z]{2,6}/i.test(trimmedQuery)) {
        updateDatalist([], [], [], foodSuggestions); 
        clearTimeout(debounceTimer); 
        return; 
    }

    let searchUrlQuery = trimmedQuery.replace(/map of |show map |weather in |time in /i, "").trim();
    searchUrlQuery = searchUrlQuery.replace(/order me a |order a |order some |order | near me|find /i, "").trim();

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        searchAbortController = new AbortController();
        const signal = searchAbortController.signal;

        const geoFetch = fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchUrlQuery)}&count=3&language=en&format=json`, { signal })
            .then(res => res.json()).then(data => data.results || []).catch(() => []);
        const wikiFetch = fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchUrlQuery)}&utf8=&format=json&origin=*`, { signal })
            .then(res => res.json()).then(data => data.query?.search?.map(item => item.title) || []).catch(() => []);
        const wikitubiaFetch = fetch(`https://youtube.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchUrlQuery)}&utf8=&format=json&origin=*`, { signal })
            .then(res => res.json()).then(data => data.query?.search?.map(item => item.title) || []).catch(() => []);

        Promise.all([geoFetch, wikiFetch, wikitubiaFetch]).then(([cities, wikiTitles, wikitubiaTitles]) => {
            updateDatalist(cities, wikiTitles, wikitubiaTitles, foodSuggestions);
        }).catch(() => {});
    }, 300);
});

executeActionBtn?.addEventListener('click', () => {
    const query = hubInput.value.trim();
    const mode = document.querySelector('input[name="vaii-mode"]:checked').value;
    
    if (activeImageBase64) {
        executeVisionAnalysis(query || "Describe this image content in clear detail.");
        return;
    }
    if (!query) return;

    if (mode === "gemini") {
        executeGeminiDirectChat(query);
    } else {
        if (query.toLowerCase().startsWith("draw ")) {
            executeImageGeneration(query.substring(5).trim());
        } else {
            runInfoExecution(query);
        }
    }
});

hubInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') executeActionBtn?.click();
});

authToggle?.addEventListener('click', () => {
    const isLoginMode = (authSubmitBtn.innerText === "Log In");
    authError.style.display = "none";
    authTitle.innerText = isLoginMode ? "✨ Create Account" : "🔒 Account Sign In";
    authSubmitBtn.innerText = isLoginMode ? "Register User" : "Log In";
    authToggle.innerText = isLoginMode ? "Already have an account? Sign In" : "Need an account? Register instead";
});

authSubmitBtn?.addEventListener('click', () => {
    const email = authEmail.value.trim();
    const password = authPassword.value;
    const isLoginMode = (authSubmitBtn.innerText === "Log In");
    authError.style.display = "none";
    if (!email || !password) return showAuthError("Please fill out all credentials.");
    
    if (isLoginMode) signInWithEmailAndPassword(auth, email, password).catch(err => showAuthError(err.message));
    else createUserWithEmailAndPassword(auth, email, password).catch(err => showAuthError(err.message));
});

googleSigninBtn?.addEventListener('click', () => {
    authError.style.display = "none";
    signInWithPopup(auth, googleProvider).catch(err => showAuthError(err.message));
});

logoutActionBtn?.addEventListener('click', () => signOut(auth).catch(err => console.error(err)));

onAuthStateChanged(auth, (user) => {
    if (user) {
        authContainer.style.display = "none";
        mainApp.style.display = "block";
        initializeFreshChatSession();
        clearActiveImage();
        renderHistoryListItems();
        if (prefsInstructionsInput) prefsInstructionsInput.value = localStorage.getItem('vaii_gemini_instructions') || '';
        updateDatalist([], [], [], []);
    } else {
        authContainer.style.display = "block";
        mainApp.style.display = "none";
    }
});
