import { unescape } from "html-escaper";

const getDecodedLengthOfPith = (pith) => {
	// return the position without any html encoded chars
	if (pith.includes("<br>")) {
		return unescape(pith.replace("<br>", "")).length;
	}
	return unescape(pith).length;
};

export { getDecodedLengthOfPith };
