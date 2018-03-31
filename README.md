# salient-autofocus

Auto-focus capabilities based on saliency maps.



## Basic Usage

Extract a 640x480 region from a 1024x768 image using salient auto-focus

```
const autoFocus = require('salient-autofocus');

const salientMatrix = [[0, 0.25, 0.5], [0, 0, 0.25], [0, 0.25, 0.75]]; // custom 3x3 matrix
const region = autoFocus.getRegionFromSalientMatrix(salientMatrix, { imageWidth: 1024, imageHeight: 768, regionWidth: 640, regionHeight: 480 });
```



## OpenCV Usage

Extract a 640x480 region from a 1024x768 image using salient auto-focus

```
const autoFocus = require('salient-autofocus');

const salientMatrix = mySalientMap.getDataAsArray(); // works with opencv or opencv4nodejs packages
const region = autoFocus.getRegionFromSalientMatrix(salientMatrix, { imageWidth: 1024, imageHeight: 768, regionWidth: 640, regionHeight: 480 });
```



## Production Usage

The real power of this package is the metadata that it extracts from saliency data, which can be stored or cached, allowing subsequent auto-focus requests to be lightning fast! No need to re-create salient maps, store salient maps, or re-process salient maps.

```
const autoFocus = require('salient-autofocus');

const salientMatrix = mySalientMap.getDataAsArray(); // works with opencv or opencv4nodejs packages
const salientMeta = autoFocus.getMetaFromSalientMatrix(salientMatrix);
// TODO: store meta for subsequent auto-focus requests
const region = autoFocus.getRegionFromMeta(salientMeta, { imageWidth: 1024, imageHeight: 768, regionWidth: 640, regionHeight: 480 }); // SUPA FAST!
```



## Where do I get my salient map?

That's out of the scope of this project as there are *many* models for generating salient maps based on TONS of research. However you're in luck,
because I just happen to author one of those solutions: https://github.com/asilvas/salient-maps
