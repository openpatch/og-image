import { readFileSync } from "fs";
import marked from "marked";
import { sanitizeHtml } from "./sanitizer";
import { ParsedRequest } from "./types";
const twemoji = require("twemoji");
const twOptions = { folder: "svg", ext: ".svg" };
const emojify = (text: string) => twemoji.parse(text, twOptions);

const rglr = readFileSync(
  `${__dirname}/../_fonts/Inter-Regular.woff2`
).toString("base64");
const bold = readFileSync(`${__dirname}/../_fonts/Inter-Bold.woff2`).toString(
  "base64"
);
const mono = readFileSync(`${__dirname}/../_fonts/Vera-Mono.woff2`).toString(
  "base64"
);
const pattern = readFileSync(`${__dirname}/../_images/pattern.png`).toString(
  "base64"
);

function getCss(theme: string, fontSize: string) {
  let primary = "#006f95";
  let secondary = "#98ff98";

  let background = "white";
  let foreground = primary;
  let radial = secondary;

  if (theme === "dark") {
    background = "#303030";
    radial = secondary;
    foreground = "white";
  }
  return `
    @font-face {
        font-family: 'Inter';
        font-style:  normal;
        font-weight: normal;
        src: url(data:font/woff2;charset=utf-8;base64,${rglr}) format('woff2');
    }

    @font-face {
        font-family: 'Inter';
        font-style:  normal;
        font-weight: bold;
        src: url(data:font/woff2;charset=utf-8;base64,${bold}) format('woff2');
    }

    @font-face {
        font-family: 'Vera';
        font-style: normal;
        font-weight: normal;
        src: url(data:font/woff2;charset=utf-8;base64,${mono})  format("woff2");
      }

    body {
        background: ${background};
        background-image: radial-gradient(circle at 25px 25px, ${radial} 2%, transparent 0%), radial-gradient(circle at 75px 75px, ${radial} 2%, transparent 0%);
        background-image: url(data:image/png;base64,${pattern});
        height: 100vh;
        display: flex;
        text-align: center;
        align-items: center;
        justify-content: center;
    }

    code {
        color: #D400FF;
        font-family: 'Vera';
        white-space: pre-wrap;
        letter-spacing: -5px;
    }

    code:before, code:after {
        content: '\`';
    }

    .logo-wrapper {
        position: absolute;
        right: 50px;
        bottom: 50px;
        display: flex;
        align-items: center;
        align-content: center;
        justify-content: center;
        justify-items: center;
    }

    .logo {
        margin: 0 75px;
    }

    .plus {
        color: #BBB;
        font-family: Times New Roman, Verdana;
        font-size: 100px;
    }

    .emoji {
        height: 1em;
        width: 1em;
        margin: 0 .05em 0 .1em;
        vertical-align: -0.1em;
    }

    .username {
        font-family: 'Inter', sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        left: 50px;
        bottom: 50px;
        font-size: 60px;
        color: ${foreground};

    }

    .username > img {
        border-radius: 50%;
        margin-right: 50px;
    }
    
    .heading {
        font-family: 'Inter', sans-serif;
        font-size: ${sanitizeHtml(fontSize)};
        font-style: normal;
        color: ${foreground};
        line-height: 1.8;
        background-color: ${background};
        border-top: 2px solid ${primary};
        border-bottom: 2px solid ${primary};
        width: 100%;
    }`;
}

export function getHtml(parsedReq: ParsedRequest) {
  const {
    username,
    avatar,
    text,
    theme,
    md,
    fontSize,
    images,
    widths,
    heights,
  } = parsedReq;
  return `<!DOCTYPE html>
<html>
    <meta charset="utf-8">
    <title>Generated Image</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        ${getCss(theme, fontSize)}
    </style>
    <body>
            <div class="logo-wrapper">
                ${images
                  .map(
                    (img, i) =>
                      getPlusSign(i) + getImage(img, widths[i], heights[i])
                  )
                  .join("")}
            </div>
            <div class="heading">${emojify(
              md ? marked(text) : sanitizeHtml(text)
            )}
            </div>
            ${
              username
                ? `<div class="username">
                ${avatar ? getImage(avatar) : "<div></div>"}
                ${username}</div>`
                : "<div></div>"
            }
    </body>
</html>`;
}

const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
function isBase64(str: string): boolean {
  return base64regex.test(str);
}

function getImage(src: string, width = "auto", height = "120") {
  return `<img
        class="logo"
        alt="Generated Image"
        src="${
          isBase64(src) ? `data:image/png;base64, ${src}` : sanitizeHtml(src)
        }"
        width="${sanitizeHtml(width)}"
        height="${sanitizeHtml(height)}"
    />`;
}

function getPlusSign(i: number) {
  return i === 0 ? "" : '<div class="plus">+</div>';
}
