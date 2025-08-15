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

// button event listeners
document.addEventListener('DOMContentLoaded', () => {
    const newQuoteButton = document.getElementById('new-quote-btn');
    const linkedinShareButton = document.getElementById('linkedin-share-btn');
    
    // New quote button event listener
    newQuoteButton.addEventListener('click', displayRandomQuote);
    
    // LinkedIn share button event listener
    linkedinShareButton.addEventListener('click', shareToLinkedIn);
});

// Function to share current quote to LinkedIn
function shareToLinkedIn() {
    const shareButton = document.getElementById('linkedin-share-btn');
    
    try {
        // Add loading state
        shareButton.disabled = true;
        shareButton.classList.add('button-loading');
        const originalContent = shareButton.innerHTML;
        shareButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
        
        // Get current quote and author from the DOM
        const quoteElement = document.getElementById('quote-text');
        const authorElement = document.getElementById('author-text');
        
        if (!quoteElement || !authorElement) {
            throw new Error('Quote elements not found');
        }
        
        const currentQuote = quoteElement.textContent.trim();
        const currentAuthor = authorElement.textContent.trim();
        
        // Check if quote exists and is not empty
        if (!currentQuote || currentQuote === '""' || currentQuote.length <= 2) {
            throw new Error('No valid quote available');
        }
        
        // Format the text for LinkedIn post
        let shareText = formatQuoteForLinkedIn(currentQuote, currentAuthor);
        let urlText = formatQuoteForUrl(currentQuote, currentAuthor); // Simplified version for URLs
        
        // Create LinkedIn sharing URLs (multiple fallback options)
        const shareUrls = createLinkedInShareUrls(shareText, urlText);
        
        // Attempt to open LinkedIn sharing dialog
        setTimeout(() => {
            // Try different methods in order of likelihood to pre-fill content
            let shareWindow = openLinkedInShare(shareUrls.feed);
            
            if (!shareWindow) {
                shareWindow = openLinkedInShare(shareUrls.compose);
            }
            
            if (!shareWindow) {
                shareWindow = openLinkedInShare(shareUrls.primary);
            }
            
            if (!shareWindow) {
                shareWindow = openLinkedInShare(shareUrls.fallback);
            }
            
            if (shareWindow) {
                shareWindow.focus();
                logShareAttempt(currentQuote, currentAuthor);
                
                // Copy text to clipboard as backup
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(shareText).catch(() => {
                        console.log('Clipboard backup failed');
                    });
                }
                
                showShareSuccessWithInstructions(shareButton, originalContent, shareText);
            } else {
                // All methods failed - show copy option
                showShareFallback(shareText, shareButton, originalContent);
            }
        }, 500); // Small delay for better UX
        
    } catch (error) {
        console.error('Error sharing to LinkedIn:', error);
        showShareError(error.message, shareButton);
    }
}

// Helper function to format quote for LinkedIn
function formatQuoteForLinkedIn(quote, author) {
    // Clean up the quote (remove extra quotes if present)
    let cleanQuote = quote.trim();
    if (cleanQuote.startsWith('"') && cleanQuote.endsWith('"')) {
        cleanQuote = cleanQuote.slice(1, -1);
    }
    
    // Clean up author
    let cleanAuthor = '';
    if (author && author !== '— Unknown' && author !== '—' && author.trim() !== '') {
        cleanAuthor = author.replace(/^—\s*/, '').trim();
    }
    
    // Create engaging LinkedIn post with better formatting
    let shareText = `💡 "${cleanQuote}"`;
    
    if (cleanAuthor) {
        shareText += `\n\n— ${cleanAuthor}`;
    }
    
    // Add engaging content for LinkedIn
    shareText += `\n\n🚀 Sometimes we all need a little inspiration to keep pushing forward. What quote motivates you the most?`;
    shareText += `\n\n#Motivation #Inspiration #Quotes #Success #Mindset #PersonalGrowth #Leadership #Entrepreneurship`;
    
    return shareText;
}

