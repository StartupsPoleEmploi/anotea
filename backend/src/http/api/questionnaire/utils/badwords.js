const _ = require("lodash");
const path = require("path");
const { promisify } = require("util");
const fs = require("fs");
const readFile = promisify(fs.readFile);

module.exports = () => {

    let dictionnary = readFile(path.join(__dirname, "badwords.txt"))
    .then(content => {
        let raw = content.toString();
        return raw.split("\n").filter(value => !_.isEmpty(value));
    });

    return {
        isGood: async value => {

            if (value === null || value === undefined) {
                return false;
            }

            let dico = await dictionnary;
            return value === "" || !_.some(dico, word => value.match(new RegExp(`\\b${word}\\b`, "gi")));
        }
    };
};
