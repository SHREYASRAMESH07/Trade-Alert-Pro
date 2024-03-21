// app.js
const express = require('express');
const dataService = require('./dataService');
const graphService = require('./graphService');

const app = express();
const port = 3000;
const collectionName = 'IBM-Datasheet';

dataService.initializeFirebase();

app.get('/importData', async (req, res) => {
  try {
    const importResult = await dataService.importData('./intraday_5min_IBM.xlsx', collectionName);
    res.status(200).send(importResult);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/data', async (req, res) => {
  try {
    const data = await dataService.fetchData(collectionName);
    res.json(data);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.get('/graph', async (req, res) => {
  try {
    const data = await dataService.fetchData(collectionName);
    const timestamps = data.map((record) => new Date(record.timestamp));
    const volumeData = data.map((record) => record.volume);

    const layout = {
      title: 'IBM Market Volume Data',
      xaxis: {
        title: 'Timestamp',
      },
      yaxis: {
        title: 'Volume Data',
      },
    };

    const graphOptions = { layout, filename: 'IBM-Market-Volume-Data', fileopt: 'overwrite' };

    const graphResult = await graphService.createBarGraph(timestamps, volumeData, layout, graphOptions);
    res.send(graphResult);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
