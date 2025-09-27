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

    let currentStake = 0;

    function updateSlipUI() {
      let slipItemsHtml = '';
      let mSlipItemsHtml = '';

      if (slip.length === 0) {
        emptyState.style.display = '';
        slipItemsHtml = '<div class="slip-empty">No selections yet. Tap an odds button to add.</div>';
        mSlipItemsHtml = '<div class="slip-empty">No selections yet. Tap an odds button to add.</div>';
      } else {
        emptyState.style.display = 'none';
        slip.forEach((item, idx) => {
          const itemHtml = `
            <div>
              <div><strong>${item.selection}</strong> <span class="small">(${item.market})</span></div>
              <div class="small">${item.match}</div>
            </div>
            <div style="text-align: right;"><span class="odd-value">${item.odds}</span><button class="remove" aria-label="Remove selection" data-idx="${idx}">&times;</button></div>
          `;
          slipItemsHtml += `<div class="slip-item">${itemHtml}</div>`;
          mSlipItemsHtml += `<div class="slip-item">${itemHtml}</div>`;
        });
      }

      slipItems.innerHTML = slipItemsHtml;
      if (mSlipItems) {
        mSlipItems.innerHTML = mSlipItemsHtml;
      }

      legCount.textContent = slip.length + (slip.length === 1 ? ' selection' : ' selections');
      totalOdds.textContent = calcTotalOdds().toFixed(2);
      mobileCount.textContent = slip.length;
      
      if (mTotalOdds) {
        mTotalOdds.textContent = totalOdds.textContent;
      }
      updatePotential();

      // Update the 'data-picked' attribute on all odd buttons
      document.querySelectorAll('.odd-btn').forEach(btn => {
        const selection = btn.getAttribute('data-selection');
        const market = btn.getAttribute('data-market');
        const eventElement = btn.closest('.event');
        const match = eventElement ? eventElement.querySelector('.teams div').textContent : '';

        const isSelectedInSlip = slip.some(s => 
          s.selection === selection && 
          s.market === market && 
          s.match === match
        );
        btn.dataset.picked = isSelectedInSlip ? "true" : "false";
      });
    }

    function updatePotential() { 
      currentStake = parseFloat(stakeInput.value) || 0;
      if (mStakeInput) mStakeInput.value = currentStake;

      potential.textContent = (currentStake * calcTotalOdds()).toFixed(2);
      if (mPotential) mPotential.textContent = (currentStake * calcTotalOdds()).toFixed(2);
    }

    function calcTotalOdds() {
      return slip.reduce((acc, cur) => acc * parseFloat(cur.odds), 1) || 1;
    }

    function printSlip() {
        if (slip.length === 0) {
            alert("Please make a selection first.");
            return;
        }

        const slipHTML = `
            <html>
                <head>
                    <title>AEpredicts Slip</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        h1 { text-align: center; font-family: "Copperplate Gothic Bold", sans-serif; }
                        .slip-item { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
                        .total { text-align: right; font-weight: bold; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <h1>AEpredicts</h1>
                    ${slip.map(item => `
                        <div class="slip-item">
                            <div>
                                <div><strong>${item.selection}</strong> <span class="small">(${item.market})</span></div>
                                <div class="small">${item.match}</div>
                            </div>
                            <div style="text-align: right;"><span class="odd-value">${item.odds}</span></div>
                        </div>
                    `).join('')}
                    <div class="total">Total Odds: ${calcTotalOdds().toFixed(2)}</div>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(slipHTML);
        printWindow.document.close();
        printWindow.print();
    }

    // Global event listener for odd buttons using delegation
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('odd-btn')) {
            const btn = event.target;
            const selection = btn.getAttribute('data-selection');
            const odds = btn.getAttribute('data-odds');
            const market = btn.getAttribute('data-market');

            const eventElement = btn.closest('.event');
            const match = eventElement ? eventElement.querySelector('.teams div').textContent : '';

            const oddsContainer = btn.closest('.odds');

            const isCurrentlyPicked = btn.dataset.picked === "true";

            if (isCurrentlyPicked) {
                btn.dataset.picked = "false";
                const idxToRemove = slip.findIndex(s => s.match === match && s.market === market && s.selection === selection);
                if (idxToRemove !== -1) {
                    slip.splice(idxToRemove, 1);
                }
            } else {
                if (oddsContainer) {
                    oddsContainer.querySelectorAll('.odd-btn').forEach(b => {
                        b.dataset.picked = "false";
                        const existingIdx = slip.findIndex(s => s.match === match && s.market === b.getAttribute('data-market') && s.selection === b.getAttribute('data-selection'));
                        if (existingIdx !== -1) {
                            slip.splice(existingIdx, 1);
                        }
                    });
                }
                btn.dataset.picked = "true";
                slip.push({ selection, odds, market, match });
            }
            updateSlipUI();
        }
    });

    
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('remove')) {
        const idx = +e.target.getAttribute('data-idx');
        slip.splice(idx, 1);
        updateSlipUI();
      }
    });

    stakeInput.addEventListener('input', updatePotential);
    if (mStakeInput) {
        mStakeInput.addEventListener('input', function() {
          stakeInput.value = mStakeInput.value;
          updatePotential();
        });
    }

    if (saveSelectionsBtn) {
        saveSelectionsBtn.addEventListener('click', printSlip);
    }

    if (saveSelectionsBtnMobile) {
        saveSelectionsBtnMobile.addEventListener('click', printSlip);
    }

    updateSlipUI();
    updatePotential();
});