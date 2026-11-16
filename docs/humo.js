/* ── PRUEBA DE HUMO ───────────────────────────────────────────────────
   Abre la carta en un Chromium de verdad y la recorre. El autotest de
   adentro (`bofoTest`) prueba el motor, que no toca el DOM; esto prueba
   lo otro: que la pantalla se pinte, que no salte ninguna excepción y
   que las fotos hagan lo que tienen que hacer.

       npm install puppeteer-core
       node docs/humo.js                       # sobre file://, como el doble clic
       node docs/humo.js http://localhost:8000/index.html

   Las dos formas importan y no prueban lo mismo: con `file://` el canvas
   de la tarjeta queda manchado por la foto y la imagen sale sin ella. Es
   el caso de la demo abierta con doble clic, así que se verifica.     */

const puppeteer = require("puppeteer-core");
const path = require("path");

const CHROMIUM = process.env.CHROMIUM
  || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BASE = process.argv[2]
  || "file://" + path.resolve(__dirname, "..", "index.html");
const esArchivo = BASE.indexOf("file://") === 0;

(async () => {
  const fallas = [];
  const navegador = await puppeteer.launch({ executablePath: CHROMIUM, args: ["--no-sandbox"] });
  const pag = await navegador.newPage();
  await pag.setViewport({ width: 412, height: 915, deviceScaleFactor: 2 });

  /* Las fotos que todavía no existen dan 404 y eso es el diseño de la
     carta, no una falla: la caja se cierra sola y no queda hueco. */
  pag.on("console", m => {
    const t = m.text();
    if (m.type() === "error" && !/404|Failed to load resource/.test(t)) fallas.push("consola: " + t);
  });
  pag.on("pageerror", e => fallas.push("excepción: " + e.message));

  // 1 · el motor
  await pag.goto(BASE + "?test=1", { waitUntil: "networkidle2" });
  const test = await pag.evaluate(() => window.bofoTest());
  console.log(test.resumen);
  if (test.fallas.length) fallas.push("el autotest del motor trae fallas");

  // 2 · la carta: la foto que está aparece, la que no está no deja hueco
  await pag.evaluate(() => { ir("carta"); S.q = "ojo de bife"; $("#q").value = S.q; pintarCarta(); });
  await pag.waitForSelector(".foto--thumb.foto--ok", { timeout: 5000 });
  const mini = await pag.evaluate(() => {
    const b = document.querySelector(".foto--thumb.foto--ok");
    return { tag: b.tagName, oculta: b.getAttribute("aria-hidden"), tab: b.getAttribute("tabindex") };
  });
  if (mini.tag !== "BUTTON") fallas.push("la miniatura no es un botón, así que no se puede ampliar");
  if (mini.oculta || mini.tab) fallas.push("la foto cargada sigue escondida para el teclado");

  const huecos = await pag.evaluate(() => {
    S.q = ""; $("#q").value = ""; pintarCarta();
    return Array.prototype.slice.call(document.querySelectorAll(".plato .foto:not(.foto--ok)"))
      .filter(f => f.getBoundingClientRect().width || f.getBoundingClientRect().height).length;
  });
  if (huecos) fallas.push(huecos + " platos sin foto dejan un hueco en la carta");

  // 3 · el visor: abre, toma el foco y el Escape no se lleva la carta puesta
  await pag.evaluate(() => { S.q = "ojo de bife"; $("#q").value = S.q; pintarCarta(); });
  await pag.waitForSelector(".foto--thumb.foto--ok");
  await pag.click(".foto--thumb.foto--ok");
  await pag.waitForSelector("#visor .visor__img", { timeout: 3000 });
  if (await pag.evaluate(() => document.activeElement.id) !== "visor-cerrar")
    fallas.push("el visor no toma el foco");
  await pag.keyboard.press("Escape");
  if (!await pag.evaluate(() => !document.querySelector("#visor") && S.vista === "carta"))
    fallas.push("Escape no cierra el visor, o además se va de la carta");

  // 4 · la tarjeta como imagen, con foto y sin ella
  const png = await pag.evaluate(async () => {
    const r = { principal: MENU.find(p => p.id === "ojo-bife"), entrada: null, ecos: [], punto: "jugoso" };
    const medir = async con => {
      try { return (await tarjetaImagen(r, con)).size; } catch (e) { return "ERROR " + e.name; }
    };
    return { conFoto: await medir(true), sinFoto: await medir(false) };
  });
  console.log("tarjeta compartible:", JSON.stringify(png));
  if (typeof png.sinFoto !== "number") fallas.push("la tarjeta no se pudo armar ni sin foto");
  if (!esArchivo && typeof png.conFoto !== "number") fallas.push("servida por http, la tarjeta tendría que salir con la foto");
  if (esArchivo && png.conFoto !== "ERROR SecurityError") console.log("  (desde file:// se esperaba el canvas manchado)");

  // 5 · corridas enteras del chef, hasta el veredicto. Se repite hasta
  //     que salga un plato que pida vino, para probar «¿Qué tomás con
  //     esto?» en pantalla: es una pregunta que aparece después del
  //     veredicto y el autotest del motor no la ve.
  let probóBebida = false;
  for (let vuelta = 0; vuelta < 8 && !probóBebida; vuelta++){
    await pag.evaluate(() => { ir("chef"); arrancar("express"); });
    for (let i = 0; i < 90; i++){
      if (await pag.evaluate(() => !!document.querySelector("#tarjeta"))) break;
      await pag.evaluate(() => {
        const campo = document.querySelector("#v-chef input[type=text], #v-chef textarea");
        if (campo) campo.value = "la milanesa de mi abuela";
        const seguir = document.querySelector("#b-seguir");
        if (seguir && document.querySelector('[aria-pressed="true"], .opcion.activo')) return seguir.click();
        const ops = document.querySelectorAll('.opcion, .grilla__item, .duplas__op');
        const b = ops.length ? ops[Math.floor(Math.random() * ops.length)]
                : document.querySelector('#b-desliz, #b-texto, #b-saltear, #b-sin-nombre');
        if (b) b.click();
      });
      await new Promise(r => setTimeout(r, 320));
    }
    if (!await pag.evaluate(() => !!document.querySelector("#tarjeta"))){
      fallas.push("no se llegó al veredicto");
      break;
    }
    const conVino = await pag.evaluate(() => window.__ultimo.pideBebida);
    const hayPregunta = await pag.evaluate(() => !!document.querySelector(".tomas__op"));
    if (conVino !== hayPregunta)
      fallas.push(`el plato ${conVino ? "pide" : "no pide"} vino y la pregunta ${hayPregunta ? "está" : "no está"}`);
    if (!hayPregunta) continue;

    await pag.click('.tomas__op[data-pref="blanco"]');
    const res = await pag.evaluate(() => ({
      dicho: !!document.querySelector(".tomas .punto__dicho"),
      color: window.__ultimo.esVino && window.__ultimo.bebida.vino.color,
      cepa: (document.querySelector(".tomas ~ .mini .mini__cepa") || {}).textContent || ""
    }));
    if (!res.dicho) fallas.push("después de contestar qué toma, la pregunta no se cierra");
    if (res.color !== "blanco") fallas.push("pidió vino blanco y le tocó " + res.color);
    if (!/blanco/.test(res.cepa)) fallas.push("la pantalla no muestra el blanco que pidió: " + res.cepa);
    probóBebida = true;
  }
  if (!probóBebida) console.log("  (en 8 corridas no salió ningún plato que pida vino; no se probó la pregunta)");

  await navegador.close();
  console.log(fallas.length ? "\nFALLAS:\n" + fallas.join("\n") : "\nTodo verde.");
  process.exit(fallas.length ? 1 : 0);
})();
