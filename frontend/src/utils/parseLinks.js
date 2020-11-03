const parseLinks = (pith) => {
    return [...pith.matchAll(/(?<=<cite>).*?(?=<\/cite>)/g)];
};
const splitAtLinks = (pith) => {
    const s = pith.split(/(?<=<cite>).*?(?=<\/cite>)/g);
    return s.map((p) => {
        const r = p.replace("<cite>", "");
        return r.replace("</cite>", "");
    });
};
export { parseLinks, splitAtLinks };
