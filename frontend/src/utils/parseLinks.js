const parseLinks = (pith) => {
    return [...pith.matchAll(/(?<=<cite>).*?(?=<\/cite>)/g)];
};
const splitAtLinks = (pith) => {
    return pith.split(/(?<=<cite>).*?(?=<\/cite>)/g);
};
export { parseLinks, splitAtLinks };