// Alternative simplified formatting for URL parameters
function formatQuoteForUrl(quote, author) {
    let cleanQuote = quote.trim();
    if (cleanQuote.startsWith('"') && cleanQuote.endsWith('"')) {
        cleanQuote = cleanQuote.slice(1, -1);
    }
    
    let cleanAuthor = '';
    if (author && author !== '— Unknown' && author !== '—' && author.trim() !== '') {
        cleanAuthor = author.replace(/^—\s*/, '').trim();
    }
    
    let shareText = `"${cleanQuote}"`;
    if (cleanAuthor) {
        shareText += ` - ${cleanAuthor}`;
    }
    shareText += ` #Motivation #Inspiration #Quotes`;
    
    return shareText;
}

// Helper function to create LinkedIn share URLs
function createLinkedInShareUrls(shareText, urlText) {
    const currentUrl = encodeURIComponent(window.location.href);
    const encodedText = encodeURIComponent(shareText);
    const encodedUrlText = encodeURIComponent(urlText || shareText);
    const encodedTitle = encodeURIComponent('Daily Inspiration');
    
    // LinkedIn's current sharing methods - trying multiple approaches
    return {
        // Method 1: Direct compose URL (most likely to work)
        compose: `https://www.linkedin.com/feed/update/urn:li:share:compose/?text=${encodedUrlText}`,
        
        // Method 2: LinkedIn intent URL
        primary: `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}&summary=${encodedUrlText}`,
        
        // Method 3: Traditional shareArticle
        fallback: `https://www.linkedin.com/shareArticle?mini=true&url=${currentUrl}&title=${encodedTitle}&summary=${encodedUrlText}`,
        
        // Method 4: Direct feed with share parameters
        feed: `https://www.linkedin.com/feed/?shareActive=true&text=${encodedUrlText}`
    };
}

// Helper function to open LinkedIn share window
function openLinkedInShare(url) {
    const windowFeatures = 'width=626,height=500,toolbar=0,status=0,location=0,menubar=0,directories=0,scrollbars=1,resizable=1';
    return window.open(url, 'linkedin-share-dialog', windowFeatures);
}

// Helper function to log share attempts
function logShareAttempt(quote, author) {
    console.log('LinkedIn share initiated:', {
        quote: quote.substring(0, 50) + (quote.length > 50 ? '...' : ''),
        author: author,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent.substring(0, 50)
    });
}

// Helper function to show success feedback with instructions
function showShareSuccessWithInstructions(button, originalContent, shareText) {
    button.disabled = false;
    button.classList.remove('button-loading');
    button.classList.add('success');
    button.innerHTML = '<i class="fas fa-check"></i> LinkedIn Opened!';
    
    // Show helpful message
    setTimeout(() => {
        alert('📱 LinkedIn opened successfully!\n\n' +
              '💡 If the quote didn\'t auto-fill:\n' +
              '1️⃣ It\'s been copied to your clipboard\n' +
              '2️⃣ Just paste (Ctrl+V) in the LinkedIn post box\n' +
              '3️⃣ Click "Post" to share with your network!\n\n' +
              '🚀 Your inspirational content is ready to go!');
    }, 1000);
    
    setTimeout(() => {
        button.innerHTML = originalContent;
        button.classList.remove('success');
    }, 4000);
}

// Helper function to show success feedback (original)
function showShareSuccess(button, originalContent) {
    button.disabled = false;
    button.classList.remove('button-loading');
    button.classList.add('success');
    button.innerHTML = '<i class="fas fa-check"></i> Shared Successfully!';
    
    setTimeout(() => {
        button.innerHTML = originalContent;
        button.classList.remove('success');
    }, 3000);
}

// Helper function to show error feedback
function showShareError(errorMessage, button) {
    button.disabled = false;
    button.classList.remove('button-loading');
    button.style.background = 'linear-gradient(45deg, #dc3545, #c82333)';
    button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Share Failed';
    
    // Show user-friendly error message
    setTimeout(() => {
        let userMessage = 'Unable to share to LinkedIn. ';
        if (errorMessage.includes('No valid quote')) {
            userMessage += 'Please generate a quote first by clicking "New Quote".';
        } else {
            userMessage += 'Please try again or copy the quote manually.';
        }
        
        alert(userMessage);
        
        // Reset button
        button.innerHTML = '<i class="fab fa-linkedin"></i> Share to LinkedIn';
        button.style.background = 'linear-gradient(45deg, #0077B5, #00A0DC)';
    }, 1500);
}

