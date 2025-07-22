const express = require('express');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve the OpenAPI spec as JSON for tools that prefer it
app.get('/openapi.json', (req, res) => {
  try {
    const yamlFile = fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8');
    const jsonData = yaml.load(yamlFile);
    res.json(jsonData);
  } catch (error) {
    res.status(500).send({ error: 'Failed to convert YAML to JSON' });
  }
});

// Redirect root to the Swagger UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Swagger UI server running at http://localhost:${PORT}`);
}); 