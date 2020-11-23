import { unescape } from "html-escaper";

const getDecodedLengthOfPith = (pith) => {
	// return the position without any html encoded chars
	if (pith.includes("<br>") || pith.includes("&nbsp;")) {
		return unescape(pith.replace("<br>", "").replace("&nbsp;", " ")).length;
	}
	return unescape(pith).length;
};

const addHighlight = (pith, highlight) => {
	const ind = pith.toLowerCase().indexOf(highlight.toLowerCase());
	if (ind > -1) {
		return [
			pith.slice(0, ind),
			"<mark>",
			pith.slice(ind, ind + highlight.length),
			"</mark>",
			pith.slice(ind + highlight.length),
		].join("");
	}
};

const createCitation = (id) => {
	return "<cite>" + id + "</cite>&nbsp;";
};
export { getDecodedLengthOfPith, createCitation, addHighlight };
