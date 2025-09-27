document.addEventListener('DOMContentLoaded', () => {
    const matchTitle = document.getElementById('match-title');
    const matchDetailsContainer = document.getElementById('match-details');
    const commentInput = document.getElementById('comment-input');
    const submitCommentBtn = document.getElementById('submit-comment');
    const commentsList = document.getElementById('comments-list');

    const urlParams = new URLSearchParams(window.location.search);
    const matchId = parseInt(urlParams.get('id'));

    // Get username from localStorage, default to 'anonymous'
    const username = localStorage.getItem('username') || 'anonymous';

    // Load comments from localStorage
    let comments = JSON.parse(localStorage.getItem(`comments_${matchId}`)) || [];

    function renderComments() {
        commentsList.innerHTML = '';
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.classList.add('card-body');
            commentElement.style.padding = '1rem';
            commentElement.style.marginTop = '1rem';
            commentElement.innerHTML = `<strong>${comment.username}:</strong> ${comment.text}`;
            commentsList.appendChild(commentElement);
        });
    }

    renderComments();

    // Show loading state
    if (matchDetailsContainer) {
        matchDetailsContainer.innerHTML = '<div class="card-body" style="padding: 1rem;"><p>Loading match details...</p></div>';
    }

    fetch('/api/predictions')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(predictions => {
            const match = predictions.find(p => p.id === matchId);

            if (match) {
                matchTitle.textContent = `${match.teams.home} vs. ${match.teams.away}`;
                renderMatchDetails(match, matchDetailsContainer);
            } else {
                matchDetailsContainer.innerHTML = '<div class="card-body" style="padding: 1rem;"><p>Match not found.</p></div>';
            }
        })
        .catch(error => {
            console.error('Error fetching match details:', error);
            if (matchDetailsContainer) {
                matchDetailsContainer.innerHTML = '<div class="card-body" style="padding: 1rem;"><p>Error loading match details. Please try again later.</p></div>';
            }
        });

    function renderMatchDetails(match, container) {
        container.innerHTML = '';
        const eventHtml = `
            <div class="event">
                <div class="teams">
                    <div>${match.teams.home} vs. ${match.teams.away}</div>
                    <div class="meta">${match.date} • ${match.time} • ${match.league}</div>
                </div>
                <div class="odds">
                    <button class="odd-btn" data-market="1X2" data-selection="${match.teams.home}" data-odds="${match.odds.home}">${match.teams.home} ${match.odds.home}</button>
                    <button class="odd-btn" data-market="1X2" data-selection="Draw" data-odds="${match.odds.draw}">Draw ${match.odds.draw}</button>
                    <button class="odd-btn" data-market="1X2" data-selection="${match.teams.away}" data-odds="${match.odds.away}">${match.teams.away} ${match.odds.away}</button>
                </div>
                <div class="meta prediction-text">Prediction: ${match.prediction}</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', eventHtml);
    }

    submitCommentBtn.addEventListener('click', () => {
        const commentText = commentInput.value.trim();
        if (commentText) {
            comments.push({ username: username, text: commentText });
            localStorage.setItem(`comments_${matchId}`, JSON.stringify(comments));
            renderComments();
            commentInput.value = '';
        }
    });
});
