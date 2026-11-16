/* ── PRUEBAS DEL MOTOR, DESDE LA CONSOLA ──────────────────────────────
   Abre la carta en un Chromium de verdad, le inyecta docs/pruebas-motor.js
   y corre la batería. Sale con código 1 si algo falla.

       npm install puppeteer-core
       node docs/pruebas.js              # una vuelta
       node docs/pruebas.js 3            # tres vueltas: más corridas al azar

   La semilla del azar es fija: una falla se repite igual la próxima vez.
   Para probar con otra, SEMILLA=123 node docs/pruebas.js              */

const puppeteer = require("puppeteer-core");
const path = require("path");

const CHROMIUM = process.env.CHROMIUM || "/opt/pw-browsers/chromium";
const BASE = "file://" + path.resolve(__dirname, "..", "index.html");
const vueltas = Number(process.argv[2]) || 1;

(async () => {
  const navegador = await puppeteer.launch({ executablePath: CHROMIUM, args: ["--no-sandbox"] });
  const pag = await navegador.newPage();
  const errores = [];
  pag.on("pageerror", e => errores.push(e.message));
  await pag.goto(BASE, { waitUntil: "load" });
  await pag.addScriptTag({ path: path.resolve(__dirname, "pruebas-motor.js") });
  const t0 = Date.now();
  const res = await pag.evaluate((v, s) => pruebasMotor({ vueltas: v, semilla: s }),
                                 vueltas, Number(process.env.SEMILLA) || undefined);
  await navegador.close();

  res.secciones.forEach(s => {
    const marca = s.fallas.length ? "✗" : "✓";
    console.log(`\n${marca} ${s.nombre} — ${s.ok} verificaciones${s.fallas.length ? `, ${s.fallas.length} fallas` : ""}`);
    s.datos.forEach(d => console.log("    " + d));
    s.fallas.forEach(f => console.log("    FALLA  " + f));
    s.avisos.forEach(a => console.log("    aviso  " + a));
  });
  errores.forEach(e => console.log("\nEXCEPCIÓN EN LA PÁGINA: " + e));
  console.log(`\n${res.total} verificaciones en ${((Date.now() - t0) / 1000).toFixed(1)} s · ` +
              (res.ok && !errores.length ? "todo verde" : `${res.fallas} fallas`));
  process.exit(res.ok && !errores.length ? 0 : 1);
})();
