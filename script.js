// array to hold quotes
let data = [];

// Fetch quotes from API
async function getQuotes() {
    const proxyURL = "https://api.allorigins.win/raw?url=";
    const apiURL = "https://firestore.googleapis.com/v1/projects/quote-6ab48/databases/(default)/documents/array";

    try {
        const response = await fetch(proxyURL + apiURL);
        data = await response.json();
        console.log(data);
        return data;
    }
    catch(error) {
        console.error("Error fetching quote:", error);
        throw error;
    }
}

// for displaying random quote
function displayRandomQuote() {
    if (data.documents && data.documents.length > 0) {
        let attempts = 0;
        const maxAttempts = 50; // Prevent infinite loop
        
        while (attempts < maxAttempts) {
            const randomIndex = Math.floor(Math.random() * data.documents.length);
            const randomQuote = data.documents[randomIndex];
            
            // Check if quote exists and is not empty
            const quote = randomQuote.fields.quote?.stringValue?.trim();
            const author = randomQuote.fields.author?.stringValue?.trim();
            
            // Skip if quote is missing or empty (we need at least a quote)
            if (!quote) {
                attempts++;
                continue;
            }
            
            // Display the quote
            const quoteElement = document.getElementById('quote-text');
            const authorElement = document.getElementById('author-text');
            const containerElement = document.getElementById('code-container');
            
            quoteElement.textContent = `"${quote}"`;
            
            // Display author if available, otherwise show "Unknown"
            if (author) {
                authorElement.textContent = `— ${author}`;
                authorElement.style.display = 'block';
            } else {
                authorElement.textContent = '— Unknown';
                authorElement.style.display = 'block';
            }
            
            // Handle quote length styling
            handleQuoteLength(quote, quoteElement, containerElement);
            
            break; // Successfully found and displayed a quote
        }
        
        if (attempts >= maxAttempts) {
            console.error("Could not find a valid quote after multiple attempts");
        }
    }
}

// Handle quote length styling
function handleQuoteLength(quote, quoteElement, containerElement) {
    // Remove existing length classes
    containerElement.classList.remove('short-quote', 'medium-quote', 'long-quote');
    quoteElement.classList.remove('short-quote', 'medium-quote', 'long-quote');
    
    const quoteLength = quote.length;
    
    if (quoteLength <= 50) {
        // Short quotes
        containerElement.classList.add('short-quote');
        quoteElement.classList.add('short-quote');
    } else if (quoteLength <= 150) {
        // Medium quotes
        containerElement.classList.add('medium-quote');
        quoteElement.classList.add('medium-quote');
    } else {
        // Long quotes
        containerElement.classList.add('long-quote');
        quoteElement.classList.add('long-quote');
    }
}

// onload
getQuotes().then(() => {
    // Display a random quote immediately after data is loaded
    displayRandomQuote();
});

// button event listner
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.button-container');
    button.addEventListener('click', displayRandomQuote);
});


