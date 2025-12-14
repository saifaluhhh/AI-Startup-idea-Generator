// ================ STATE MANAGEMENT ================
let state = {
    isLoading: false,
    generatedIdeas: [],
    history: JSON.parse(localStorage.getItem('startupIdeaHistory')) || []
};

// ================ DOM ELEMENTS ================
const dom = {
    nicheInput: document.getElementById('niche'),
    creativitySelect: document.getElementById('creativity'),
    ideaCountSelect: document.getElementById('idea-count'),
    generateBtn: document.getElementById('generate-btn'),
    resultsContainer: document.getElementById('results-container'),
    historyList: document.getElementById('history-list'),
    clearHistoryBtn: document.getElementById('clear-history')
};

// ================ INITIALIZATION ================
document.addEventListener('DOMContentLoaded', () => {
    // Load history
    renderHistory();
    
    // Event listeners
    dom.generateBtn.addEventListener('click', generateIdeas);
    dom.clearHistoryBtn.addEventListener('click', clearHistory);
    
    // Allow Enter key to trigger generation
    dom.nicheInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateIdeas();
        }
    });
});

// ================ MAIN FUNCTIONS ================
async function generateIdeas() {
    const niche = dom.nicheInput.value.trim();
    const creativity = parseFloat(dom.creativitySelect.value);
    const ideaCount = parseInt(dom.ideaCountSelect.value);
    
    if (!niche) {
        showAlert('Please enter a niche or industry', 'error');
        return;
    }
    
    // Show loading state
    state.isLoading = true;
    updateUI();
    
    try {
        // Generate startup ideas with OpenAI
        const ideas = await generateStartupIdeas(niche, creativity, ideaCount);
        
        // Get market validation data for each idea
        const validatedIdeas = await Promise.all(
            ideas.map(async (idea) => {
                const competitors = await getCompetitorData(idea.name, niche);
                const domains = await checkDomainAvailability(idea.name);
                return {
                    ...idea,
                    competitors,
                    domains
                };
            })
        );
        
        // Update state
        state.generatedIdeas = validatedIdeas;
        
        // Add to history if not already there
        const historyItem = {
            niche,
            date: new Date().toISOString(),
            ideas: validatedIdeas.map(idea => idea.name)
        };
        
        // Check if this niche is already in history
        const existingIndex = state.history.findIndex(item => item.niche.toLowerCase() === niche.toLowerCase());
        
        if (existingIndex >= 0) {
            state.history[existingIndex] = historyItem; // Update existing
        } else {
            state.history.unshift(historyItem); // Add new
        }
        
        // Keep only the last 10 history items
        if (state.history.length > 10) {
            state.history = state.history.slice(0, 10);
        }
        
        // Save to localStorage
        localStorage.setItem('startupIdeaHistory', JSON.stringify(state.history));
        
        // Update UI
        renderResults();
        renderHistory();
        
        // Show success
        showAlert('Successfully generated startup ideas!', 'success');
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        
    } catch (error) {
        console.error('Error generating ideas:', error);
        showAlert('Failed to generate ideas. Please try again.', 'error');
    } finally {
        state.isLoading = false;
        updateUI();
    }
}

async function generateStartupIdeas(niche, temperature = 0.7, count = 3) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock data for demonstration
    const mockIdeas = [];
    const baseNames = [
        `${niche.split(' ')[0]}Genius`,
        `${niche.split(' ')[0]}Nest`,
        `Eco${niche.split(' ')[0]}`,
        `${niche.split(' ')[0]}ly`,
        `Next${niche.split(' ')[0]}`,
        `${niche.split(' ')[0]}Hub`,
        `${niche.split(' ')[0]}Forge`,
        `${niche.split(' ')[0]}Labs`
    ];
    
    for (let i = 0; i < count; i++) {
        const name = baseNames[i] || `${niche.split(' ')[0]}${Math.floor(Math.random() * 1000)}`;
        mockIdeas.push({
            name: name,
            description: `A platform that uses AI to revolutionize the ${niche} industry by connecting customers with personalized solutions. Our technology analyzes user preferences to deliver tailored recommendations and services.`,
            customerSegment: `Tech-savvy ${niche} enthusiasts`,
            marketSize: ["small", "medium", "large"][Math.floor(Math.random() * 3)],
            valueProposition: `First AI-powered platform that truly understands individual needs in the ${niche} space.`
        });
    }
    
    return mockIdeas;
}

async function getCompetitorData(startupName, niche) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data for demonstration
    const mockCompetitors = [
        {
            name: `${niche.split(' ')[0]}Tech`,
            description: `A leading provider of ${niche} solutions with a focus on innovation.`,
            website: `www.${niche.split(' ')[0].toLowerCase()}tech.com`,
            funding: "$" + (Math.random() * 20 + 1).toFixed(1) + "M"
        },
        {
            name: `${niche.split(' ')[0]}Hub`,
            description: `Platform connecting ${niche} professionals with customers.`,
            website: `www.${niche.split(' ')[0].toLowerCase()}hub.com`,
            funding: "$" + (Math.random() * 10 + 1).toFixed(1) + "M"
        },
        {
            name: `${niche.split(' ')[0]}Now`,
            description: `On-demand ${niche} services for busy professionals.`,
            website: `www.${niche.split(' ')[0].toLowerCase()}now.com`,
            funding: "$" + (Math.random() * 5 + 1).toFixed(1) + "M"
        }
    ];
    
    return {
        competitors: mockCompetitors,
        competitionLevel: Math.random() > 0.7 ? "High" : (Math.random() > 0.4 ? "Medium" : "Low")
    };
}

