import { unescape } from "html-escaper";

const getDecodedLengthOfPith = (pith) => {
	// return the position without any html encoded chars
	if (pith.includes("<br>")) {
		return unescape(pith.replace("<br>", "")).length;
	}
	return unescape(pith).length;
};

const addHighlight = (pith, highlight) => {
	const ind = pith.indexOf(highlight);
	if (ind > -1) {
		return [
			pith.slice(0, ind),
			"<mark>",
			highlight,
			"</mark>",
			pith.slice(ind + highlight.length),
		].join("");
	}
};

const createCitation = (id) => {
	return "<cite>" + id + "</cite>&nbsp;<br>";
};
export { getDecodedLengthOfPith, createCitation, addHighlight };
