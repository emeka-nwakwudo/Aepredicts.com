document.addEventListener('DOMContentLoaded', () => {
    let allPredictions = [];

    fetch('/api/predictions')
        .then(response => response.json())
        .then(predictions => {
            allPredictions = predictions;
            updateSportsCount(allPredictions);
            
            // If on predictions.html, render football predictions by default
            if (document.getElementById('predictions-events')) {
                filterPredictionsBySport("Football");
            } else {
                // Initial rendering for homepage
                renderHomepagePredictions(allPredictions);
            }
            
            attachSportClickHandlers();
        })
        .catch(error => console.error('Error fetching or parsing predictions:', error));

    function updateSportsCount(predictions) {
        const sports = ["Football", "Basketball", "Tennis", "Volleyball"];
        const sportsCount = {};
        const pendingPredictions = predictions.filter(p => p.status === 'pending');

        pendingPredictions.forEach(p => {
            if (sportsCount[p.sport]) {
                sportsCount[p.sport]++;
            } else {
                sportsCount[p.sport] = 1;
            }
        });

        const sportsList = document.querySelector('.sports .list');
        if (sportsList) {
            sportsList.innerHTML = '';
            sports.forEach(sport => {
                const count = sportsCount[sport] || 0;
                const a = document.createElement('a');
                a.href = '#';
                a.dataset.sport = sport;
                a.innerHTML = `${sport} <span>${count}</span>`;
                sportsList.appendChild(a);
            });
        }
    }

    function filterPredictionsBySport(sport) {
        const pendingPredictions = allPredictions.filter(p => p.status === 'pending' && p.sport === sport);

        // Sort predictions by date (descending) and then by time (descending)
        pendingPredictions.sort((a, b) => {
            const dateComparison = b.date.localeCompare(a.date); // Newest date first
            if (dateComparison === 0) {
                return b.time.localeCompare(a.time); // Newest time first for same date
            }
            return dateComparison;
        });

        // Determine which container to render into based on the current page
        const predictionsEventsContainer = document.getElementById('predictions-events'); // This is for predictions.html
        const todayEventsContainer = document.getElementById('today-events'); // This is for index.html
        const futureEventsContainer = document.getElementById('future-events'); // This is for index.html

        if (predictionsEventsContainer) { // If on predictions.html
            renderPredictions(pendingPredictions, predictionsEventsContainer);
            const predictionHeading = document.getElementById('prediction-heading');
            if (predictionHeading) {
                predictionHeading.textContent = `Prediction — ${sport.charAt(0).toUpperCase() + sport.slice(1)}`;
            }
        } else if (todayEventsContainer && futureEventsContainer) { // If on index.html
            renderHomepagePredictions(pendingPredictions);
        }
    }

    function attachSportClickHandlers() {
        const sportsLinks = document.querySelectorAll('.sports .list a');
        sportsLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sport = link.dataset.sport;
                filterPredictionsBySport(sport);
            });
        });
    }

    function renderHomepagePredictions(predictionsToRender) {
        const today = new Date().toISOString().split('T')[0];
        const pendingPredictions = predictionsToRender.filter(p => p.status === 'pending');

        const todayPredictions = pendingPredictions.filter(p => p.date === today);
        const futurePredictions = pendingPredictions.filter(p => p.date > today);

        const todayEventsContainer = document.getElementById('today-events');
        const futureEventsContainer = document.getElementById('future-events');

        if (todayEventsContainer) {
            if (todayPredictions.length > 0) {
                renderPredictions(todayPredictions, todayEventsContainer);
            } else {
                todayEventsContainer.innerHTML = '<div class="card-body" style="padding: 1rem;"><p>No predictions for today.</p></div>';
            }
        }

        if (futureEventsContainer) {
            if (futurePredictions.length > 0) {
                renderPredictions(futurePredictions, futureEventsContainer);
            } else {
                futureEventsContainer.innerHTML = '<div class="card-body" style="padding: 1rem;"><p>Coming soon</p></div>';
            }
        }
    }

    function renderPredictions(predictionData, container) {
        container.innerHTML = '';
        if (predictionData.length === 0) {
            container.innerHTML = '<div class="card-body" style="padding: 1rem;"><p>No predictions for this sport.</p></div>';
            return;
        }
        predictionData.forEach(prediction => {
            let oddsButtonsHtml = '';

            if (prediction.market === '1X2') {
                oddsButtonsHtml = `
                    <button class="odd-btn" data-market="1X2" data-selection="${prediction.teams.home}" data-odds="${prediction.odds.home}">${prediction.teams.home}<br>${prediction.odds.home}</button>
                    <button class="odd-btn" data-market="1X2" data-selection="Draw" data-odds="${prediction.odds.draw}">Draw<br>${prediction.odds.draw}</button>
                    <button class="odd-btn" data-market="1X2" data-selection="${prediction.teams.away}" data-odds="${prediction.odds.away}">${prediction.teams.away}<br>${prediction.odds.away}</button>
                `;
            } else if (prediction.market.startsWith('Over/Under')) {
                oddsButtonsHtml = `
                    <button class="odd-btn" data-market="${prediction.market}" data-selection="Over ${prediction.market.split(' ')[1]}" data-odds="${prediction.odds.over}">Over${prediction.market.split(' ')[1]}<br>${prediction.odds.over}</button>
                    <button class="odd-btn" data-market="${prediction.market}" data-selection="Under ${prediction.market.split(' ')[1]}" data-odds="${prediction.odds.under}">Under${prediction.market.split(' ')[1]}<br>${prediction.odds.under}</button>
                `;
            } else if (prediction.market === 'GG/NG') {
                oddsButtonsHtml = `
                    <button class="odd-btn" data-market="GG/NG" data-selection="GG" data-odds="${prediction.odds.gg}">GG<br>${prediction.odds.gg}</button>
                    <button class="odd-btn" data-market="GG/NG" data-selection="NG" data-odds="${prediction.odds.ng}">NG<br>${prediction.odds.ng}</button>
                `;
            }

            const eventHtml = `
                <div class="event">
                    <div class="event-top">
                        <div class="teams">
                            <div>${prediction.teams.home} vs. ${prediction.teams.away}</div>
                            <div class="meta">${prediction.date} • ${prediction.time} • ${prediction.league}</div>
                        </div>
                        <div class="odds">
                            ${oddsButtonsHtml}
                        </div>
                    </div>
                    <div class="event-bottom">
                        <div class="meta prediction-text">Prediction: ${prediction.prediction}</div>
                        <div class="comments-section">
                            <a href="match.html?id=${prediction.id}" class="cta place">View Comments</a>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', eventHtml);
        });
    }

    const slip = [];
    const slipItems = document.getElementById('slipItems');
    const mSlipItems = document.getElementById('mSlipItems');
    const emptyState = document.getElementById('emptyState');
    const legCount = document.getElementById('legCount');
    const totalOdds = document.getElementById('totalOdds');
    const stakeInput = document.getElementById('stake');
    const potential = document.getElementById('potential');
    const mobileCount = document.getElementById('mobileCount');
    const openDrawer = document.getElementById('openDrawer');
    const drawer = document.getElementById('drawer');
    const closeDrawer = document.getElementById('closeDrawer');
    const mTotalOdds = document.getElementById('mTotalOdds');
    const mStakeInput = document.getElementById('mStake');
    const mPotential = document.getElementById('mPotential');
    const saveSelectionsBtn = document.getElementById('save-selections-btn');
    const saveSelectionsBtnMobile = document.getElementById('save-selections-btn-mobile');