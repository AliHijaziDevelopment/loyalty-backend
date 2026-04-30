import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { AppError } from "../../shared/errors/app-error.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxFileSize = 5 * 1024 * 1024;
const uploadRoot = path.resolve(process.cwd(), "uploads", "services");

function parsePartHeaders(headerBlock) {
  return headerBlock.split("\r\n").reduce((headers, line) => {
    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      return headers;
    }

    headers[line.slice(0, separatorIndex).toLowerCase()] = line.slice(separatorIndex + 1).trim();
    return headers;
  }, {});
}

function parseDisposition(value = "") {
  return value.split(";").reduce((parts, segment) => {
    const [rawKey, rawValue] = segment.trim().split("=");

    if (!rawValue) {
      return parts;
    }

    parts[rawKey] = rawValue.replace(/^"|"$/g, "");
    return parts;
  }, {});
}

function normalizeFieldValue(value) {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
}

async function readRequestBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

export function serviceImageUpload(fieldName = "image") {
  return async (req, _res, next) => {
    const contentType = req.headers["content-type"] || "";

    if (!contentType.startsWith("multipart/form-data")) {
      return next();
    }

    const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.[1] || contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.[2];

    if (!boundary) {
      return next(new AppError(400, "Multipart boundary is missing."));
    }

    try {
      const body = await readRequestBody(req);
      const rawParts = body.toString("latin1").split(`--${boundary}`);
      const fields = {};
      let uploadedFile = null;

      for (const rawPart of rawParts) {
        if (!rawPart || rawPart === "--\r\n" || rawPart === "--") {
          continue;
        }

        const cleanedPart = rawPart.replace(/^\r\n/, "").replace(/\r\n$/, "");
        const separatorIndex = cleanedPart.indexOf("\r\n\r\n");

        if (separatorIndex === -1) {
          continue;
        }

        const headers = parsePartHeaders(cleanedPart.slice(0, separatorIndex));
        const disposition = parseDisposition(headers["content-disposition"]);
        const name = disposition.name;
        let value = cleanedPart.slice(separatorIndex + 4);

        if (!name) {
          continue;
        }

        if (!disposition.filename) {
          fields[name] = normalizeFieldValue(value);
          continue;
        }

        if (name !== fieldName || !value) {
          continue;
        }

        const mimeType = headers["content-type"] || "application/octet-stream";
        const fileBuffer = Buffer.from(value, "latin1");

        if (!allowedMimeTypes.has(mimeType)) {
          return next(new AppError(415, "Service image must be JPEG, PNG, WEBP, or GIF."));
        }

        if (fileBuffer.length > maxFileSize) {
          return next(new AppError(413, "Service image must be 5MB or smaller."));
        }

        const extension = {
          "image/jpeg": ".jpg",
          "image/png": ".png",
          "image/webp": ".webp",
          "image/gif": ".gif",
        }[mimeType];
        const filename = `${crypto.randomUUID()}${extension}`;
        await fs.mkdir(uploadRoot, { recursive: true });
        await fs.writeFile(path.join(uploadRoot, filename), fileBuffer);

        uploadedFile = {
          filename,
          mimeType,
          size: fileBuffer.length,
          publicPath: `/uploads/services/${filename}`,
        };
      }

      req.body = fields;
      req.uploadedFile = uploadedFile;
      next();
    } catch (error) {
      next(error);
    }
  };
}
