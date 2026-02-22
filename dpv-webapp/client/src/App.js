import './App.css';
import axios from 'axios';

function App() {
  const testConnection = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/hello');
      console.log('SUCCESS:', res.data);
      alert('Success! Check the console.');
    } catch (error) {
      console.error('FAILURE:', error);
      alert('Failure! Check the console.');
    }
  };

  return (
    <div className="App">
      <h1>DPV System</h1>
      <button onClick={testConnection}>Test Backend-AI Connection</button>
    </div>
  );
}

export default App;
