// graphService.js
const plotly = require('plotly')();

function createBarGraph(timestamps, volumeData, layout, graphOptions) {
  return new Promise((resolve, reject) => {
    const trace = {
      x: timestamps,
      y: volumeData,
      type: 'bar',
      name: 'Volume Data',
    };

    plotly.plot(timestamps, [trace], graphOptions, (err, msg) => {
      if (err) {
        console.error('Error creating graph:', err);
        reject(new Error('Failed to create graph'));
      } else {
        resolve(`Graph created and saved: ${msg.url}`);
      }
    });
  });
}

module.exports = { createBarGraph };
