'use strict';

/**
 * A marked extension that renders GitHub-style alerts as Bootstrap cards with colored borders.
 *
 * @see https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts
 *
 * > [!NOTE]
 * > Useful information that users should know, even when skimming content.
 */

const ALERT_TYPES = {
    note: {title: 'Note', color: 'info', icon: 'fa-circle-info'},
    tip: {title: 'Tip', color: 'success', icon: 'fa-lightbulb'},
    important: {title: 'Important', color: 'primary', icon: 'fa-message-exclamation'},
    warning: {title: 'Warning', color: 'warning', icon: 'fa-triangle-exclamation'},
    caution: {title: 'Caution', color: 'danger', icon: 'fa-octagon-exclamation'},
};

const typesPattern = Object.keys(ALERT_TYPES).join('|');
// The first line of the blockquote must be exactly the alert marker, then every following line must be quoted.
// The marker's opening bracket may be escaped, because remark-stringify (used by plugins such as
// metalsmith-mermaid, metalsmith-vega, and metalsmith-highlightjs) rewrites `[!NOTE]` as `\[!NOTE]`.
const alertRegex = new RegExp(
    `^ {0,3}> ?\\\\?\\[!(${typesPattern})\\][ \\t]*(?:\\n|$)((?: {0,3}>[^\\n]*(?:\\n|$))*)`,
    'i',
);

export default (overrides = {}) => {
    const types = Object.fromEntries(Object.entries(ALERT_TYPES)
        .map(([type, options]) => [type, {...options, ...overrides[type]}]));

    return {
        extensions: [{
            name: 'alert',
            level: 'block',
            start(src) {
                return src.match(new RegExp(` {0,3}> ?\\\\?\\[!(?:${typesPattern})\\]`, 'i'))?.index;
            },
            tokenizer(src) {
                const match = alertRegex.exec(src);
                if (!match) {
                    return undefined;
                }

                const text = match[2]
                    .split('\n')
                    .map(line => line.replace(/^ {0,3}> ?/, ''))
                    .join('\n');

                return {
                    type: 'alert',
                    raw: match[0],
                    alertType: match[1].toLowerCase(),
                    text,
                    tokens: this.lexer.blockTokens(text, []),
                };
            },
            renderer(token) {
                const {title, color, icon} = types[token.alertType];
                return `<div class="card border-${color} my-3 my-sm-4">
<div class="card-header"><i class="fa-regular ${icon} text-${color}" aria-hidden="true"></i> ${title}</div>
<div class="card-body">${this.parser.parse(token.tokens)}</div>
</div>\n`;
            },
        }],
    };
};
