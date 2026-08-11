const https = require('https');

const API_BASE = 'https://web-production-d082ad.up.railway.app/api';

function checkApi() {
  https.get(`${API_BASE}/workers`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      try {
        const json = JSON.parse(data);
        console.log('Success:', json.success);
        console.log('Workers count:', json.data ? json.data.length : 0);
        if (json.data && json.data.length > 0) {
          console.log('First worker:', json.data[0].userId?.name, '(', json.data[0].category, ')');
        } else if (!json.success) {
          console.log('Message:', json.message);
        }
      } catch (e) {
        console.log('Raw output:', data);
      }
    });
  }).on('error', (err) => console.error('Error:', err.message));
}

checkApi();
