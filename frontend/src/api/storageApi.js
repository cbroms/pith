function setValue(val, data) {
	localStorage.setItem(val, JSON.stringify(data));
	console.log(localStorage.getItem(val));
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
