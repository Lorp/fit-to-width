# fit-to-width.js

fit-to-width.js is a small JavaScript library for fitting text into text containers in a typographically sensitive way, using standard CSS.
To use the library, include the script at the top of your web page, then when your page is ready, call `ftw_fit()`.

## Background
The term “fit to width” is the adjustment of typographic parameters so that a given text fits into a given text container.
Various operations we could in theory perform are:

* adjust font width (CSS `font-stretch`), ideally using a variable `wdth` axis
* adjust tracking (CSS `letter-spacing`)
* enable discretionary ligatures (CSS `font-feature-settings: 'dlig' 1`), hoping for narrower combined forms
* scale horizontally (CSS `transform:scale(<scale-factor>,1)`)
* adjust font size (CSS `font-size`)

By default the ftw_fit() function uses the following methods in this order:
* `font-stretch`
* `letter-spacing`
* `transform`

## Parameters
1. The elements to be processed. They can be selected in four ways:
  * `undefined`: all elements of class `ftw`
  * `<string>`: all elements of class `<string>`
  * <DOM element>: a single DOM element to process
  * [<DOM element>,…]: an array of DOM elements to process
2. A configuration array with parameters:
  * `methods`: an array of the methods to use in sequence e.g. `["letter-spacing","font-stretch","transform"]`
  * `minWdth`: the minimum value for `font-stretch`
  * `maxWdth`: the minimum value for `font-stretch`
  
Specifying minWdth and maxWdth reduces the number of binary search iterations for the font-stretch method. It’s a good idea to specify them to be equal to the 
`wdth` axis minimum and maximum.

## Return value
None

## Simple example

```

<style>
.ftw {
  width: 600px;
}
</style>

<div class="ftw">
Here is 
</div>
<div class="ftw">
Here is more
</div>
<div class="ftw">
Here is more textyyy and again
</div>

<script>
ftw_fit();
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
ftw_fit("myftwclass", {methods: ["letter-spacing","font-stretch","transform"]});
</script>
```
This will first attempt to fit using letter-spacing, then try font-stretch, then finally (if those still have not fit the text) transform.

## Advantages of font-stretch

* We can adjust the `wdth` axis without affecting other axes, so any inherited weight setting
(whether set via `font-weight` or `font-variation-settings`) will be preserved.

## Drawbacks of font-stretch

* Currently (2018-06) only Safari supports `font-stretch`.
* Fonts with a `wdth` axis that is not built to spec sometimes behave unpredictably.

## font-variation-settings

It is quite possible to write fit-to-width functions using `font-variation-settings`. Indeed the [Axis-Praxis fit-to-width](https://www.axis-praxis.org/playground/) demos all use 
font-variation-settings. It would be add handling for font-variation-settings, ideally while not affecting other axis values.

## Performance

Performance is good since it uses binary search on `font-stretch` and `letter-spacing`. Iterations are limited to 50, in case the algorithm fails to converge.

## Bugs

Sometimes the font is not ready in time for a container’s `clientWidth` to be measured. Reloading usually solves the problem, but 
a solution is needed.
