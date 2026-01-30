import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function handler(event) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405 };
    }

    const contentType = event.headers["content-type"];
    const boundary = contentType.split("boundary=")[1];
    const body = Buffer.from(event.body, "base64");

    const parts = body.toString().split(boundary);
    const filePart = parts.find(p => p.includes("filename="));
    if (!filePart) {
        return { statusCode: 400, body: "No file" };
    }

    const start = filePart.indexOf("\r\n\r\n") + 4;
    const end = filePart.lastIndexOf("\r\n");
    const fileBuffer = Buffer.from(filePart.slice(start, end), "binary");

    const filename = `${randomUUID()}.png`;
    const filePath = path.join("/tmp", filename);

    await writeFile(filePath, fileBuffer);

    return {
        statusCode: 200,
        body: JSON.stringify({ filename })
    };
}
