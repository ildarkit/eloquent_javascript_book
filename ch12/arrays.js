topScope.array = (...values) => {
    return Array.from(values);
};

topScope.length = array => {
return array.length;
};

topScope.element = (array, n) => {
return array[n];
};

run(`
do(define(sum, fun(array,
    do(define(i, 0),
        define(sum, 0),
        while(<(i, length(array)),
        do(define(sum, +(sum, element(array, i))),
            define(i, +(i, 1)))),
        sum))),
    print(sum(array(1, 2, 3))))
`);
// → 6