# salient-autofocus

Auto-focus capabilities based on saliency maps.



## Basic Usage

Extract a 640x480 region from a 1024x768 image using salient auto-focus

```
const autoFocus = require('salient-autofocus');

const salientMatrix = [[0, 0.25, 0.5], [0, 0, 0.25], [0, 0.25, 0.75]]; // custom 3x3 matrix
const region = autoFocus.getRegionFromSalientMatrix(salientMatrix, { imageWidth: 1024, imageHeight: 768, regionWidth: 640, regionHeight: 480 });
// { left, top, right, bottom, width, height }
```



## OpenCV Usage

Extract a 640x480 region from a 1024x768 image using salient auto-focus

```
const autoFocus = require('salient-autofocus');

const salientMatrix = mySalientMap.getDataAsArray(); // works with opencv or opencv4nodejs packages
const region = autoFocus.getRegionFromSalientMatrix(salientMatrix, { imageWidth: 1024, imageHeight: 768, regionWidth: 640, regionHeight: 480 });
// { left, top, right, bottom, width, height }
```



## Production Usage

The real power of this package is the metadata that it extracts from saliency data, which can be stored or cached, allowing subsequent auto-focus requests to be lightning fast! No need to re-create salient maps, store salient maps, or re-process salient maps.

```
const autoFocus = require('salient-autofocus');

const salientMatrix = mySalientMap.getDataAsArray(); // works with opencv or opencv4nodejs packages
const salientMeta = autoFocus.getMetaFromSalientMatrix(salientMatrix);
// TODO: store meta for subsequent auto-focus requests
const region = autoFocus.getRegionFromMeta(salientMeta, { imageWidth: 1024, imageHeight: 768, regionWidth: 640, regionHeight: 480 }); // SUPA FAST!
// { left, top, right, bottom, width, height }
```



## Where do I get my salient map?

That's out of the scope of this project as there are *many* models for generating salient maps based on TONS of research. However you're in luck,
because I just happen to author one of those solutions: https://github.com/asilvas/salient-maps



## Example Results

The following examples are visual representations of the original image side by side with the salient map,
overlayed by the regions of saliency density to illustrate where **salient-autofocus** will focus on
depending on the available size of the region requested. The more accurate the saliency map, the better
**salient-autofocus** will perform.

![](https://github.com/asilvas/salient-autofocus/raw/master/docs/images/salient7.jpg)
![](https://github.com/asilvas/salient-autofocus/raw/master/docs/images/salient8.jpg)
![](https://github.com/asilvas/salient-autofocus/raw/master/docs/images/salient9.jpg)
![](https://github.com/asilvas/salient-autofocus/raw/master/docs/images/salient10.jpg)
![](https://github.com/asilvas/salient-autofocus/raw/master/docs/images/salient11.jpg)
![](https://github.com/asilvas/salient-autofocus/raw/master/docs/images/salient6.jpg)


## Region Data

Data returned by `getRegionFromSalientMatrix` or `getRegionFromMeta` to indicate the region
to focus on.

```
{ left, top, right, bottom, width, height }
```

| Property | Type | Info |
| --- | --- | --- |
| left | `number` | Left-most edge of region on a 0 to {imageWidth} scale in columns (typically pixels) |
| top | `number` | Top-most edge of region on a 0 to {imageHeight} scale in rows (typically pixels) |
| width | `number` | Width of region on a 0 to {imageWidth} scale in columns (typically pixels) |
| height | `number` | Height of region on a 0 to {imageHeight} scale in rows (typically pixels) |
| right | `number` | Right-most edge of region added for convenience (left+width) |
| bottom | `number` | Bottom-most edge of region added for convenience (top+height) |


## Meta Data

If extracting meta from salient data via `getMetaFromSalientMatrix` (as you should for production usage),
below is the structure of that data for reference.

```
{
  v,
  c: {
    x,
    y
  },
  r25th,
  r40th,
  r50th,
  r75th,
  r90th
}
```

| Property | Type | Info |
| --- | --- | --- |
| v | `number` | Version of the data structure. If this version ever changes, you should consider the old meta invalid |
| c | `object` | Center point based on average saliency. Typically ignored unless no regions are identified, but still can be useful |
| c.x | `number` | Center x dimension from 0 (left) to 1 (right) |
| c.y | `number` | Center y dimension from 0 (top) to 1 (bottom) |
| r25th | `MetaRegion` | [MetaRegion](#meta-region-data) that encompasses ~25% of all saliency |
| r40th | `MetaRegion` | [MetaRegion](#meta-region-data) that encompasses ~40% of all saliency |
| r50th | `MetaRegion` | [MetaRegion](#meta-region-data) that encompasses ~50% of all saliency |
| r75th | `MetaRegion` | [MetaRegion](#meta-region-data) that encompasses ~75% of all saliency |
| r90th | `MetaRegion` | [MetaRegion](#meta-region-data) that encompasses ~90% of all saliency |


### Meta Region Data

The meta region structure used for caching, not to be confused by the [Region](#region-data) returned by `getRegionFromSalientMatrix`
or `getRegionFromMeta`.

```
{ l, t, w, h }
```

| Property | Type | Info |
| --- | --- | --- |
| l | `number` | Left-most edge of region on a 0 to 1 scale |
| t | `number` | Top-most edge of region on a 0 to 1 scale |
| w | `number` | Width of region on a 0 to 1 scale |
| h | `number` | Height of region on a 0 to 1 scale |
