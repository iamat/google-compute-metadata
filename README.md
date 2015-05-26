# Google Compute Engine Metadata

Node module for getting Google Compute Engine instance and project metadata.

## Installation

```bash
npm install google-compute-metadata
```

## Usage

```javascript
var metadata = require("google-compute-metadata");

metadata.instance(function (err, data) {
  console.log("Instance Id: " +  data.id);
});

metadata.project(function (err, data) {
  console.log("Project Id: " +  data.projectId);
});
```
