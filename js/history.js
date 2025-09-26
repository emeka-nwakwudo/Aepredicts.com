document.addEventListener('DOMContentLoaded', () => {
    const historyEventsContainer = document.getElementById('history-events');
    const historyFilter = document.getElementById('history-filter');
    let allPastPredictions = [];

    fetch('js/predictions.json')
        .then(response => response.json())
        .then(predictions => {
            const today = new Date().toISOString().split('T')[0];
            allPastPredictions = predictions.filter(p => p.date < today);

            // Sort past predictions by date in descending order
            allPastPredictions.sort((a, b) => new Date(b.date) - new Date(a.date));

            if (historyEventsContainer) {
                if (allPastPredictions.length > 0) {
                    filterAndRenderHistory();
                } else {
                    historyEventsContainer.innerHTML = '<div class="card-body"><p>No past predictions found.</p></div>';
                }
            }
        });

    function filterAndRenderHistory() {
        const filterValue = historyFilter.value;
        let filteredPredictions = allPastPredictions;

        if (filterValue === 'won') {
            filteredPredictions = allPastPredictions.filter(p => p.status.toLowerCase() === 'won');
        } else if (filterValue === 'lost') {
            filteredPredictions = allPastPredictions.filter(p => p.status.toLowerCase() === 'lost');
        }

        renderHistory(filteredPredictions, historyEventsContainer);
    }

    if (historyFilter) {
        historyFilter.addEventListener('change', filterAndRenderHistory);
    }

    function renderHistory(predictionData, container) {
        container.innerHTML = '';
        if (predictionData.length === 0) {
            container.innerHTML = '<div class="card-body"><p>No predictions match the filter.</p></div>';
            return;
        }
        predictionData.forEach(prediction => {
            const eventHtml = `
                <div class="event">
                    <div class="teams">
                        <div>${prediction.teams.home} vs. ${prediction.teams.away}</div>
                        <div class="meta">${prediction.date} • ${prediction.time} • ${prediction.league}</div>
                    </div>
                    <div class="meta prediction-text">Prediction: ${prediction.prediction}</div>
                    <div class="meta prediction-text">Status: ${prediction.status}</div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', eventHtml);
        });
    }
});