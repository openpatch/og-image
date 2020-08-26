import { IncomingMessage } from "http";
import { parse } from "url";
import { ParsedRequest } from "./types";
import { readFileSync } from "fs";

const logo = readFileSync(`${__dirname}/../_images/logo.png`).toString(
  "base64"
);
const defaultAvatar = readFileSync(
  `${__dirname}/../_images/default_avatar.png`
).toString("base64");

export function parseRequest(req: IncomingMessage) {
  console.log("HTTP " + req.url);
  const { pathname, query } = parse(req.url || "/", true);
  const { avatar, username, fontSize, images, widths, heights, theme, md } =
    query || {};

  if (Array.isArray(fontSize)) {
    throw new Error("Expected a single fontSize");
  }
  if (Array.isArray(theme)) {
    throw new Error("Expected a single theme");
  }
  if (Array.isArray(username)) {
    throw new Error("Expected a single username");
  }
  if (Array.isArray(avatar)) {
    throw new Error("Expected a single avatar");
  }

  const arr = (pathname || "/").slice(1).split(".");
  let extension = "";
  let text = "";
  if (arr.length === 0) {
    text = "";
  } else if (arr.length === 1) {
    text = arr[0];
  } else {
    extension = arr.pop() as string;
    text = arr.join(".");
  }

  const parsedRequest: ParsedRequest = {
    fileType: extension === "jpeg" ? extension : "png",
    text: decodeURIComponent(text),
    username: username,
    avatar: avatar ? decodeURIComponent(avatar) : defaultAvatar,
    theme: theme === "dark" ? "dark" : "light",
    md: md === "1" || md === "true",
    fontSize: fontSize || "96px",
    images: getArray(images),
    widths: getArray(widths),
    heights: getArray(heights),
  };
  parsedRequest.images = getDefaultImages(parsedRequest.images);
  return parsedRequest;
}

function getArray(stringOrArray: string[] | string | undefined): string[] {
  if (typeof stringOrArray === "undefined") {
    return [];
  } else if (Array.isArray(stringOrArray)) {
    return stringOrArray;
  } else {
    return [stringOrArray];
  }
}

function getDefaultImages(images: string[]): string[] {
  const defaultImage = logo;

  if (!images || !images[0]) {
    return [defaultImage];
  } else {
    return [defaultImage, ...images];
  }
}
