// array to hold quotes
let data = [];

// Fetch quotes from API
async function getQuote() {
    const proxyURL = "https://api.allorigins.win/raw?url=";
    const apiURL = "https://firestore.googleapis.com/v1/projects/quote-6ab48/databases/(default)/documents/array";

    try {
        const response = await fetch(proxyURL + apiURL);
        data = await response.json();
        console.log(data);
    }
    catch(error) {
        console.error("Error fetching quote:", error);
    }
}

// for displaying random quote
function displayRandomQuote() {
    if (data.documents && data.documents.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.documents.length);
        const randomQuote = data.documents[randomIndex];
        
        const quote = randomQuote.fields.quote.stringValue;
        const author = randomQuote.fields.author.stringValue;
        
        document.getElementById('quote-text').textContent = quote;
        document.getElementById('author-text').textContent = author;
    }
}

// onload
getQuote();

// button event listner
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.button-container');
    button.addEventListener('click', displayRandomQuote);
});


