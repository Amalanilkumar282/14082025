// array to hold quotes
let data = [];

// Fetch quotes from API
async function getQuotes() {
    const proxyURL = "https://api.allorigins.win/raw?url=";
    const apiURL = "https://firestore.googleapis.com/v1/projects/quote-6ab48/databases/(default)/documents/array";
    try {
        const response = await fetch(proxyURL + apiURL);
        data = await response.json();
        return data;
    } catch(error) {
        console.error("Error fetching quote:", error);
        throw error;
    }
}

// Display random quote
function displayRandomQuote() {
    if (!data.documents?.length) return;
    
    let attempts = 0;
    while (attempts < 50) {
        const randomQuote = data.documents[Math.floor(Math.random() * data.documents.length)];
        const quote = randomQuote.fields.quote?.stringValue?.trim();
        const author = randomQuote.fields.author?.stringValue?.trim();
        
        if (!quote) {
            attempts++;
            continue;
        }
        
        document.getElementById('quote-text').textContent = `"${quote}"`;
        document.getElementById('author-text').textContent = `— ${author || 'Unknown'}`;
        
        // Handle quote length styling
        const container = document.getElementById('code-container');
        const quoteEl = document.getElementById('quote-text');
        container.classList.remove('short-quote', 'medium-quote', 'long-quote');
        quoteEl.classList.remove('short-quote', 'medium-quote', 'long-quote');
        
        const length = quote.length;
        const className = length <= 50 ? 'short-quote' : length <= 150 ? 'medium-quote' : 'long-quote';
        container.classList.add(className);
        quoteEl.classList.add(className);
        break;
    }
}

// LinkedIn share function
function shareToLinkedIn() {
    const quote = document.getElementById('quote-text').textContent.trim();
    const author = document.getElementById('author-text').textContent.trim();
    
    // Clean and format
    const cleanQuote = quote.startsWith('"') && quote.endsWith('"') ? quote.slice(1, -1) : quote;
    const cleanAuthor = author !== '— Unknown' ? author.replace(/^—\s*/, '').trim() : '';
    
    let text = `"${cleanQuote}"`;
    if (cleanAuthor) text += ` - ${cleanAuthor}`;
    text += ' #Motivation #Inspiration #Quotes';
    
    // Try LinkedIn URLs until one opens
    const urls = [
        `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`,
        `https://www.linkedin.com/feed/update/urn:li:share:compose/?text=${encodeURIComponent(text)}`,
        `https://www.linkedin.com/sharing/share-offsite/?summary=${encodeURIComponent(text)}`
    ];
    
    for (const url of urls) {
        if (window.open(url, 'linkedin-share', 'width=626,height=500')) break;
    }
}

// Initialize
getQuotes().then(displayRandomQuote);

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('new-quote-btn').addEventListener('click', displayRandomQuote);
    document.getElementById('linkedin-share-btn').addEventListener('click', shareToLinkedIn);
});
