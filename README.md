# fit-to-width.js

fit-to-width.js is a small JavaScript library for fitting text into text containers in a typographically sensitive way, using standard CSS. To use the library, include the script at the top of your web page, then when your page and fonts are loaded, call `ftw_fit()`.

## Background
The term “fit to width” here refers to the adjustment of typographic parameters so that a given text fits into the width of a given text container on a single line. Here is a list of typographic adjustments, along the CSS used to control it.

| Typographic adjustment | CSS | Implemented |
|------------------|------------------------|------|
| tracking         | `letter-spacing`       | ✓    |
| font width       | `font-stretch`         | ✓    |
| font width       | `font-variation-settings: 'wdth' <nnn>` |      |
| horizontal scale | `transform:scale(<scale-factor>,1)`) | ✓    |
| font size        | `font-size`            |      |
| word spacing     | `word-spacing`         |      |
| enable ligatures | `font-feature-settings: 'dlig' <0/1>, 'liga' <0/1>` |      |

By default the ftw_fit() function uses the following methods in this order:
* `font-stretch`
* `letter-spacing`
* `transform`

## Parameters

`ftw_fit ([ <elements> [, <config> ]])`

### `elements`

The DOM elements we should process, for example those returned by `document.getElementsByClassName()` or jQuery’s `$()`. It can also take a single element, for example that returned by `document.getElementById()`.

If `elements` is a string, it uses an array of all DOM elements of the class with that name.

If `elements` is undefined, it defaults to an array of all DOM elements of class `fit`. This is the simplest way to use ftw_fit(): just give your elements the class `fit` and then call ftw_fit().

### `config`

The `config` object is used to customize the operation of ftw_fit(). It has the following properties:

  * `methods`: a sequence of the methods to use, default =  `["font-stretch","letter-spacing","transform"]`
  * `minWdth`: the minimum value for `font-stretch`, default = 0.00001 (negative font-stretch is not allowed),
  * `maxWdth`: the maximum value for `font-stretch`, default = 0x8000 - 1/0x10000
  
Specifying minWdth and maxWdth reduces the number of binary search iterations for the font-stretch method. It’s a good idea to specify them to be equal to the  `wdth` axis minimum and maximum.

## Return value

None, but the `config` object will contain a `results` property that, for each method in the sequence, records success/failure and the number of iterations.

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
font-variation-settings. It would be good to add handling for font-variation-settings, ideally while not affecting other axis values.

## Performance

Performance is good since it uses binary search on `font-stretch` and `letter-spacing`. Iterations are limited to 50, in case the algorithm fails to converge. The alrogithm typically converges in 7 to 9 iterations.

## Issues

* Sometimes the font is not ready in time for a container’s `clientWidth` to be measured. Reloading usually solves the problem, but 
a solution is needed.

* Unfortunately, letter-spacing is added to glyphs even if that glyph is last on a line. This means that when significant letter-spacing is used, we get white space, when we would prefer more letter-space and text aligning with the right margin.

* Glyph sidebearings mean that lines of large font-size or large font-width do not align precisely with lines of small font-size or large font-width. It could be a good idea to add customization for this, but it would probably have to be tuned for each font.
