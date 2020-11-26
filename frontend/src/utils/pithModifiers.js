import { unescape } from "html-escaper";

const getDecodedLengthOfPith = (pith) => {
	// return the position without any html encoded chars
	if (pith.includes("<br>") || pith.includes("&nbsp;")) {
		return unescape(pith.replace("<br>", "").replace("&nbsp;", " ")).length;
	}
	return unescape(pith).length;
};

const addHighlight = (pith, highlight) => {
	let newPith = pith;

	// find all matches of the highlight string and add mark tags around them
	const addHighlightToSubstring = (pith, highlight) => {
		const regex = new RegExp(highlight, "gi");
		const matches = pith.matchAll(regex);

		let addedChars = 0;
		for (const match of matches) {
			let start = match.index + addedChars;
			pith = [
				pith.slice(0, start),
				"<mark>",
				pith.slice(start, start + match[0].length),
				"</mark>",
				pith.slice(start + match[0].length),
			].join("");
			addedChars += 13;
		}
		return pith;
	};

	// first, highlight the full matches
	newPith = addHighlightToSubstring(pith, highlight);

	if (pith === newPith) {
		// try breaking apart the search pieces
		const pieces = highlight.split(" ");

		for (const piece of pieces) {
			newPith = addHighlightToSubstring(newPith, piece);
		}
	}

	return newPith;
};

const createCitation = (id) => {
	return "<cite>" + id + "</cite>&nbsp;";
};
export { getDecodedLengthOfPith, createCitation, addHighlight };
