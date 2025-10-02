import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(1);
  const [budget, setBudget] = useState('low');
  const [prefs, setPrefs] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!origin || !destination) return alert('Enter origin & destination');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/itinerary', { origin, destination, days, budget, preferences: prefs });
      setResult(res.data.itinerary);
    } catch { alert('Error generating itinerary'); }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>AI Travel Planner</h1>
      <input placeholder="Origin" value={origin} onChange={e => setOrigin(e.target.value)} />
      <input placeholder="Destination" value={destination} onChange={e => setDestination(e.target.value)} />
      <input type="number" min="1" value={days} onChange={e => setDays(e.target.value)} />
      <select value={budget} onChange={e => setBudget(e.target.value)}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <textarea placeholder="Preferences" value={prefs} onChange={e => setPrefs(e.target.value)} />
      <button onClick={handleGenerate} disabled={loading}>{loading ? 'Generating...' : 'Generate'}</button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}

export default App;
