const form = document.getElementById('plannerForm');
const output = document.getElementById('output');


form.addEventListener('submit', async (ev) => {
ev.preventDefault();
const fd = new FormData(form);
const origin = fd.get('origin');
const destination = fd.get('destination');
const startDate = fd.get('startDate');
const duration = fd.get('duration');
const budget = fd.get('budget');
const preferences = fd.get('preferences');


const interests = [];
form.querySelectorAll('input[name="interests"]:checked').forEach(cb => interests.push(cb.value));


output.innerHTML = '<p>Generating itinerary — please wait...</p>';


try {
const res = await fetch('/api/generate', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ origin, destination, startDate, duration, budget, interests, preferences })
});
const data = await res.json();


if (!data.success) {
output.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
return;
}


renderItinerary(data.data);
} catch (err) {
output.innerHTML = `<p>Error: ${err.message}</p>`;
}
});


function renderItinerary(it) {
if (!it) {
output.innerHTML = '<p>No itinerary returned.</p>';
return;
}


let html = `\n <h2>${escapeHtml(it.trip_summary || 'Trip')}</h2>\n <p><strong>Total estimated cost:</strong> $${it.total_estimated_cost} — ${it.within_budget ? 'within' : 'over'} budget</p>\n `;


html += '<h3>Budget breakdown</h3><ul>';
for (const k in it.budget_breakdown || {}) {
html += `<li>${escapeHtml(k)}: $${it.budget_breakdown[k]}</li>`;
}
html += '</ul>';


html += '<h3>Daily plan</h3>';
(it.itinerary || []).forEach(day => {
html += `<div class="day-card">\n <h4>Day ${day.day} — ${escapeHtml(day.date)} — ${escapeHtml(day.title)}</h4>\n <p><strong>Morning:</strong> ${escapeHtml(day.morning)}</p>\n <p><strong>Afternoon:</strong> ${escapeHtml(day.afternoon)}</p>\n <p><strong>Evening:</strong> ${escapeHtml(day.evening)}</p>\n <p><em>Estimated cost: $${day.estimated_cost}</em></p>\n </div>`;
});


if (it.tips && it.tips.length) {
html += '<h3>Tips</h3><ul>' + it.tips.map(t => `<li>${escapeHtml(t)}</li>`).join('') + '</ul>';
}


output.innerHTML = html;
}


function escapeHtml(s) {
if (!s) return '';
return String(s)
.replaceAll('&', '&amp;')
.replaceAll('<', '&lt;')
.replaceAll('>', '&gt;');
}