function decode(text) {
    for (let mapping of translator) {
        text = text.replaceAll(mapping[0], mapping[1]);
    }

    return text;
}

const translator = [
    ["&quot;", `"`],
    ["&#92;n", `\n`]
];