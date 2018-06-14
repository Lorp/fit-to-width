# fit-to-width.js

fit-to-width.js is a tiny JavaScript library for fitting text into text containers in a typographically sensitive way, using standard CSS. It offers automatic adjustment of a variable font’s width (`wdth`) axis, as well as adjustments of letter-spacing and word-spacing. By default, it adjusts the width axis via CSS `font-variation-settings`, then resorts to a horizontal scale using CSS `transform`. In general, a sequence of operations can be specified, each performed to the best of its ability before proceeding to the next operation if an optimal result has not yet been reached.

For efficiency it uses a binary search algorithm to converge quickly on a good result. Typically it performs only 8 or so tests to arrive at an ideal solution for the width axis setting, even though there are thousands of possible values.

There is one user-facing function, **ftw_fit()**.

## Quick start

To try out the library:

* Create a page with `<div>` elements containing text you want to fit to width.
 
* Set these `<div>` elements in a variable font with a Width axis.

* Style these `<div>` elements to have a specific width, e.g. `width: 600px`.

* Include the `fit-to-width.js` script at the top of your web page like this:

> `<script src="fit-to-width.js"></script>`

* Assign the class “**ftw**” to the HTML elements you want to process.

* When your page and fonts are loaded, call `ftw_fit(".ftw")`.

* or try this [CodePen](https://codepen.io/lorp/pen/rKMvZP)

## Background

In the table, the first column shows various possible typographic adjustments we can try in order to adjust width. The CSS column shows how we adjust this with CSS. The third column shows the method name we use in fit-to-width.js. The fourth column shows whether or not this adjustment is implemented in fit-to-width.js.

| Adjustment | CSS | Method | Implemented |
|------------------|------------------------|--|-----|
| tracking         | `letter-spacing`       | **letter-spacing** | ✓    |
| font width       | `font-stretch`         | **font-stretch** | ✓    |
| font width       | `font-variation-settings: 'wdth' <nnn>` | **font-variation-settings:wdth** | ✓    |
| font size        | `font-size`            |      | | 
| word spacing     | `word-spacing`         | **word-spacing** | ✓   |
| enable ligatures | `font-feature-settings: 'dlig' <0/1>, 'liga' <0/1>` | **ligatures** | ~    |
| horizontal scale | `transform:scale(<scale-factor>,1)`) |  **transform** |  ✓    |

By default ftw_fit() uses the following methods in this order:
* `font-variation-settings:wdth`
* `transform`

**Caution: Chrome has not implemented CSS font-stretch for variable fonts, so you must use the `font-variation-settings:wdth` method instead. This low-level property does not inherit other axis settings, and so other axes revert to default if you are not careful. See below for how to use the `axes` property to set other axes.**

## Parameters

`ftw_fit (<elements>, [<operations>], [<targetWidth>] ])`

### _elements_

The required first parameter, **elements**, specifies the DOM elements we should process. We can specify these elements in several ways:

* A string, e.g. “.ftw”, is used as a selector to obtain all elements matching `document.querySelectorAll(<string>)`. The example will get all elements of class “ftw”. This is similar to element selection in jQuery.

* A single element, e.g. the return value from `document.getElementById("myId")`. 

* Multiple elements, e.g. the return value from `document.getElementsByClassName("myClass")`. Return values from jQuery’s `$("...")` selection mechanism will also work.

### _operations_

The optional `operations` parameter is used to customize the sequence of operations of ftw_fit().

Default is `["font-variation-settings:wdth", "transform"]`

Each operation has a method name, which is one of:

* `font-stretch`
* `font-variation-settings:wdth`
* `word-spacing`
* `letter-spacing`
* `transform`
* `ligatures`

Each of these can be specified simply, just using a string. To use font-stretch, then letter-spacing, the `operations` parameter is `["font-stretch", "letter-spacing"]`. Each method can also be specified with various other parameters: min, max, maxDiff, maxIterations, axes.

#### `font-stretch` [binary search]
This ftw_fit() method uses CSS `font-stretch`, which is expected to be the standard method of adjusting width in variable fonts. Browsers implementing the property inherit just the `wdth` axis setting, so weight applied using other CSS will also be respected.

There are two significant disadvantages in using CSS font-stretch now, however:

1. Although CSS `font-stretch` is working in Safari it is not supported in Chrome (2018-06), so cross-platform code must use CSS `font-variation-settings`. The `font-variation-settings:wdth` method is implemented in ftw_fit() for this purpose.

