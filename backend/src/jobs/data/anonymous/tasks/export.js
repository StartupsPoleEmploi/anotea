module.exports = db => {
    return new Promise((resolve, reject) => {
        const s = require('string');
    
        let stream = db.collection('trainee').find().stream();
    
        const contains = (keyword, content) => {
            const normalizedKeyword = keyword.toLowerCase();
            const normalizedContent = content.toLowerCase();
            return normalizedContent.indexOf(normalizedKeyword) !== -1;
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

        const containsId = content => {
            const re = new RegExp('[0-9]{7}[A-Z0-9]', 'gi');
            return content.match(re);
        };

        const removeId = content => {
            const re = new RegExp('[0-9]{7}[A-Z0-9]', 'gi');
            return content.replace(re, '');
        };


        const tailWords = ['mme', 'mr', 'de ', 'csp', 'aif'];
        const tailSigns = ['-', '(', ')', '/'];

        const removeTail = content => {
            tailWords.forEach(tailWord => {
                content = removeAll(tailWord, content, true);
            });
            tailSigns.forEach(tailWord => {
                content = removeAll(tailWord, content, false);
            });
            return content.trim();
        };

        stream.on('data', trainee => {
            const title = trainee.training.title;
            const firstName = trainee.trainee.firstName;
            const name = trainee.trainee.name;
            let anonymizedTitle = trainee.training.title;
            let changeDetected = false;

            // Looking for first name : we add an extra space to avoid wrong replacement like 'MARC' in 'CAP MARCHANDISE' => 'CAP ANDISE'
            // First name are almost every time followed by an extra space
            if (firstName.length > 0 && contains(firstName + ' ', title)) {
                changeDetected = true;
                anonymizedTitle = anonymizeTitle(firstName + ' ', title);
            }

            if (name.length > 0 && contains(name, anonymizedTitle)) {
                changeDetected = true;
                anonymizedTitle = anonymizeTitle(name, anonymizedTitle);
            }

            if (containsId(anonymizedTitle)) {
                changeDetected = true;
                anonymizedTitle = removeId(anonymizedTitle);
            }


            if (changeDetected) {
                anonymizedTitle = removeTail(anonymizedTitle);
                console.log(`${firstName};${name};${title};${anonymizedTitle}`);
            }
        });

        stream.on('error', () => {
            reject();
        });

        stream.on('end', () => {
            resolve();
        });
    });
};
