document.addEventListener('DOMContentLoaded', () => {
    const historyEventsContainer = document.getElementById('history-events');

    fetch('js/predictions.json')
        .then(response => response.json())
        .then(predictions => {
            const today = new Date().toISOString().split('T')[0];
            const pastPredictions = predictions.filter(p => p.date < today);

            if (historyEventsContainer) {
                if (pastPredictions.length > 0) {
                    renderHistory(pastPredictions, historyEventsContainer);
                } else {
                    historyEventsContainer.innerHTML = '<div class="card-body"><p>No past predictions found.</p></div>';
                }
            }
        });

    function renderHistory(predictionData, container) {
        container.innerHTML = '';
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