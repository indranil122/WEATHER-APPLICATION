const fetch = require('node-fetch');
fetch("https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=sunrise,sunset,moonrise,moonset,moon_phase,moon_illumination&timezone=auto")
  .then(res => res.json())
  .then(data => console.log(Object.keys(data.daily)));
