import { Router } from "express";
import { createRepo } from "../controller/github.controller";
import { createStreak } from "../Services/chart/createStreak";
import nodeHtmlToImage from "node-html-to-image";

const publicRoutes = Router();

publicRoutes.get("/streaks/user/:user_id", async (req: any, res: any) => {
  const { user_id } = req.params;
  const { isReadme } = req.query;

  const html = await createStreak({ isExtension: isReadme !== "yes", user_id });

  if (isReadme === "yes") {
    const imageBuffer = await nodeHtmlToImage({
      html: ` <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { height : 180px;overflow: hidden; }
          .container { display: flex; justify-content: center;flex:1 }
        </style>
      </head>
      <body>
        <div class="container">
          ${html}
        </div>
      </body>
    </html>`, // Use the generated HTML
      encoding: "buffer", // Return the result as a Buffer
    });

    // Set appropriate response headers for image
    res.set("Content-Type", "image/png");
    res.set("Cache-Control", "no-store");
    return res.send(imageBuffer);
  }

  res.set("Content-Type", "text/html");
  res.set("Cache-Control", "no-store");

  res.set("Content-Type", "text/html");
  res.set("Cache-Control", "no-store");

  // Generate a dynamic ETag based on the content
  const hash = Buffer.from(html).toString("base64").slice(0, 10); // Simple hash for ETag
  res.set("ETag", hash);

  // return res.send(html);
  return res.send(html);
});

export default publicRoutes;
