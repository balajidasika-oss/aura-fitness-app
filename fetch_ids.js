const https = require('https');
https.get('https://www.youtube.com/results?search_query=zumba+dance+workout', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const matches = [...data.matchAll(/\{\"videoId\":\"([a-zA-Z0-9_-]{11})\"/g)];
    const ids = [...new Set(matches.map(m => m[1]))].slice(0, 6);
    console.log(ids);
  });
});
