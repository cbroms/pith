function setValue(val, data) {
	localStorage.setItem(val, JSON.stringify(data));
}

function getValue(val) {
	const res = localStorage.getItem(val);

	try {
		return JSON.parse(res);
	} catch {
		return null;
	}
}

export { setValue, getValue };
