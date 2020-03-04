const sanitizeHtml = require('sanitize-html');
const emojiStrip = require('emoji-strip');

const unescapeHTML = html => {
    return String(html)
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&#x3A;/g, ':')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
};

module.exports = {
    sanitize: text => {

        if (!text) {
            return text;
        }

        let noHtmlTags = sanitizeHtml(unescapeHTML(text), { allowedTags: [] });
        let noEmoji = emojiStrip(noHtmlTags);
        return noEmoji.trim();
    }
};
