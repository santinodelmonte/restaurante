/* Imprime el documento a PDF con el pie numerado.
   Uso: node docs/imprimir.js
   Necesita puppeteer-core y el Chromium del entorno (CHROME env para apuntar a otro). */
const puppeteer = require("puppeteer-core");
const path = require("path");

const CHROME = process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const ENTRADA = path.resolve(__dirname, "siguientes-pasos-bo-fomento.html");
const SALIDA  = path.resolve(__dirname, "siguientes-pasos-bo-fomento.pdf");

const pie = `
<div style="width:100%;font-family:Arial,sans-serif;font-size:7pt;color:#4A6379;
            padding:0 14mm;display:flex;justify-content:space-between;">
  <span>BO FOMENTO &middot; PLAN DE PUESTA EN MARCHA &middot; AURA MARKETING</span>
  <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
</div>`;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  await page.goto("file://" + ENTRADA, { waitUntil: "networkidle0" });
  await page.evaluateHandle("document.fonts.ready");
  await page.pdf({
    path: SALIDA,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate: pie,
    margin: { top: "14mm", right: "14mm", bottom: "14mm", left: "14mm" },
  });
  await browser.close();
  console.log("PDF listo:", SALIDA);
})();