// Helper function to show fallback options
function showShareFallback(shareText, button, originalContent) {
    button.disabled = false;
    button.classList.remove('button-loading');
    
    const userChoice = confirm(
        'LinkedIn sharing was blocked by your browser. Would you like to:\n\n' +
        '✅ OK - Copy the quote to clipboard (then you can paste it manually on LinkedIn)\n' +
        '❌ Cancel - Try again later'
    );
    
    if (userChoice) {
        copyToClipboard(shareText, button, originalContent);
    } else {
        button.innerHTML = originalContent;
    }
}

// Helper function to copy text to clipboard
function copyToClipboard(text, button, originalContent) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess(button, originalContent);
        }).catch(() => {
            showManualCopy(text, button, originalContent);
        });
    } else {
        showManualCopy(text, button, originalContent);
    }
}

// Helper function to show copy success
function showCopySuccess(button, originalContent) {
    button.innerHTML = '<i class="fas fa-clipboard-check"></i> Copied!';
    button.style.background = 'linear-gradient(45deg, #28a745, #34ce57)';
    
    setTimeout(() => {
        button.innerHTML = originalContent;
        button.style.background = 'linear-gradient(45deg, #0077B5, #00A0DC)';
    }, 2000);
    
    // Show instructions
    setTimeout(() => {
        alert('Quote copied to clipboard! 📋\n\nNow you can:\n1. Open LinkedIn.com\n2. Click "Start a post"\n3. Paste (Ctrl+V) the quote\n4. Click "Post" to share!');
    }, 500);
}

// Helper function to show manual copy dialog
function showManualCopy(text, button, originalContent) {
    const copyDialog = `
        Quote ready to share on LinkedIn:\n
        ${'-'.repeat(50)}\n
        ${text}\n
        ${'-'.repeat(50)}\n
        \nPlease copy this text manually and paste it on LinkedIn.
    `;
    
    alert(copyDialog);
    button.innerHTML = originalContent;
}

// Helper function to show LinkedIn instructions
function showLinkedInInstructions(shareText) {
    // Only show if the text wasn't automatically filled
    const instructionMessage = `
🔔 LinkedIn Sharing Tip:

If the quote text didn't automatically appear in your LinkedIn post:

1️⃣ The quote has been copied to your clipboard
2️⃣ Simply paste it (Ctrl+V or Cmd+V) in the LinkedIn post box
3️⃣ Add any personal thoughts and click "Post"

Your quote is ready to inspire your network! 🚀
    `;
    
    // Copy to clipboard as backup
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(shareText).then(() => {
            console.log('Quote copied to clipboard as backup');
        }).catch(err => {
            console.log('Clipboard copy failed:', err);
        });
    }
}

// Enhanced helper function to show fallback options
function showShareFallback(shareText, button, originalContent) {
    button.disabled = false;
    button.classList.remove('button-loading');
    
    // Automatically copy to clipboard
    const copyPromise = navigator.clipboard && window.isSecureContext ? 
        navigator.clipboard.writeText(shareText) : Promise.reject();
    
    copyPromise.then(() => {
        // Successfully copied to clipboard
        const userChoice = confirm(
            '📋 Quote copied to clipboard!\n\n' +
            'LinkedIn sharing popup was blocked. Would you like to:\n\n' +
            '✅ OK - Open LinkedIn manually (you can paste the quote there)\n' +
            '❌ Cancel - Try again later'
        );
        
        if (userChoice) {
            // Open LinkedIn directly
            window.open('https://www.linkedin.com/feed/', '_blank');
            showCopySuccess(button, originalContent);
        } else {
            button.innerHTML = originalContent;
        }
    }).catch(() => {
        // Clipboard failed, show manual copy
        const userChoice = confirm(
            'LinkedIn sharing was blocked by your browser. Would you like to:\n\n' +
            '✅ OK - See the text to copy manually\n' +
            '❌ Cancel - Try again later'
        );
        
        if (userChoice) {
            showManualCopy(shareText, button, originalContent);
        } else {
            button.innerHTML = originalContent;
        }
    });
}