async function checkDomainAvailability(startupName) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock data for demonstration
    const cleanName = startupName.toLowerCase().replace(/\s+/g, '');
    const domains = [
        {
            domain: `${cleanName}.com`,
            available: Math.random() > 0.7,
            price: "$12.99"
        },
        {
            domain: `get${cleanName}.com`,
            available: Math.random() > 0.5,
            price: "$12.99"
        },
        {
            domain: `${cleanName}app.com`,
            available: Math.random() > 0.3,
            price: "$12.99"
        },
        {
            domain: `join${cleanName}.com`,
            available: Math.random() > 0.6,
            price: "$12.99"
        }
    ];
    
    return domains;
}

function generatePitchPDF(idea) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(22);
    doc.setTextColor(67, 97, 238);
    doc.text(`Startup Pitch: ${idea.name}`, 105, 20, { align: 'center' });
    
    // Add divider
    doc.setDrawColor(67, 97, 238);
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    
    // Add content
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 35;
    
    // Description
    doc.setFont(undefined, 'bold');
    doc.text('Description:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(idea.description, 20, yPosition + 7, { maxWidth: 170 });
    yPosition += 20;
    
    // Customer Segment
    doc.setFont(undefined, 'bold');
    doc.text('Target Customer:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(idea.customerSegment, 20, yPosition + 7);
    yPosition += 15;
    
    // Market Size
    doc.setFont(undefined, 'bold');
    doc.text('Market Size:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(idea.marketSize, 20, yPosition + 7);
    yPosition += 15;
    
    // Value Proposition
    doc.setFont(undefined, 'bold');
    doc.text('Unique Value Proposition:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(idea.valueProposition, 20, yPosition + 7, { maxWidth: 170 });
    yPosition += 20;
    
    // Competition
    doc.setFont(undefined, 'bold');
    doc.text('Competitive Landscape:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    
    if (idea.competitors && idea.competitors.competitors.length > 0) {
        yPosition += 7;
        idea.competitors.competitors.forEach((competitor, index) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.text(`${competitor.name}: ${competitor.description} (Funding: ${competitor.funding})`, 25, yPosition, { maxWidth: 160 });
            yPosition += 15;
            
            if (index < idea.competitors.competitors.length - 1) {
                doc.setFontSize(8);
                doc.text('---', 25, yPosition);
                doc.setFontSize(12);
                yPosition += 10;
            }
        });
    } else {
        doc.text('No direct competitors identified', 25, yPosition + 7);
        yPosition += 15;
    }
    
    yPosition += 10;
    
    // Domain Availability
    doc.setFont(undefined, 'bold');
    doc.text('Domain Availability:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    
    if (idea.domains && idea.domains.length > 0) {
        yPosition += 7;
        idea.domains.forEach(domain => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            const status = domain.available ? 'Available' : 'Taken';
            doc.text(`${domain.domain}: ${status} ${domain.available ? `(${domain.price})` : ''}`, 25, yPosition);
            yPosition += 10;
        });
    } else {
        doc.text('No domain data available', 25, yPosition + 7);
        yPosition += 15;
    }
    
    // Save the PDF
    doc.save(`${idea.name.replace(/\s+/g, '_')}_Pitch_Deck.pdf`);
}

// ================ UI FUNCTIONS ================
function updateUI() {
    // Update button state
    if (state.isLoading) {
        dom.generateBtn.innerHTML = `
            <span class="btn-content">
                <svg class="btn-icon spin" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                </svg>
                Generating...
            </span>
        `;
        dom.generateBtn.disabled = true;
    } else {
        dom.generateBtn.innerHTML = `
            <span class="btn-content">
                <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                </svg>
                Generate Ideas
            </span>
        `;
        dom.generateBtn.disabled = false;
    }
}

function renderResults() {
    if (!state.generatedIdeas || state.generatedIdeas.length === 0) {
        dom.resultsContainer.innerHTML = `
            <div class="empty-state">
                <img src="idea-icon.svg" alt="Lightbulb Icon" class="empty-icon">
                <h3>Your AI-Generated Startup Ideas</h3>
                <p>Enter your industry/niche above and click "Generate Ideas" to get started. We'll provide validated startup concepts with market data.</p>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd" />
                                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                            </svg>
                        </div>
                        <h4>Market Validation</h4>
                        <p>Get data on market size and competition</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                        </div>
                        <h4>Competitor Analysis</h4>
                        <p>See who else is operating in this space</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <h4>Domain Check</h4>
                        <p>Find available domains for your startup</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <h4>Investor Pitch</h4>
                        <p>Generate professional pitch documents</p>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    let html = `<div class="space-y-6">`;
    
    state.generatedIdeas.forEach((idea, index) => {
        html += `
            <div class="idea-card fade-in" style="animation-delay: ${index * 0.1}s">
                <div class="idea-header">
                    <div>
                        <h3 class="idea-title">${idea.name}</h3>
                        <p class="idea-meta">${idea.customerSegment} • ${idea.marketSize} market</p>
                    </div>
                    <span class="competition-tag ${
                        idea.competitors.competitionLevel === 'High' ? 'competition-high' : 
                        idea.competitors.competitionLevel === 'Medium' ? 'competition-medium' : 
                        'competition-low'
                    }">
                        ${idea.competitors.competitionLevel} Competition
                    </span>
                </div>
                
                <p class="idea-description">${idea.description}</p>
                
                <div class="idea-section">
                    <h4>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5z" clip-rule="evenodd" />
                            <path d="M12.316 10.051a1 1 0 01.633 1.265l-2 6a1 1 0 01-1.898-.316l2-6a1 1 0 011.265-.633zM5.707 7.293a1 1 0 010 1.414L4.414 10l1.293 1.293a1 1 0 01-1.414 1.414l-2-2a1 1 0 010-1.414l2-2a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414-1.414L15.586 10l-1.293-1.293a1 1 0 010-1.414z" />
                        </svg>
                        Unique Value Proposition
                    </h4>
                    <p>${idea.valueProposition}</p>
                </div>
                
                <div class="details-grid">
                    <div class="details-col">
                        <h4>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                            </svg>
                            Top Competitors
                        </h4>
                        <ul>
                            ${idea.competitors.competitors.slice(0, 3).map(competitor => `
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
                                    </svg>
                                    ${competitor.name} (${competitor.funding})
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div class="details-col">
                        <h4>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                            </svg>
                            Domain Availability
                        </h4>
                        <ul>
                            ${idea.domains.slice(0, 3).map(domain => `
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="${domain.available ? 'domain-available' : 'domain-taken'}">${domain.domain}</span>
                                    ${domain.available ? `(${domain.price})` : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="action-btns">
                    <button onclick="generatePitchPDF(${JSON.stringify(idea).replace(/"/g, '&quot;')})" class="primary-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                        Download Pitch Deck
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    dom.resultsContainer.innerHTML = html;
}

function renderHistory() {
    if (!state.history || state.history.length === 0) {
        dom.historyList.innerHTML = `
            <p class="text-sm text-gray-500 italic">No history yet</p>
        `;
        return;
    }
    
    let html = '';
    
    state.history.forEach((item, index) => {
        html += `
            <div class="history-item" data-niche="${item.niche}">
                <div class="flex justify-between items-center">
                    <div>
                        <h4 class="font-medium text-sky-800">${item.niche}</h4>
                        <p class="text-xs text-gray-500">${new Date(item.date).toLocaleDateString()}</p>
                    </div>
                    <span class="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded-full">${item.ideas.length} ideas</span>
                </div>
                <div class="mt-2 flex flex-wrap gap-1">
                    ${item.ideas.slice(0, 2).map(idea => `
                        <span class="text-xs bg-white bg-opacity-50 rounded-full px-2 py-0.5">${idea}</span>
                    `).join('')}
                    ${item.ideas.length > 2 ? `<span class="text-xs bg-white bg-opacity-50 rounded-full px-2 py-0.5">+${item.ideas.length - 2} more</span>` : ''}
                </div>
            </div>
        `;
    });
    
    dom.historyList.innerHTML = html;
    
    // Add click event to history items
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const niche = item.getAttribute('data-niche');
            dom.nicheInput.value = niche;
            generateIdeas();
        });
    });
}

function clearHistory() {
    state.history = [];
    localStorage.removeItem('startupIdeaHistory');
    renderHistory();
    showAlert('History cleared', 'success');
}

function showAlert(message, type = 'info') {
    // Remove any existing alerts
    const existingAlert = document.getElementById('custom-alert');
    if (existingAlert) existingAlert.remove();
    
    const colors = {
        success: 'bg-green-100 border-green-400 text-green-700',
        error: 'bg-red-100 border-red-400 text-red-700',
        info: 'bg-blue-100 border-blue-400 text-blue-700'
    };
    
    const icons = {
        success: `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />`,
        error: `<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />`,
        info: `<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />`
    };
    
    const alert = document.createElement('div');
    alert.id = 'custom-alert';
    alert.className = `fixed top-4 right-4 border-l-4 ${colors[type]} px-4 py-3 rounded shadow-lg z-50 max-w-sm transition-all duration-300 transform translate-x-0 opacity-100 flex items-start`;
    alert.innerHTML = `
        <svg class="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            ${icons[type]}
        </svg>
        <span>${message}</span>
    `;
    
    document.body.appendChild(alert);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        alert.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// Expose functions to global scope for HTML onclick handlers
window.generatePitchPDF = generatePitchPDF;