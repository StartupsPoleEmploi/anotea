const crypto = require("crypto");
const uuid = require("node-uuid");
const configuration = require("config");
const path = require("path");
const moment = require("moment");

let getCampaignName = file => {
    const filename = path.basename(file);
    return filename.substring(0, filename.length - 4);
};

module.exports = {
    buildToken: email => {
        return crypto.createHmac("sha256", configuration.security.secret)
        .update(email + uuid.v4())
        .digest("hex");
    },
    buildEmail: data => {
        try {
            let email = data.toLowerCase();
            return {
                email: email,
                mailDomain: email.split("@")[1],
            };
        } catch (e) {
            return {
                email: null,
                mailDomain: null,
            };
        }
    },
    getCampaignName,
    getCampaignDate: file => {
        const name = getCampaignName(file);
        let array = name.split("_");
        let dateAsString = array[array.length - 1];
        let date = new Date(dateAsString);
        return moment(date).isValid() ? date : new Date();
    },
    sanitizeCsvLine: line => {
        let keys = Object.keys(line);
        return keys.reduce((acc, key) => {
            let value = line[key];
            return {
                ...acc,
                [key]: value === "NULL" ? "" : value,
            };
        }, {});
    },
};
