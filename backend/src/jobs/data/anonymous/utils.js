const accents = require('remove-accents');

module.exports = () => {

    const contains = (keyword, content) => {
        const normalizedKeyword = keyword.toLowerCase();
        const normalizedContent = content.toLowerCase();
        return normalizedContent.indexOf(normalizedKeyword) !== -1;
    };

    const containsWord = (word, content) => {
        const re = new RegExp(word + '([^a-z]|$)', 'gi');
        return content.match(re);
    };

    const removeAll = (word, str, regex) => {
        if (regex) {
            const re = new RegExp(word, 'gi');
            str = str.replace(re, '');
        } else {
            str = str.replace(word, '');
        }

        if (contains(word, str)) {
            str = removeAll(word, str, regex);
        }
        return str;
    };

    const anonymizeTitle = (keyword, content) => {
        const normalizedKeyword = keyword.toLowerCase();
        let anonymizedTitle = removeAll(keyword, content, true);
        anonymizedTitle = removeAll(normalizedKeyword, content, true);
        return anonymizedTitle;
    };

    const reID = new RegExp('(^|[^0-9])[0-9]{7}\\s?[A-Z0-9]([^0-9]|$)', 'gi');

    const containsId = content => {
        return content.match(reID);
    };

    const removeId = content => {
        return content.replace(reID, '');
    };

    const tailWords = ['mme', 'mr', 'csp', 'aif'];
    const tailSigns = ['-', '(', ')', '/', '*', '.'];

    const removeTail = content => {
        tailWords.forEach(tailWord => {
            content = removeAll(tailWord, content, true);
        });
        tailSigns.forEach(tailWord => {
            content = removeAll(tailWord, content, false);
        });
        return content.trim();
    };

    const normalize = str => accents.remove(str).toUpperCase();

    const getAnonymizedTitle = trainee => {
        const title = trainee.training.title;
        const firstName = trainee.trainee.firstName;
        const name = trainee.trainee.name;
        let anonymizedTitle = normalize(title);
        let changeDetected = false;

        if (firstName.length > 2 && containsWord(firstName, anonymizedTitle)) {
            changeDetected = true;
            anonymizedTitle = anonymizeTitle(firstName, anonymizedTitle);
        }

        if (name.length > 2 && containsWord(name, anonymizedTitle)) {
            changeDetected = true;
            anonymizedTitle = anonymizeTitle(name, anonymizedTitle);
        }

        if (containsId(anonymizedTitle)) {
            changeDetected = true;
            anonymizedTitle = removeId(anonymizedTitle);
        }

        if (changeDetected) {
            anonymizedTitle = removeTail(anonymizedTitle);
        }

        return { changeDetected, anonymizedTitle };
    };


    return {
        getAnonymizedTitle: getAnonymizedTitle
    };
};
