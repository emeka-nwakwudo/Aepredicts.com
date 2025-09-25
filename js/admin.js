document.addEventListener('DOMContentLoaded', () => {
    const predictionForm = document.getElementById('prediction-form');
    const predictionIdInput = document.getElementById('prediction-id');
    const sportInput = document.getElementById('sport');
    const homeTeamInput = document.getElementById('home-team');
    const awayTeamInput = document.getElementById('away-team');
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    const leagueInput = document.getElementById('league');
    const marketSelect = document.getElementById('market');
    const oddsInputsDiv = document.getElementById('odds-inputs');
    const predictionTextInput = document.getElementById('prediction-text');
    const statusSelect = document.getElementById('status');
    const predictionsList = document.getElementById('predictions-list');
    const adminMessage = document.getElementById('admin-message');
    const saveButton = predictionForm.querySelector('button[type="submit"]');
    const cancelEditButton = document.getElementById('cancel-edit');

    let currentEditPredictionId = null;

    // Function to display messages
    function showMessage(message, type = 'success') {
        adminMessage.textContent = message;
        adminMessage.className = `admin-message ${type}`;
        adminMessage.style.display = 'block';
        setTimeout(() => {
            adminMessage.style.display = 'none';
        }, 3000);
    }

    // Function to render odds input fields based on market
    function renderOddsInputs(market, currentOdds = {}) {
        oddsInputsDiv.innerHTML = '';
        let html = '';

        if (market === '1X2') {
            html = `
                <div>
                    <label for="odds-home">Home Win Odds</label>
                    <input type="number" step="0.01" id="odds-home" value="${currentOdds.home || ''}" required>
                </div>
                <div>
                    <label for="odds-draw">Draw Odds</label>
                    <input type="number" step="0.01" id="odds-draw" value="${currentOdds.draw || ''}" required>
                </div>
                <div>
                    <label for="odds-away">Away Win Odds</label>
                    <input type="number" step="0.01" id="odds-away" value="${currentOdds.away || ''}" required>
                </div>
            `;
        } else if (market.startsWith('Over/Under')) {
            html = `
                <div>
                    <label for="odds-over">Over Odds</label>
                    <input type="number" step="0.01" id="odds-over" value="${currentOdds.over || ''}" required>
                </div>
                <div>
                    <label for="odds-under">Under Odds</label>
                    <input type="number" step="0.01" id="odds-under" value="${currentOdds.under || ''}" required>
                </div>
            `;
        } else if (market === 'GG/NG') {
            html = `
                <div>
                    <label for="odds-gg">GG Odds</label>
                    <input type="number" step="0.01" id="odds-gg" value="${currentOdds.gg || ''}" required>
                </div>
                <div>
                    <label for="odds-ng">NG Odds</label>
                    <input type="number" step="0.01" id="odds-ng" value="${currentOdds.ng || ''}" required>
                </div>
            `;
        }
        oddsInputsDiv.innerHTML = html;
    }

    marketSelect.addEventListener('change', () => renderOddsInputs(marketSelect.value));

    // Function to fetch and display predictions
    async function fetchPredictions() {
        try {
            const response = await fetch('/api/predictions');
            if (!response.ok) {
                throw new Error('Failed to fetch predictions');
            }
            const predictions = await response.json();
            predictionsList.innerHTML = '';
            predictions.forEach(prediction => {
                const row = predictionsList.insertRow();
                row.innerHTML = `
                    <td>${prediction.id}</td>
                    <td>${prediction.sport}</td>
                    <td>${prediction.teams.home} vs ${prediction.teams.away}</td>
                    <td>${prediction.date}</td>
                    <td>${prediction.market}</td>
                    <td>${prediction.prediction}</td>
                    <td>${prediction.status}</td>
                    <td class="actions">
                        <button class="edit-btn" data-id="${prediction.id}">Edit</button>
                        <button class="delete-btn" data-id="${prediction.id}">Delete</button>
                    </td>
                `;
            });
        } catch (error) {
            console.error('Error fetching predictions:', error);
            showMessage('Error loading predictions.', 'error');
        }
    }

    // Function to handle form submission (Add/Edit)
    predictionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const teams = {
            home: homeTeamInput.value,
            away: awayTeamInput.value,
        };
        const odds = {};
        const market = marketSelect.value;

        if (market === '1X2') {
            odds.home = parseFloat(document.getElementById('odds-home').value);
            odds.draw = parseFloat(document.getElementById('odds-draw').value);
            odds.away = parseFloat(document.getElementById('odds-away').value);
        } else if (market.startsWith('Over/Under')) {
            odds.over = parseFloat(document.getElementById('odds-over').value);
            odds.under = parseFloat(document.getElementById('odds-under').value);
        } else if (market === 'GG/NG') {
            odds.gg = parseFloat(document.getElementById('odds-gg').value);
            odds.ng = parseFloat(document.getElementById('odds-ng').value);
        }

        const predictionData = {
            sport: sportInput.value,
            teams: teams,
            date: dateInput.value,
            time: timeInput.value,
            league: leagueInput.value,
            market: market,
            odds: odds,
            prediction: predictionTextInput.value,
            status: statusSelect.value,
        };

        try {
            let response;
            if (currentEditPredictionId) {
                // Update existing prediction
                response = await fetch(`/api/predictions/${currentEditPredictionId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(predictionData),
                });
            } else {
                // Create new prediction
                response = await fetch('/api/predictions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(predictionData),
                });
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to save prediction');
            }

            showMessage(currentEditPredictionId ? 'Prediction updated successfully!' : 'Prediction added successfully!', 'success');
            predictionForm.reset();
            renderOddsInputs(''); // Clear odds inputs
            currentEditPredictionId = null;
            saveButton.textContent = 'Save Prediction';
            cancelEditButton.style.display = 'none';
            fetchPredictions(); // Refresh the list
        } catch (error) {
            console.error('Error saving prediction:', error);
            showMessage(`Error: ${error.message}`, 'error');
        }
    });

    // Handle Edit and Delete buttons
    predictionsList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;
            try {
                const response = await fetch(`/api/predictions`); // Fetch all to find the one to edit
                const predictions = await response.json();
                const predictionToEdit = predictions.find(p => p.id == id);

                if (predictionToEdit) {
                    currentEditPredictionId = id;
                    sportInput.value = predictionToEdit.sport;
                    homeTeamInput.value = predictionToEdit.teams.home;
                    awayTeamInput.value = predictionToEdit.teams.away;
                    dateInput.value = predictionToEdit.date;
                    timeInput.value = predictionToEdit.time;
                    leagueInput.value = predictionToEdit.league;
                    marketSelect.value = predictionToEdit.market;
                    renderOddsInputs(predictionToEdit.market, predictionToEdit.odds);
                    predictionTextInput.value = predictionToEdit.prediction;
                    statusSelect.value = predictionToEdit.status;

                    saveButton.textContent = 'Update Prediction';
                    cancelEditButton.style.display = 'inline-block';
                    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
                } else {
                    showMessage('Prediction not found for editing.', 'error');
                }
            } catch (error) {
                console.error('Error fetching prediction for edit:', error);
                showMessage('Error loading prediction for edit.', 'error');
            }
        } else if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this prediction?')) {
                try {
                    const response = await fetch(`/api/predictions/${id}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        throw new Error('Failed to delete prediction');
                    }
                    showMessage('Prediction deleted successfully!', 'success');
                    fetchPredictions(); // Refresh the list
                } catch (error) {
                    console.error('Error deleting prediction:', error);
                    showMessage(`Error: ${error.message}`, 'error');
                }
            }
        }
    });

    cancelEditButton.addEventListener('click', () => {
        predictionForm.reset();
        renderOddsInputs('');
        currentEditPredictionId = null;
        saveButton.textContent = 'Save Prediction';
        cancelEditButton.style.display = 'none';
    });

    // Initial fetch of predictions when the page loads
    fetchPredictions();

    // Client-side protection for admin page
    async function checkAdminAuth() {
        try {
            const response = await fetch('/api/user');
            if (!response.ok) {
                // Not authenticated, redirect to signin
                window.location.href = 'signin.html';
            }
            // Optionally, check for an admin role here if implemented
            // const userData = await response.json();
            // if (!userData.isAdmin) { window.location.href = 'index.html'; }
        } catch (error) {
            console.error('Error checking admin auth:', error);
            window.location.href = 'signin.html'; // Redirect on any auth error
        }
    }
    checkAdminAuth();
});