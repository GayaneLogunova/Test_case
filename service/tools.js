function range(start, count) {
    let i = start;
    let arr = [];
    while (i - start < count) { arr.push(i++) }

    return arr;
}

module.exports = range;