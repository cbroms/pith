function saveValue(val, data) {
	localStorage.setItem(val, JSON.stringify(data));
}

function setValue(val, data) {
	localStorage.setItem(val, JSON.stringify(data));
}

function getValue(val) {
	const res = localStorage.getItem(val);

	if (res !== undefined && res !== null) return JSON.parse(res);

	return null;
}

export { saveValue, setValue, getValue };
