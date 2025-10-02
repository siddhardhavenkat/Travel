import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [days, setDays] = useState(1);
  const [budget, setBudget] = useState('low');
  const [interests, setInterests] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInterestChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setInterests([...interests, value]);
    } else {
      setInterests(interests.filter((item) => item !== value));
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault(); // prevent page reload
    if (!origin || !destination) return alert('Enter origin & destination');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/itinerary', {
        origin,
        destination,
        startDate,
        days,
        budget,
        preferences: interests.join(', '),
      });
      setResult(res.data.itinerary);
    } catch {
      alert('Error generating itinerary');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: '0 auto' }}>
      <h1>AI Travel Planner for Students</h1>
      <form onSubmit={handleGenerate}>
        <label>Origin</label>
        <input
          type="text"
          placeholder="Enter starting location"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />

        <label>Destination</label>
        <input
          type="text"
          placeholder="Enter destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />

        <label>Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <label>Number of Days</label>
        <input
          type="number"
          min="1"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />

        <label>Budget</label>
        <select value={budget} onChange={(e) => setBudget(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <label>Interests</label>
        <div>
          <label>
            <input type="checkbox" value="food" onChange={handleInterestChange} /> Food
          </label>
          <label>
            <input type="checkbox" value="nature" onChange={handleInterestChange} /> Nature
          </label>
          <label>
            <input type="checkbox" value="sightseeing" onChange={handleInterestChange} /> Sightseeing
          </label>
          <label>
            <input type="checkbox" value="adventure" onChange={handleInterestChange} /> Adventure
          </label>
          <label>
            <input type="checkbox" value="culture" onChange={handleInterestChange} /> Culture
          </label>
          <label>
            <input type="checkbox" value="shopping" onChange={handleInterestChange} /> Shopping
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Itinerary'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h2>Your Itinerary</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
