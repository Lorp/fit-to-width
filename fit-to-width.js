// fit-to-width.js


/* 

Fits text to the width of its DOM container using various methods.

The core function is ftw_fit(), to which you pass a DOM element or an array of DOM elements. This applies various width adjustment methods, until either succeeding or giving up. Default (which is easily configurable) is to first try CSS font-stretch, then CSS letter-spacing, then finally CSS transform.


*/

// default config
ftwConfigDefault = {
	methods: ["font-stretch", "letter-spacing", "transform"],
	maxIterations: 50,
	maxDiff: 1,
	minWdth: 0.00001,
	maxWdth: 0x8000 - 1/0x10000,
	minLetterSpacing: -0.05,
	maxLetterSpacing: 1,
	results: []
}


// function to check if iterable
const ftw_ArgIsIterable = object => object != null && typeof object[Symbol.iterator] === 'function';


// main function
function ftw_fit (elements, ftwConfigUser) {

	let startTime = performance.now();
	let thisConfig = ftwConfigDefault;
	let els;

	// if so, call the function for each object
	if (ftw_ArgIsIterable(elements)) {
		// ftw_fit();

		els = elements;
	}
	else
		els = [elements]; // convert to an array

	// user config?
	if (ftwConfigUser)
	{
		if (ftwConfigUser && ftwConfigUser.minWdth !== undefined)
			thisConfig.minWdth = ftwConfigUser.minWdth;

		if (ftwConfigUser && ftwConfigUser.maxWdth !== undefined)
			thisConfig.maxWdth = ftwConfigUser.maxWdth;

		if (ftwConfigUser && ftwConfigUser.methods !== undefined)
			thisConfig.methods = ftwConfigUser.methods;
	}

	// for each element supplied by the user
	for (let e=0; e<els.length; e++)
	{
		thisConfig.e = e;
		el=els[e];
		thisConfig.results[e] = {};
		thisConfig.targetWidth = el.clientWidth;
		let targetWidth = thisConfig.targetWidth;

		el.style.whiteSpace = "nowrap";
		el.style.width = "max-content";

		for (let m=0; m<thisConfig.methods.length; m++) {
			let method = thisConfig.methods[m];
			if (thisConfig.results[e].success)
				break;

			switch (method) {
				case "font-stretch": ftw_fit_wdth (el, thisConfig); break;
				case "letter-spacing": ftw_fit_letterSpacing (el, thisConfig); break;
				case "transform": ftw_fit_transform (el, thisConfig); break;
			}
		}

		// reset element width
		el.style.width = targetWidth+"px"; // TODO: revert it to its original calculated width, e.g. "10em"?
	}

	// performance check
	thisConfig.elapsedTime = performance.now() - startTime;
	console.log ("RESULTS");
	console.log (thisConfig);
}



function ftw_fit_wdth (el, thisConfig) {
	let targetWidth = thisConfig.targetWidth;
	let e = thisConfig.e;
	let done = false;
	let iterations = 0;
	let minWdth = thisConfig.minWdth;
	let maxWdth = thisConfig.maxWdth;
	let wdth;

	// check it’s above the min
	el.style.fontStretch = minWdth + "%";
	if (el.clientWidth > targetWidth) {
		thisConfig.results[e].wdth = "FAIL: min>targetWidth";
		done = true;
	}
	else {
		// check it’s below the max
		el.style.fontStretch = maxWdth + "%";
		if (el.clientWidth < targetWidth) {
			thisConfig.results[e].wdth = "FAIL: max<targetWidth";
			done = true;
		}
	}

	while (!done) {

		wdth = 0.5 * (minWdth+maxWdth);
		el.style.fontStretch = wdth + "%";

		let diff = el.clientWidth - targetWidth;
		if (diff < 0) {
			if (diff > -thisConfig.maxDiff) {
				thisConfig.results[e].wdth = "SUCCESS: <1px";
				thisConfig.results[e].success = "wght";
				done = true;
			}
			else
				minWdth = wdth; // binary search, too low
		}
		else if (diff > 0)
			maxWdth = wdth; // binary search, too high
		else { // diff == 0, el.clientWidth == targetWidth
			thisConfig.results[e].wdth = "SUCCESS: exact!";
			thisConfig.results[e].success = "wght";
			done = true; // we’re lucky!
		}

		// next iteration
		iterations++;
		if (iterations >= thisConfig.maxIterations) {
			thisConfig.results[e].wdth = "FAIL: wght did not converge (diff=" + diff +")";
			done = true;

			if (diff>0) // better to leave the element at minWdth rather than > targetWidth
				el.style.fontStretch = minWdth + "%";
		}
	}

	thisConfig.results[e].iterations = iterations;
	thisConfig.done = done;
}


function ftw_fit_letterSpacing (el, thisConfig) {
	let targetWidth = thisConfig.targetWidth;
	let e = thisConfig.e;
	let done = false;
	let iterations = 0;
	let minLS = thisConfig.minLetterSpacing;
	let maxLS = thisConfig.maxLetterSpacing;
	let ls;

	// check it’s above the min
	el.style.letterSpacing = minLS + "em";
	if (el.clientWidth > targetWidth) {
		thisConfig.results[e].letterSpacing = "FAIL: minLetterSpacing>targetWidth";
		done = true;
	}
	else {
		// check it’s below the max
		el.style.letterSpacing = maxLS + "em";
		if (el.clientWidth < targetWidth) {
			thisConfig.results[e].letterSpacing = "FAIL: maxLetterSpacing<targetWidth";
			done = true;
		}
	}

	while (!done) {

		ls = 0.5 * (minLS+maxLS);

		// set the letterSpacing
		el.style.letterSpacing = ls + "em";

		let diff = el.clientWidth - targetWidth;
		if (diff < 0) {
			// within 1 pixel?
			if (diff > -thisConfig.maxDiff) {
				thisConfig.results[e].letterSpacing = "SUCCESS: <1px";
				thisConfig.results[e].success = "letter-space";
				done = true;
			}
			else
				minLS = ls;
		}
		else if (diff > 0)
			maxLS = ls;
		else { // el.clientWidth == targetWidth, diff == 0
			thisConfig.results[e].letterSpacing = "SUCCESS: exact!";
			thisConfig.results[e].success = "letter-space";
			done = true; // we’re lucky!
		}

		// next iteration
		iterations++;
		if (iterations >= thisConfig.maxIterations) {
			thisConfig.results[e].letterSpacing = "FAIL: letter-spacing did not converge (diff=" + diff +")";
			done = true;

			if (diff>0) // better to leave the element at minWdth rather than > targetWidth
				el.style.letterSpacing = minLS + "em";
		}
	}
}


function ftw_fit_transform (el, thisConfig) {
	let targetWidth = thisConfig.targetWidth;
	let e = thisConfig.e;
	el.style.transformOrigin = "left";
	el.style.transform = "scale(" + (thisConfig.targetWidth / el.clientWidth) + ",1)";
}


function ftw_fit_ligatures (el, thisConfig) {
	let targetWidth = thisConfig.targetWidth;
	let e = thisConfig.e;
	el.style.fontFeatureSettings = "'liga' 1, 'dlig' 1";

	// TODO
	// Adjust the width using other methods
	// Normally we would only apply ligatures when we want to reduce width.
}

