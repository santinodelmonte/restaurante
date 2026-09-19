/* Imprime un documento a PDF con el pie numerado.

   Uso:  node docs/imprimir.js                          (todos los documentos)
         node docs/imprimir.js cambios-reunion-bo-fomento

   Necesita puppeteer-core y el Chromium del entorno (CHROME env para apuntar a otro). */
const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const CHROME = process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const pie = `
<div style="width:100%;font-family:Arial,sans-serif;font-size:7pt;color:#4A6379;
            padding:0 14mm;display:flex;justify-content:space-between;">
  <span>BO FOMENTO &middot; AURA MARKETING</span>
  <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
</div>`;

/* Sin argumentos se imprimen todos los .html de la carpeta: son los que se
   le mandan al cliente y conviene que salgan siempre juntos y al día. */
const pedidos = process.argv.slice(2).map(a => a.replace(/\.html$/, ""));
const documentos = pedidos.length
  ? pedidos
  : fs.readdirSync(__dirname).filter(f => f.endsWith(".html")).map(f => f.slice(0, -5));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    args: ["--no-sandbox", "--disable-gpu"],
  });
  for (const nombre of documentos){
    const entrada = path.resolve(__dirname, nombre + ".html");
    const salida  = path.resolve(__dirname, nombre + ".pdf");
    if (!fs.existsSync(entrada)){
      console.error("No existe:", entrada);
      continue;
    }
    const page = await browser.newPage();
    await page.goto("file://" + entrada, { waitUntil: "networkidle0" });
    await page.evaluateHandle("document.fonts.ready");
    await page.pdf({
      path: salida,
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: pie,
      margin: { top: "14mm", right: "14mm", bottom: "14mm", left: "14mm" },
    });
    await page.close();
    console.log("PDF listo:", salida);
  }
  await browser.close();
})();
