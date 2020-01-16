function exists(arr, search) {
	return arr.some(a => search.every((v, i) => v === a[i]));
}