2. CSS font-stretch uses % units, where 100% is normal width, 50% is a notional half-width, and 200% is a notional double width font. According to the [OpenType specification](https://docs.microsoft.com/en-us/typography/opentype/spec/dvaraxistag_wdth), these values are supposed to come directly from `wdth` axis coordinates. Unfortunately, many existing variable fonts use `wdth` axis values which do not make sense as percentages; the range 0 to 1000 is common, and negative values are also seen. Such non-compliant values are not handled well by browsers. Default min and max are 0.00001 and 32767.99998. Note that values of `font-stretch` <= 0 are invalid.

#### `font-variation-settings:wdth` [binary search]

This ftw_fit() method uses the low-level CSS `font-variation-settings` property. It works on all browser platforms where variable fonts are supported. Care must be taken because it overrides axis settings made elsewhere, for example an initial or inherited `wght` axis setting. See the `axes` method property for a way to specify other axes. Default min and max are -32768 and 32767.99998 (the extremes of the Fixed 16.16 representation).

#### `word-spacing` [binary search]

This ftw_fit() method uses CSS `word-spacing` to make the text fit the container. Default min and max are -0.2 and 20.

#### `letter-spacing` [binary search]

This ftw_fit() method uses CSS `letter-spacing` to make the text fit the container. Default min and max are -0.05 and 1.

#### `transform`

This ftw_fit() method uses CSS `transform:scale(n,1)`, where `n` is the scale by which the element must be stretched (>1) or squashed (<1) to fit the container. There are no other properties.

#### `ligatures`

Not ready for use. This method always applies `font-variation-settings:'dlig' 1,'liga' 1`.

#### Method properties
* `min` is the minimum value to be used in the binary search. If you don’t want `wdth` axis values below a certain value, specify it here. If you know the minimum width axis value, specify it here to save a few iterations.
* `max` is the maximum value to be used in the binary search. If you don’t want `wdth` axis values above a certain value, specify it here. If you know the maximum width axis value, specify it here to save a few iterations.
* `maxDiff` is the largest difference, measured in px units, from the targetWidth that we accept before proceeding to the next operation. Default is 1.
* `maxIterations` is the number of tests we perform before giving up. Default is 50.
* `axes` (used only in the `font-variation-settings:wdth` method) specifies axis locations other than `wdth`. These get appended to the `font-variation-settings` CSS. For example, if you want to run ftw_fit() while keeping `wght` at 788 and `opsz` at 36, then specify `axes:"'wght' 788, 'opsz' 36"`. You might use `getComputedStyle()` to find current weight, in order to use an inherited or initial weight of the element.


#### Examples of values for the operations parameter

* `["font-variation-settings:wdth", "transform"]` (default, so you can omit it if you want this)
* `[{method:"font-stretch",min: 0.61998, max: 1.3}]` (setting min and max to the min and max of the font’s weight axis helps it converge more quickly)
* `[{method:"font-variation-settings:wdth", axes:"'wght' 280, 'opsz' 22"}]` (keep `wght` axis at 280 and `opsz` axis at 22 while adjusting the `wdth` axis)

### _targetWidth_

The optional `targetWidth` parameter is used to set a pixel width for the element. Default is to use the current width of the elements.

**Be careful not to apply `ftw_fit()` on elements of `auto` width.**

## Return value

Returns an object which has properties:
* `elapsedTime`: the total time in ms
* `operations`: the operations used to adjust elements

## Simple example

```

<style>
.ftw {
  font-family: Gimlet-Roman;
  font-size: 72px;
  width: 400px;
}
</style>

<div class="ftw">
Here is 
</div>
<div class="ftw">
Here is more
</div>
<div class="ftw">
Here is yet more text
</div>

<script>
ftw_fit(".ftw");
</script>

```


## Advanced example

```
<style>
.myftwclass {
  width: 600px;
}
</style>

<div class="myftwclass">
Here is a more advanced example
</div>

<script>
ftw_fit(".myftwclass", [{method:"font-variation-settings:wdth", min: 0.6, max: 600},"letter-spacing","transform"]);
</script>
```
This will first attempt to fit using font-variation-settings, then try letter-spacing, then finally (if those still have not fit the text) transform.

## Performance

Performance is good since it uses binary search on `font-stretch` and `letter-spacing`. Iterations are limited to 50, in case the algorithm fails to converge. The alrogithm typically converges in 7 to 9 iterations.

## Issues

* Sometimes the font is not ready in time for a container’s `clientWidth` to be measured. Reloading usually solves the problem, but 
a solution is needed.

* Currently (2018-06) only Safari supports `font-stretch`. You must use the `font-variation-settings:wdth` method for Chrome.

* Unfortunately, in many browsers letter-spacing is added to glyphs even when a glyph is last on a line. This is typographically incorrect and [the CSS specification is clear](https://drafts.csswg.org/css-text-3/#letter-spacing-property): “Letter-spacing must not be applied at the beginning or at the end of a line”.

* Glyph sidebearings mean that lines of large font-size or large font-width do not align precisely with lines of small font-size or large font-width. It could be a good idea to add customization for this, but it would probably have to be tuned for each font.

* On macOS, system variable fonts (Skia and SF) when specified by `font-family`, do not properly clamp axis values to their minimum and maximum. A `wdth` axis setting of -32768 is valid in CSS, but it reverts to default width in Skia. To use system Skia and SF, be sure to specify axis extrema, as in `ftw_fit(".ftw", [{method: "font-variation-settings:wdth", min: 0.61998, max: 1.3}])`.

## Similar projects

* [FitText](http://fittextjs.com), a jQuery plugin by [Paravel](https://paravelinc.com) that adjusts CSS font-size to make text fit a given width.

* [FitText.js](https://github.com/adactio/FitText.js), a tiny JavaScript library by [Jeremy Keith](https://github.com/adactio) that does the same thing as FitText but without the jQuery dependency.

* [Fitty](https://www.npmjs.com/package/fitty) by [Bram Stein](https://github.com/bramstein).

* [typeset](https://github.com/bramstein/typeset) by [Bram Stein](https://github.com/bramstein), the TeX line breaking algorithm in JavaScript. This scales each line horizontally by a different amount to reduce whitespace caused by justification.
