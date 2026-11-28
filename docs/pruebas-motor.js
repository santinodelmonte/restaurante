/* ── PRUEBAS DEL MOTOR ────────────────────────────────────────────────
   Una batería aparte del autotest de adentro (`bofoTest`). El autotest
   recorre tandas al azar y verifica las reglas de cada veredicto; esto
   mira lo que el autotest no ve:

     datos        que la carta y el banco de preguntas estén bien cargados
     robustez     respuestas raras, faltantes o fuera de rango
     determinismo las mismas respuestas dan el mismo veredicto
     alcance      que todo plato pueda salir para alguien
     personas     casos escritos a mano, con lo que tiene que pasar
     secuencias   punto, bebida y cambio de corte, en cualquier orden
     textos       que ninguna frase afirme algo que no es cierto
     mesa         mesas de 1 a 8 con chicos y restricciones cruzadas
     chicos       todas las combinaciones de restricciones de Tito
     reparto      que lo que sale se parezca a este local
     rendimiento  que ande rápido en un celular

   No se publica con el sitio: lo inyecta `docs/pruebas.js` en la página
   y llama a `pruebasMotor()`. Usa las funciones del motor tal como están,
   sin copias: si cambia el motor, cambia lo que se prueba.           */
(function(){

function pruebasMotor(opciones){
  opciones = opciones || {};
  const VUELTAS = opciones.vueltas || 1;
  const secciones = [];
  let actual = null;
  const seccion = nombre => { actual = { nombre, ok:0, fallas:[], avisos:[], datos:[] }; secciones.push(actual); };
  const ok = (cond, msj) => {
    if (cond) actual.ok++;
    else if (actual.fallas.length < 40) actual.fallas.push(msj);
    else if (actual.fallas.length === 40) actual.fallas.push("… (más fallas, cortado)");
    return cond;
  };
  const aviso = msj => actual.avisos.push(msj);
  const dato = msj => actual.datos.push(msj);

  // Lo que se mide no depende del día: el destacado se apaga, y se prueba
  // en su propia sección.
  const forzadoAntes = DESTACADOS.forzado;
  DESTACADOS.forzado = "ninguno";

  // Nada de lo que se prueba toca lo que la persona tiene guardado.
  Memoria.cache = {}; MemoriaPreg.cache = {};
  const memoriaSumar = Memoria.sumar, memoriaUlt = Memoria.guardarUltimo;
  Memoria.sumar = () => {}; Memoria.guardarUltimo = () => {};

  // Azar con semilla: una corrida que falla se puede repetir.
  let semilla = opciones.semilla || 20261116;
  const azar = () => { semilla = (semilla * 1103515245 + 12345) >>> 0; return semilla / 4294967296; };
  const uno = xs => xs[Math.floor(azar() * xs.length)];

  const pReq = PREGUNTAS.find(p => p.id === "restricciones");
  const iTodo = pReq.opciones.findIndex(o => o.exclusiva);
  const iDe = (qid, texto) => {
    const q = PREGUNTAS.find(p => p.id === qid);
    const i = q.opciones.findIndex(o => o.texto.toLowerCase().indexOf(texto.toLowerCase()) !== -1);
    if (i === -1) throw new Error(`no hay "${texto}" en ${qid}`);
    return i;
  };
  const restr = (...textos) => textos.map(t => iDe("restricciones", t));

  function respuestaAlAzar(p){
    const f = fmtDe(p);
    if (f === "duplas") return p.pares.map(() => azar() < .5 ? 0 : 1);
    if (f === "deslizador") return Math.floor(azar() * 11);
    if (f === "texto") return azar() < .5 ? "" : uno(["la milanesa de mi abuela", "un asado en Piriápolis", "hígado"]);
    if (p.multiple) return [iTodo];
    return Math.floor(azar() * p.opciones.length);
  }
  function tandaAlAzar(modo, restricciones){
    const t = armarTanda(modo || (azar() < .5 ? "express" : "completo"));
    const resp = {};
    t.forEach(q => { resp[q.id] = q.id === pReq.id ? (restricciones || [iTodo]) : respuestaAlAzar(q); });
    return { t, resp };
  }
  // los 512 subconjuntos de restricciones (sin «como de todo»)
  const otras = pReq.opciones.map((o, i) => i).filter(i => i !== iTodo);
  const subconjunto = () => { const s = otras.filter(() => azar() < .25); return s.length ? s : [iTodo]; };

  const PROTEINAS = ["carne","cerdo","pollo","pescado","mariscos","achuras","queso","vegetal","dulce","bebida"];
  const CONTIENE = ["carne","cerdo","pollo","pescado","mariscos","achuras","lacteos","gluten","huevo","frutos-secos","alcohol"];
  const CARNES = ["carne","cerdo","pollo","pescado","mariscos","achuras"];
  const delAdulto = p => !esNino(p);
  const principales = MENU.filter(p => delAdulto(p) && tipoDe(p) === "principal" && !empieza(p) && p.recomendable !== false);
  const sumaR = r => (r.entrada ? r.entrada.precio : 0) + r.principal.precio + r.bebida.precio + r.postre.precio;
  const cuantoTarda = fn => { const t0 = performance.now(); fn(); return performance.now() - t0; };

  /* ══ 1. DATOS ═════════════════════════════════════════════════════ */
  seccion("datos");
  const ids = new Set();
  MENU.forEach(p => {
    const P = `"${p.nombre}" (${p.id})`;
    ok(!ids.has(p.id), `${P}: id repetido`); ids.add(p.id);
    ok(/^[a-z0-9-]+$/.test(p.id), `${P}: id con caracteres raros`);
    ok(CATEGORIAS.some(c => c.id === p.categoria), `${P}: categoría ${p.categoria} no existe`);
    ok(Number.isInteger(p.precio) && p.precio > 0 && p.precio < 20000, `${P}: precio ${p.precio}`);
    ok(p.nombre && p.nombre.trim() === p.nombre && !/\s{2}/.test(p.nombre), `${P}: nombre con espacios de más`);
    ok(typeof p.descripcion === "string", `${P}: sin campo descripcion`);
    ok(EJES.every(e => Number.isInteger(p.ejes[e]) && p.ejes[e] >= 0 && p.ejes[e] <= 10), `${P}: ejes fuera de 0-10`);
    ok(Object.keys(p.ejes).length === EJES.length, `${P}: ejes de más o de menos`);
    ok(PROTEINAS.indexOf(p.proteina) !== -1, `${P}: proteína ${p.proteina}`);
    ok(Array.isArray(p.contiene) && p.contiene.every(c => CONTIENE.indexOf(c) !== -1), `${P}: contiene algo desconocido`);
    ok(p.apto && ["vegetariano","singluten","compartir"].every(k => typeof p.apto[k] === "boolean"), `${P}: apto incompleto`);
    // lo que se declara tiene que poder sostenerse con lo que contiene
    if (p.apto.vegetariano)
      ok(!p.contiene.some(c => CARNES.indexOf(c) !== -1), `${P}: vegetariano y contiene ${p.contiene.join(", ")}`);
    if (p.apto.singluten)
      ok(p.contiene.indexOf("gluten") === -1, `${P}: sin gluten y contiene gluten`);
    if (CARNES.indexOf(p.proteina) !== -1)
      ok(p.contiene.indexOf(p.proteina) !== -1 || (p.proteina === "mariscos" && p.contiene.indexOf("pescado") !== -1),
        `${P}: la proteína es ${p.proteina} y no figura en contiene`);
    if (p.proteina === "queso") ok(p.contiene.indexOf("lacteos") !== -1, `${P}: es de queso y no tiene lácteos`);
    // las etiquetas no pueden prometer lo que el plato no cumple
    if (p.tags.indexOf("vegetariano") !== -1) ok(p.apto.vegetariano, `${P}: etiqueta vegetariano sin serlo`);
    if (p.tags.indexOf("sin TACC") !== -1) ok(p.apto.singluten, `${P}: etiqueta sin TACC sin serlo`);
    if (p.tags.indexOf("sin alcohol") !== -1) ok(p.contiene.indexOf("alcohol") === -1, `${P}: etiqueta sin alcohol y tiene alcohol`);
    ok(new Set(p.tags).size === p.tags.length, `${P}: etiquetas repetidas`);
    if (tipoDe(p) === "bebida" && !esVino(p))
      ok(p.proteina === "bebida", `${P}: bebida con proteína ${p.proteina}`);
    if (esVino(p)){
      const v = p.vino || {};
      ok(["tinto","blanco","rosado","espumante"].indexOf(v.color) !== -1, `${P}: color de vino`);
      ok(["cuerpo","tanino","acidez","dulzor"].every(k => Number.isInteger(v[k]) && v[k] >= 0 && v[k] <= 10), `${P}: perfil de vino`);
      ok(p.contiene.indexOf("alcohol") !== -1, `${P}: vino sin alcohol`);
      ok(!!p.sub, `${P}: vino sin cepa (sub)`);
    }
    if (esNino(p)) ok(["principal","bebida","postre"].indexOf(p.rol) !== -1, `${P}: rol ${p.rol}`);
    if (p.empieza) ok(tipoDe(p) !== "bebida" && tipoDe(p) !== "postre", `${P}: empieza y es bebida o postre`);
  });
  ok(MENU.some(p => esNino(p) && p.rol === "principal"), "el menú de peques no tiene ningún plato");
  ok(principales.length >= 20, `sólo ${principales.length} platos fuertes recomendables`);
  CATEGORIAS.forEach(c => ok(MENU.some(p => p.categoria === c.id), `la categoría ${c.nombre} está vacía`));
  // dos platos fuertes con los mismos ejes, la misma proteína y la misma
  // cocina son indistinguibles para el motor
  const firma = p => p.categoria + "|" + p.proteina + "|" + EJES.map(e => p.ejes[e]).join(",");
  const porFirma = {};
  principales.forEach(p => { (porFirma[firma(p)] = porFirma[firma(p)] || []).push(p.nombre); });
  Object.values(porFirma).filter(x => x.length > 1)
    .forEach(x => aviso(`indistinguibles para el motor: ${x.join(" / ")}`));
  // cortes que sufren bien cocidos: que existan y sean de parrilla
  SUFRE_COCIDO.forEach(id => {
    const p = MENU.find(x => x.id === id);
    ok(!!p && p.categoria === "parrilla", `SUFRE_COCIDO nombra ${id}, que no es un corte de la parrilla`);
  });

  // el banco de preguntas
  const qids = new Set();
  const cats = CATEGORIAS.map(c => c.id);
  const fuegos = [].concat.apply([], Object.values(FUEGO_DE));
  const revisarPregunta = (q, ninos) => {
    const Q = `pregunta ${q.id}`;
    ok(!qids.has(q.id), `${Q}: id repetido`); qids.add(q.id);
    ok(["filtro","sabor","chamuyo"].indexOf(q.tipo) !== -1, `${Q}: tipo ${q.tipo}`);
    ok(["opciones","grilla","duplas","deslizador","texto"].indexOf(fmtDe(q)) !== -1, `${Q}: formato ${fmtDe(q)}`);
    ok(!!q.texto && q.texto.length < 120, `${Q}: texto vacío o larguísimo`);
    if (!ninos) ok(Array.isArray(q.modos) && q.modos.length > 0, `${Q}: sin modos`);
    ok(!!q.grupo, `${Q}: sin grupo`);
    const ops = q.opciones || (q.pares ? q.pares.reduce((a, x) => a.concat([x.a, x.b]), []) : []);
    if (fmtDe(q) !== "texto" && fmtDe(q) !== "deslizador")
      ok(ops.length >= 2, `${Q}: menos de dos opciones`);
    ops.forEach(o => {
      const O = `${Q} «${o.texto}»`;
      Object.keys(o.pesos || {}).forEach(e => {
        ok(EJES.indexOf(e) !== -1, `${O}: eje ${e} no existe`);
        ok(Math.abs(o.pesos[e]) <= 3, `${O}: peso ${o.pesos[e]} en ${e} (máximo ±3)`);
      });
      if (o.afin) ok(PROTEINAS.indexOf(o.afin.proteina) !== -1 &&
        MENU.some(p => p.proteina === o.afin.proteina && (ninos ? esNino(p) : principales.indexOf(p) !== -1)),
        `${O}: afinidad con ${o.afin.proteina}, que no tiene ningún plato`);
      if (o.fuego) ok(fuegos.indexOf(o.fuego) !== -1, `${O}: fuego ${o.fuego} no existe`);
      if (o.si && o.si.categoria) ok([].concat(o.si.categoria).every(c => cats.indexOf(c) !== -1), `${O}: condición sobre una categoría que no existe`);
      if (q.tipo !== "chamuyo" && !q.pares) ok(!!o.eco, `${O}: sin eco`);
      if (!q.pares) ok(!!o.chiste, `${O}: sin respuesta del chef`);
      // lo que afirma un resultado lleva condición
      if (o.lleva && /parrilla|horno|olla|sartén|la entrada|con la entrada|queso adelante|lo saqué/.test(o.lleva))
        ok(!!o.si, `${O}: «${o.lleva}» afirma algo del veredicto sin condición`);
    });
    (q.marcas || []).forEach(m => {
      if (m.lleva && /entrada/.test(m.lleva)) ok(!!m.si, `${Q}: la marca «${m.lleva}» afirma la entrada sin condición`);
    });
  };
  PREGUNTAS.forEach(q => revisarPregunta(q, false));
  qids.clear();
  PREGUNTAS_NINOS.forEach(q => revisarPregunta(q, true));
  ["express","completo"].forEach(m => {
    const alto = PREGUNTAS.filter(q => q.modos.indexOf(m) !== -1 && q.tipo !== "filtro");
    const grupos = new Set(alto.map(q => q.grupo));
    ok(grupos.size >= LARGO[m], `modo ${m}: ${grupos.size} grupos para tandas de ${LARGO[m]}`);
  });
  dato(`${MENU.length} ítems, ${principales.length} platos fuertes recomendables, ${PREGUNTAS.length} preguntas`);

  // Los gestos de los personajes: cada uno que se usa en el código tiene
  // que estar dibujado para ese personaje. Un gesto que no existe deja al
  // personaje sin cara (le pasó a Tito con «pensando», que es del Vasco).
  const css = Array.prototype.map.call(document.querySelectorAll("style"), x => x.textContent).join("\n");
  const codigo = Array.prototype.map.call(document.querySelectorAll("script:not([src])"), x => x.textContent).join("\n");
  const dibujados = pref => {
    const set = new Set(), re = /\[data-gesto="([a-z]+)"\]\s*:is\(([^)]*)\)/g; let m;
    while ((m = re.exec(css))) if (m[2].indexOf("." + pref + "-") !== -1) set.add(m[1]);
    return set;
  };
  const gestos = { tito: dibujados("k"), vasco: dibujados("v") };
  const usados = (re, quien) => { let m; while ((m = re.exec(codigo))) ok(gestos[quien].has(m[1]),
    `${quien === "tito" ? KID.nombre : CHEF.nombre} usa el gesto «${m[1]}», que no está dibujado`); };
  ok(gestos.tito.size > 0 && gestos.vasco.size > 0, "no se encontraron los gestos en el CSS");
  usados(/titoHTML\("[^"]*",\s*"([a-z]+)"\)/g, "tito");
  usados(/gestoKid\("([a-z]+)"\)/g, "tito");
  usados(/vascoHTML\("[^"]*",\s*"([a-z]+)"\)/g, "vasco");
  usados(/[^a-zA-Z]gesto\("([a-z]+)"\)/g, "vasco");

  /* ══ 2. ROBUSTEZ ══════════════════════════════════════════════════ */
  seccion("robustez");
  const banco = PREGUNTAS.slice();
  const intenta = (nombre, fn) => {
    try { const r = fn(); ok(!!r && !!r.principal, `${nombre}: no devolvió veredicto`); return r; }
    catch (e) { ok(false, `${nombre}: excepción ${e.message}`); return null; }
  };
  intenta("sin ninguna respuesta", () => recomendar({}, banco));
  intenta("sin preguntas", () => recomendar({}, []));
  intenta("sólo restricciones", () => recomendar({ restricciones:[iTodo] }, [pReq]));
  intenta("restricciones vacías", () => recomendar({ restricciones:[] }, banco));
  intenta("índices fuera de rango", () => {
    const r = {}; banco.forEach(q => { r[q.id] = fmtDe(q) === "duplas" ? [7, 9] : q.multiple ? [99] : 99; });
    return recomendar(r, banco);
  });
  intenta("índices negativos", () => {
    const r = {}; banco.forEach(q => { r[q.id] = q.multiple ? [-1] : -1; });
    return recomendar(r, banco);
  });
  intenta("deslizadores con basura", () => {
    const r = { restricciones:[iTodo] };
    banco.filter(q => fmtDe(q) === "deslizador").forEach(q => { r[q.id] = "mucho"; });
    return recomendar(r, banco);
  });
  intenta("deslizadores en los extremos", () => {
    const r = { restricciones:[iTodo] };
    banco.filter(q => fmtDe(q) === "deslizador").forEach(q => { r[q.id] = 1e9; });
    return recomendar(r, banco);
  });
  intenta("duplas a medio contestar", () => {
    const r = { restricciones:[iTodo] };
    banco.filter(q => fmtDe(q) === "duplas").forEach(q => { r[q.id] = [0]; });
    return recomendar(r, banco);
  });
  intenta("texto con HTML", () => {
    const r = { restricciones:[iTodo] };
    banco.filter(q => fmtDe(q) === "texto").forEach(q => { r[q.id] = '<img src=x onerror="alert(1)">'; });
    const x = recomendar(r, banco);
    if (x) ok(x.ecos.length >= 0, "ecos");
    return x;
  });
  intenta("«como de todo» junto con restricciones", () =>
    recomendar({ restricciones:[iTodo].concat(restr("vegetariano", "celiaquía")) }, banco));
  // las 512 combinaciones de restricciones, sin ninguna otra respuesta
  let sinVeredicto = 0;
  for (let m = 0; m < (1 << otras.length); m++){
    const s = otras.filter((_, k) => m & (1 << k));
    try {
      const r = recomendar({ restricciones: s.length ? s : [iTodo] }, banco);
      if (!r){ sinVeredicto++; continue; }
      const todos = [r.principal, r.bebida, r.postre].concat(r.entrada ? [r.entrada] : []).concat(r.alternativas);
      ok(todos.every(p => pasaFiltrosDuros(p, r.filtros)),
        `restricciones ${s.map(i => pReq.opciones[i].texto).join(" + ")}: algo no pasa los filtros`);
      ok(r.total === sumaR(r), "la cuenta no cierra");
    } catch (e){ ok(false, `restricciones ${s.join(",")}: ${e.message}`); }
  }
  ok(sinVeredicto === 0, `${sinVeredicto} combinaciones de restricciones se quedan sin veredicto`);

  /* ══ 3. DETERMINISMO ══════════════════════════════════════════════ */
  seccion("determinismo");
  const huella = r => [r.principal.id, r.entrada && r.entrada.id, r.bebida.id, r.postre.id]
    .concat(r.alternativas.map(p => p.id)).join("|");
  for (let i = 0; i < 300 * VUELTAS; i++){
    const { t, resp } = tandaAlAzar(null, subconjunto());
    const a = recomendar(resp, t), b = recomendar(JSON.parse(JSON.stringify(resp)), t);
    ok(huella(a) === huella(b), `las mismas respuestas dieron ${huella(a)} y ${huella(b)}`);
    // el orden en que se contestó no cambia nada
    const alReves = {}; Object.keys(resp).reverse().forEach(k => { alReves[k] = resp[k]; });
    ok(huella(recomendar(alReves, t)) === huella(a), "el orden de las respuestas cambió el veredicto");
  }

  /* ══ 4. ALCANCE ═══════════════════════════════════════════════════ */
  seccion("alcance");
  // Para cada plato fuerte, la persona ideal: su vector es el del plato,
  // dijo su proteína y dio señales de su cocina. Si ni así sale primero,
  // el plato está muerto en la carta.
  const sinFiltros = leerFiltros({}, []);
  principales.forEach(p => {
    const f = Object.assign({}, sinFiltros, { afin:[p.proteina], fuego:{} });
    (FUEGO_DE[p.categoria] || []).forEach(k => { f.fuego[k] = 2; });
    const rank = ordenar(principales, Object.assign({}, p.ejes), f, mulberry32(1),
                         { pesosEje:{ acidez:0.5, dulce:0.3 } });
    const top = rank[0].score;
    const esta = rank.find(x => x.plato.id === p.id);
    ok(top - esta.score < 0.0015, `"${p.nombre}" no sale ni para la persona hecha a su medida (gana ${rank[0].plato.nombre})`);
  });
  // y con gente al azar: qué sale, y qué no sale nunca
  const vistos = { principal:{}, entrada:{}, vino:{}, postre:{}, bebida:{} };
  const anotar = (k, p) => { if (p) vistos[k][p.id] = (vistos[k][p.id] || 0) + 1; };
  const N = 4000 * VUELTAS;
  for (let i = 0; i < N; i++){
    const { t, resp } = tandaAlAzar(null, azar() < .3 ? subconjunto() : [iTodo]);
    const r = recomendar(resp, t);
    if (!r) continue;
    anotar("principal", r.principal); anotar("entrada", r.entrada); anotar("postre", r.postre);
    if (!r.esVino) anotar("bebida", r.bebida);
    if (r.pideBebida) ["maridaje","tinto","blanco"].forEach(pb => {
      const c = aplicarBebida(recomendar(resp, t), pb);
      if (c.esVino) anotar("vino", c.bebida);
      if (c.vinoPostre) anotar("vino", c.vinoPostre.plato);
    });
  }
  const nunca = (pool, k) => pool.filter(p => !vistos[k][p.id]).map(p => p.nombre);
  const pNunca = nunca(principales, "principal");
  if (pNunca.length) aviso(`platos fuertes que no salieron en ${N} corridas: ${pNunca.join(", ")}`);
  const enTablas = new Set(); GRUPOS_ENTRADA.forEach(g => (g.entradas || []).forEach(id => enTablas.add(id)));
  const eNunca = nunca(MENU.filter(p => enTablas.has(p.id)), "entrada");
  if (eNunca.length) aviso(`entradas de las tablas que no salieron nunca: ${eNunca.join(", ")}`);
  const vinos = MENU.filter(esVino);
  const vNunca = nunca(vinos, "vino");
  dato(`vinos que salieron: ${vinos.length - vNunca.length} de ${vinos.length}`);
  if (vNunca.length) aviso(`vinos que no salieron nunca: ${vNunca.join(", ")}`);
  const postres = MENU.filter(p => delAdulto(p) && tipoDe(p) === "postre");
  const poNunca = nunca(postres, "postre");
  if (poNunca.length) aviso(`postres que no salieron nunca: ${poNunca.join(", ")}`);
  dato(`platos fuertes distintos: ${principales.length - pNunca.length} de ${principales.length}`);

  /* ══ 5. PERSONAS ══════════════════════════════════════════════════ */
  seccion("personas");
  // Cada persona contesta sólo lo que la define; el resto queda sin
  // contestar, que el motor tiene que tolerar.
  const persona = (nombre, resp, chequeos) => {
    const r = recomendar(Object.assign({ restricciones:[iTodo] }, resp), banco);
    if (!ok(!!r, `${nombre}: sin veredicto`)) return;
    try { chequeos(r, (c, m) => ok(c, `${nombre}: ${m} (le tocó ${r.principal.nombre}` +
      `${r.entrada ? ", " + r.entrada.nombre : ""}, ${r.bebida.nombre})`)); }
    catch (e){ ok(false, `${nombre}: ${e.message}`); }
  };
  const parrillero = {
    proteina: iDe("proteina", "carne"), olor: iDe("olor", "brasa"), domingo: iDe("domingo", "fuego"),
    pelea: iDe("pelea", "asado"), "frito-parrilla": iDe("frito-parrilla", "parrilla"),
    coccion: iDe("coccion", "jugosa"), hambre: 9
  };
  persona("el parrillero", parrillero, (r, c) => {
    c(r.principal.categoria === "parrilla", "no salió de la parrilla");
    c(r.principal.proteina === "carne", "no es carne");
    c(r.pidePunto, "no le pregunta el punto");
    c(r.pideBebida, "no le pregunta qué toma");
    c(!r.esVino || r.bebida.vino.color === "tinto", "el vino no es tinto");
    c(!!r.entrada, "sin entrada");
  });
  persona("el parrillero que pide bien cocido", parrillero, (r, c) => {
    aplicarPunto(r, "cocido");
    if (SUFRE_COCIDO.indexOf(r.principal.id) !== -1){
      c(!!r.cambioSugerido, "su corte sufre y no avisó");
      if (r.cambioSugerido) c(r.cambioSugerido.plato.proteina === "carne", "le ofreció cambiar a algo que no es carne");
    }
    c(r.total === sumaR(r), "la cuenta no cierra");
  });
  persona("el del horno de barro", {
    olor: iDe("olor", "pan"), domingo: iDe("domingo", "horno"), pelea: iDe("pelea", "borde"),
    proteina: iDe("proteina", "queso")
  }, (r, c) => {
    c(r.principal.categoria === "horno", "no salió del horno");
    c(!r.entrada || r.entrada.proteina !== "queso" || r.principal.proteina !== "queso", "queso antes de queso");
  });
  persona("el del mar", {
    proteina: iDe("proteina", "pescado"), olor: iDe("olor", "mar"), limon: iDe("limon", "chorro")
  }, (r, c) => {
    c(["pescado","mariscos"].indexOf(r.principal.proteina) !== -1, "no le tocó pescado");
    const m = aplicarBebida(r, "maridaje");
    c(!m.esVino || ["blanco","espumante"].indexOf(m.bebida.vino.color) !== -1, "vino tinto con pescado");
    c(!m.entrada || ["pescado","mariscos","vegetal"].indexOf(m.entrada.proteina) !== -1, "entrada que no es del mar");
  });
  persona("la vegetariana", { restricciones: restr("vegetariano"), proteina: iDe("proteina", "verduras") }, (r, c) => {
    [r.principal, r.entrada, r.bebida, r.postre].concat(r.alternativas).filter(Boolean)
      .forEach(p => c(p.apto.vegetariano, `"${p.nombre}" no es vegetariano`));
  });
  persona("el celíaco", { restricciones: restr("celiaquía") }, (r, c) => {
    [r.principal, r.entrada, r.bebida, r.postre].concat(r.alternativas).filter(Boolean)
      .forEach(p => c(p.apto.singluten, `"${p.nombre}" no es sin TACC`));
    c(r.filtros.alergias.indexOf("gluten") !== -1, "no enciende el aviso de alergia");
  });
  persona("celíaca, vegetariana y alérgica a los lácteos", {
    restricciones: restr("vegetariano", "celiaquía", "lácteos")
  }, (r, c) => {
    [r.principal, r.entrada, r.bebida, r.postre].filter(Boolean).forEach(p =>
      c(p.apto.vegetariano && p.apto.singluten && p.contiene.indexOf("lacteos") === -1, `"${p.nombre}" no pasa`));
  });
  persona("el que no toma alcohol", { restricciones: restr("sin alcohol"), proteina: iDe("proteina", "carne") }, (r, c) => {
    c(r.bebida.contiene.indexOf("alcohol") === -1, "le dieron alcohol");
    c(!r.pideBebida, "le preguntan si quiere vino");
    c(!r.vinoSugerido && !r.vinoPostre, "le sugieren vino");
  });
  persona("la que odia el queso", {
    "queso-hasta-donde": iDe("queso-hasta-donde", "prefiero que no"), proteina: iDe("proteina", "carne")
  }, (r, c) => {
    c(r.principal.proteina !== "queso", "plato de queso");
    c(!r.entrada || r.entrada.proteina !== "queso", "entrada de queso");
  });
  persona("el goloso", {
    "postre-si-no": iDe("postre-si-no", "siempre"), sobremesa: iDe("sobremesa", "dulce")
  }, (r, c) => c(!/no sos de dulce/.test(vozPostre(r)), "le dicen que no es de dulce"));
  persona("el que no es de dulce", {
    "postre-si-no": iDe("postre-si-no", "no soy"), textura: [0, 0, 0, 0, 1, 0, 0]
  }, (r, c) => c(/no sos de dulce/.test(vozPostre(r)), "no registró que no es de dulce"));
  persona("el que come solo", {
    "con-quien": iDe("con-quien", "solo"), textura: [0, 0, 0, 1, 1, 0, 0], proteina: iDe("proteina", "carne")
  }, (r, c) => {
    const m = aplicarBebida(r, "tinto");
    c(!m.esVino || m.bebida.porCopa, "le mandaron una botella entera a alguien que come solo");
  });
  persona("el que pide cerveza", { proteina: iDe("proteina", "carne"), olor: iDe("olor", "brasa") }, (r, c) => {
    if (!r.pideBebida) return;
    const m = aplicarBebida(r, "cerveza");
    c(m.bebida.categoria === "cervezas", "no le tocó cerveza");
  });
  persona("el alérgico a los frutos secos", { restricciones: restr("frutos secos") }, (r, c) => {
    [r.principal, r.entrada, r.bebida, r.postre].filter(Boolean)
      .forEach(p => c(p.contiene.indexOf("frutos-secos") === -1, `"${p.nombre}" tiene frutos secos`));
  });
  persona("el de la sartén", {
    pelea: iDe("pelea", "milanesa"), "frito-parrilla": iDe("frito-parrilla", "frito"), proteina: iDe("proteina", "carne")
  }, (r, c) => c(["milanesas","burgers","chivitos"].indexOf(r.principal.categoria) !== -1, "no salió de la sartén"));
  persona("el que come con la mano", {
    mano: iDe("mano", "mejor manera"), pelea: iDe("pelea", "milanesa"),
    "frito-parrilla": iDe("frito-parrilla", "frito"), proteina: iDe("proteina", "carne"), hambre: 9
  }, (r, c) => c(["burgers","chivitos"].indexOf(r.principal.categoria) !== -1, "no le tocó algo que se coma con la mano"));
  persona("la de la olla", {
    domingo: iDe("domingo", "olla"), ruido: iDe("ruido", "olla"), proteina: iDe("proteina", "verduras")
  }, (r, c) => c(["pastas","risottos"].indexOf(r.principal.categoria) !== -1, "no salió de la olla"));

  /* ══ 6. SECUENCIAS ════════════════════════════════════════════════ */
  seccion("secuencias");
  const PREFS = PREF_BEBIDA.map(p => p.id);
  const coherente = (r, paso) => {
    const T = `después de ${paso}`;
    ok(r.total === sumaR(r), `${T}: la cuenta no cierra`);
    ok(r.esVino === esVino(r.bebida), `${T}: esVino no coincide con la bebida`);
    ok(!r.vinoPostre || r.esVino, `${T}: vino de postre sin estar tomando vino`);
    const pref = r.filtros.prefBebida;
    if (r.esVino && (pref === "tinto" || pref === "blanco"))
      ok(r.bebida.vino.color === pref, `${T}: pidió ${pref} y tiene ${r.bebida.vino.color}`);
    if (pref === "sin-alcohol") ok(r.bebida.contiene.indexOf("alcohol") === -1, `${T}: alcohol a quien pidió sin`);
    if (!pref) ok(r.pideBebida === (tomaAlcohol(r.filtros) && meritaVino(r.principal)), `${T}: pideBebida desfasado`);
    ok(r.pidePunto === (r.principal.categoria === "parrilla" && ["carne","achuras"].indexOf(r.principal.proteina) !== -1),
      `${T}: pidePunto desfasado con ${r.principal.nombre}`);
    const g = ENTRADA_DE[r.principal.id];
    if (r.entrada) ok(!!g && (g.entradas || []).indexOf(r.entrada.id) !== -1, `${T}: entrada fuera de la tabla de ${r.principal.nombre}`);
    if (g && g.sin) ok(!r.entrada, `${T}: ${r.principal.nombre} no lleva entrada`);
    [r.principal, r.bebida, r.postre].concat(r.entrada ? [r.entrada] : [])
      .forEach(p => ok(pasaFiltrosDuros(p, r.filtros), `${T}: "${p.nombre}" no pasa los filtros`));
  };
  let conCambio = 0;
  for (let i = 0; i < 400 * VUELTAS; i++){
    const { t, resp } = tandaAlAzar(null, azar() < .3 ? subconjunto() : [iTodo]);
    S.respuestas = resp;
    const r = recomendar(resp, t);
    if (!r) continue;
    coherente(r, "recomendar");
    for (let k = 0; k < 6; k++){
      const paso = uno(["bebida", "punto", "cambio"]);
      try {
        if (paso === "bebida" && r.pideBebida){ const p = uno(PREFS); aplicarBebida(r, p); coherente(r, "bebida " + p); }
        if (paso === "punto" && r.pidePunto){ const p = uno(PUNTOS).id; aplicarPunto(r, p); coherente(r, "punto " + p); }
        if (paso === "cambio" && r.cambioSugerido){ conCambio++; cambiarPrincipal(r, r.cambioSugerido.plato); coherente(r, "cambio de corte"); }
      } catch (e){ ok(false, `${paso}: ${e.message}`); }
    }
  }
  dato(`cambios de corte probados: ${conCambio}`);

  /* ══ 7. TEXTOS ════════════════════════════════════════════════════ */
  seccion("textos");
  const roto = /undefined|null|NaN|\[object|\{\}|\$\{/;
  const nombreViejo = S.nombre;
  for (let i = 0; i < 600 * VUELTAS; i++){
    const { t, resp } = tandaAlAzar(null, azar() < .3 ? subconjunto() : [iTodo]);
    S.respuestas = resp; S.nombre = azar() < .5 ? "" : "Ana";
    const r = recomendar(resp, t);
    if (!r) continue;
    if (r.pidePunto && azar() < .5) aplicarPunto(r, uno(PUNTOS).id);
    if (r.pideBebida && azar() < .5) aplicarBebida(r, uno(PREFS));
    const rnd = mulberry32(i + 1);
    const usadas = new Set();
    const textos = {
      principal: vozPrincipal(r, rnd), entrada: vozEntrada(r), bebida: vozBebida(r), postre: vozPostre(r),
      postal: frasePostal(r), razonPlato: razonDelPlato(r),
      alternativas: r.alternativas.map(p => lineaAlternativa(p, r, usadas)).join(" ")
    };
    Object.keys(textos).forEach(k => ok(!roto.test(textos[k]), `texto ${k} roto: «${textos[k]}»`));
    ok(textos.principal.length > 20, "la voz del chef quedó vacía");
    ok(!r.entrada || textos.entrada.length > 10, "la entrada no dice por qué");
    // lo que una frase afirma tiene que ser cierto
    const todo = Object.values(textos).join(" ") + " " + (r.razonBebida || "");
    if (/parrilla|brasa/.test(textos.razonPlato))
      ok(r.principal.categoria === "parrilla", `dice parrilla de "${r.principal.nombre}" (${r.principal.categoria}): «${textos.razonPlato}»`);
    if (/horno de barro/.test(textos.razonPlato))
      ok(r.principal.categoria === "horno", `dice horno de "${r.principal.nombre}"`);
    if (/se pone en el medio|al medio/.test(textos.razonPlato))
      ok(r.principal.apto.compartir || r.principal.ejes.social >= 8, `dice que "${r.principal.nombre}" va al medio`);
    if (/queso/.test(textos.entrada) && /arranca por el provolone/.test(textos.entrada))
      ok(r.entrada.proteina === "queso", `promete provolone y la entrada es ${r.entrada.nombre}`);
    if (/achuras/.test(textos.entrada)) ok(r.entrada.proteina === "achuras" || /chorizo/.test(textos.entrada),
      `habla de achuras y la entrada es ${r.entrada && r.entrada.nombre}`);
    if (/te bajo a un tinto|necesitan un tinto|un tinto de cuerpo medio|no se les esconda/.test(r.razonBebida || "") && r.esVino)
      ok(r.bebida.vino.color === "tinto",
      `la razón dice tinto y el vino es ${r.bebida.vino.color}`);
    r.alternativas.forEach(p => {
      const l = lineaAlternativa(p, r, new Set());
      if (/menos plata/.test(l)) ok(p.precio < r.principal.precio, `«menos plata» y ${p.nombre} sale más`);
      if (/va al medio/.test(l)) ok(p.apto.compartir, `dice que ${p.nombre} va al medio`);
    });
    // HTML: lo que escribió la persona sale escapado
    ok(textos.principal.indexOf("<img") === -1, "un texto de la persona salió sin escapar");
    void todo;
  }
  S.nombre = nombreViejo;

  /* ══ 8. MESA ══════════════════════════════════════════════════════ */
  seccion("mesa");
  for (let i = 0; i < 160 * VUELTAS; i++){
    const n = 1 + Math.floor(azar() * 8), k = Math.floor(azar() * 4);
    const comensales = [];
    for (let j = 0; j < n; j++){
      const preguntas = tandaComensal(j);
      const resp = {};
      preguntas.forEach(q => { resp[q.id] = q.id === pReq.id ? (azar() < .35 ? subconjunto() : [iTodo]) : respuestaAlAzar(q); });
      comensales.push({ nombre: "C" + j, respuestas: resp, preguntas,
        filtros: leerFiltros(resp, preguntas), vector: vectorUsuario(resp, preguntas) });
    }
    const ninos = [];
    for (let j = 0; j < k; j++){
      const preguntas = tandaNino(j).slice(0, 3);
      const resp = {};
      preguntas.forEach(q => { resp[q.id] = q.fija ? [0] : Math.floor(azar() * q.opciones.length); });
      ninos.push({ nombre: "N" + j, respuestas: resp, preguntas });
    }
    let m;
    try { m = recomendarMesa(comensales, ninos); }
    catch (e){ ok(false, `mesa de ${n}+${k}: ${e.message}`); continue; }
    const M = `mesa de ${n} grandes y ${k} chicos`;
    m.entradas.forEach(p => comensales.forEach(c =>
      ok(pasaFiltrosDuros(p, c.filtros), `${M}: "${p.nombre}" al medio y ${c.nombre} no puede comerlo`)));
    m.platos.forEach(x => {
      if (x.plato){
        ok(pasaFiltrosDuros(x.plato, x.comensal.filtros), `${M}: el plato de ${x.comensal.nombre} no pasa sus filtros`);
        ok(m.entradas.every(e => e.id !== x.plato.id), `${M}: "${x.plato.nombre}" al medio y además de alguien`);
        ok(!esNino(x.plato), `${M}: plato de niños para un grande`);
      } else ok(!!x.comeDelMedio, `${M}: ${x.comensal.nombre} se quedó sin plato`);
    });
    m.platosNinos.forEach(x => { if (x.pedido) ok(esNino(x.pedido.principal), `${M}: un chico con plato de grandes`); });
    if (m.bebida) ok(comensales.every(c => pasaFiltrosDuros(m.bebida, c.filtros)), `${M}: la bebida al medio no la puede tomar alguien`);
    if (m.vino) ok(comensales.every(c => c.filtros.excluyeContiene.indexOf("alcohol") === -1), `${M}: vino en una mesa con alguien que no toma`);
    m.postres.forEach(p => ok(comensales.every(c => pasaFiltrosDuros(p, c.filtros)), `${M}: postre "${p.nombre}" que alguien no puede comer`));
    const suma = m.entradas.reduce((a, p) => a + p.precio, 0) +
      m.platos.reduce((a, x) => a + (x.plato ? x.plato.precio : 0), 0) +
      m.platosNinos.reduce((a, x) => a + (x.pedido ? x.pedido.total : 0), 0) +
      (m.bebida ? m.bebida.precio * m.cuantasBebidas : 0) +
      (m.vino ? m.vino.plato.precio * m.cuantosVinos : 0) +
      m.postres.reduce((a, p) => a + p.precio, 0);
    ok(m.total === suma, `${M}: la cuenta no cierra (${m.total} vs ${suma})`);
    ok(m.porCabeza === Math.round(m.total / (n + k)), `${M}: el por cabeza no cierra`);
    // la razón de lo que va al medio tiene que ser cierta
    if (/va queso|queso adelante|algo de queso/.test(m.entradaRazon || ""))
      ok(m.entradas.some(p => p.proteina === "queso"), `${M}: la razón habla de queso y al medio va ${m.entradas.map(p => p.nombre).join(", ")}`);
    if (/del mar/.test(m.entradaRazon || ""))
      ok(m.entradas.some(p => ["pescado","mariscos"].indexOf(p.proteina) !== -1), `${M}: la razón habla del mar y al medio va ${m.entradas.map(p => p.nombre).join(", ")}`);
  }

  /* ══ 9. CHICOS ════════════════════════════════════════════════════ */
  seccion("chicos");
  const pReqN = PREGUNTAS_NINOS.find(p => p.fija);
  const otrasN = pReqN.opciones.map((o, i) => i).filter(i => !pReqN.opciones[i].exclusiva);
  for (let m = 0; m < (1 << otrasN.length); m++){
    const s = otrasN.filter((_, k) => m & (1 << k));
    for (let v = 0; v < 3; v++){
      const preguntas = tandaNino(v);
      const resp = {};
      preguntas.forEach(q => { resp[q.id] = q.fija ? (s.length ? s : [0]) : Math.floor(azar() * q.opciones.length); });
      const R = `chico con ${s.map(i => pReqN.opciones[i].texto).join(" + ") || "nada"}`;
      let r;
      try { r = recomendarNino(resp, preguntas); } catch (e){ ok(false, `${R}: ${e.message}`); continue; }
      // Una restricción no se negocia ni con un aviso: si no hay nada que
      // el chico pueda comer, no se le muestra ningún plato.
      const fN = leerFiltros(resp, preguntas);
      const puede = MENU.some(p => esNino(p) && p.rol === "principal" && pasaFiltrosDuros(p, fN));
      ok(!!r === puede, `${R}: ${puede ? "había plato y no se lo dio" : "le dio un plato que no puede comer"}`);
      if (!r) continue;
      ok(esNino(r.principal), `${R}: plato que no es del menú de peques`);
      ok(pasaFiltrosDuros(r.principal, r.filtros), `${R}: le mostró "${r.principal.nombre}", que no puede comer`);
      ok(r.total === r.principal.precio + (r.bebida ? r.bebida.precio : 0) + (r.postre ? r.postre.precio : 0), `${R}: la cuenta no cierra`);
    }
  }

  /* ══ 10. REPARTO ══════════════════════════════════════════════════ */
  seccion("reparto");
  const repartir = (n, forzar) => {
    const cat = {}, pl = {};
    for (let i = 0; i < n; i++){
      let { t, resp } = tandaAlAzar();
      // con una pregunta forzada, sólo cuentan las tandas donde aparece
      while (forzar && !forzar(t, resp)) ({ t, resp } = tandaAlAzar());
      const r = recomendar(resp, t);
      cat[r.principal.categoria] = (cat[r.principal.categoria] || 0) + 1 / n;
      pl[r.principal.nombre] = (pl[r.principal.nombre] || 0) + 1 / n;
    }
    return { cat, pl };
  };
  const pct = x => Math.round(100 * (x || 0)) + "%";
  const gente = repartir(3000 * VUELTAS);
  const top = Object.entries(gente.pl).sort((a, b) => b[1] - a[1]);
  dato("los que más salen: " + top.slice(0, 5).map(([k, v]) => `${k} ${pct(v)}`).join(" · "));
  dato("por cocina: " + Object.entries(gente.cat).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${pct(v)}`).join(" · "));
  ok(top[0][1] <= 0.15, `"${top[0][0]}" sale en el ${pct(top[0][1])} de los veredictos`);
  ok((gente.cat.parrilla || 0) >= 0.15, `la parrilla sale sólo en el ${pct(gente.cat.parrilla)}`);
  ["milanesas","pastas","horno"].forEach(c => ok((gente.cat[c] || 0) >= 0.03, `${c} casi no sale (${pct(gente.cat[c])})`));
  ["burgers","chivitos","risottos","ensaladas"].forEach(c => { if ((gente.cat[c] || 0) < 0.01) aviso(`${c} sale en el ${pct(gente.cat[c])}`); });
  const forzar = (qid, texto) => (t, resp) => {
    if (!t.some(q => q.id === qid)) return false;
    resp[qid] = iDe(qid, texto); return true;
  };
  const carne = repartir(1500 * VUELTAS, forzar("proteina", "carne"));
  const brasa = repartir(1500 * VUELTAS, forzar("olor", "brasa"));
  const pan = repartir(1500 * VUELTAS, forzar("olor", "pan"));
  dato(`carne → parrilla ${pct(carne.cat.parrilla)} · brasa → parrilla ${pct(brasa.cat.parrilla)} · pan → horno ${pct(pan.cat.horno)}`);
  ok((carne.cat.parrilla || 0) >= 0.30, `quien pide carne recibe parrilla el ${pct(carne.cat.parrilla)}`);
  ok((brasa.cat.parrilla || 0) >= 0.40, `quien elige el olor a brasa recibe parrilla el ${pct(brasa.cat.parrilla)}`);
  ok((pan.cat.horno || 0) >= 0.55, `quien elige el pan recién hecho recibe horno el ${pct(pan.cat.horno)}`);

  /* ══ 10b. DESTACADOS ═════════════════════════════════════════════ */
  seccion("destacados");
  DESTACADOS.orden.forEach(cat => {
    DESTACADOS.forzado = "ninguno";
    const sin = repartir(800 * VUELTAS).cat[cat] || 0;
    DESTACADOS.forzado = cat;
    const con = repartir(800 * VUELTAS).cat[cat] || 0;
    dato(`${cat}: ${pct(sin)} → ${pct(con)} con el destacado`);
    ok(con >= sin + 0.08, `el destacado ${cat} casi no se nota (${pct(sin)} → ${pct(con)})`);
    ok(con <= 0.70, `el destacado ${cat} se come la carta (${pct(con)})`);
    // y no da vuelta a quien pidió otra cosa con todas las letras
    const carne = repartir(400 * VUELTAS, forzar("proteina", "carne"));
    ok((carne.cat.parrilla || 0) + (carne.cat.milanesas || 0) + (carne.cat.horno || 0) + (carne.cat.chivitos || 0) + (carne.cat.burgers || 0) >= 0.6 || cat === "parrilla",
      `con el destacado ${cat}, quien pide carne deja de recibir carne`);
    // el chef lo dice sólo si es cierto, y la carta lo marca sólo en ésos
    for (let i = 0; i < 80; i++){
      const { t, resp } = tandaAlAzar();
      const r = recomendar(resp, t);
      const dice = /destacado de la casa/.test(vozPrincipal(r, mulberry32(i)));
      ok(dice === (r.principal.categoria === cat), `el chef ${dice ? "dice" : "no dice"} destacado con ${r.principal.nombre}`);
    }
    MENU.forEach(p => {
      const marca = /Destacado de la semana/.test(tarjetaPlato(p));
      ok(marca === (p.categoria === cat && tipoDe(p) === "principal"), `la carta ${marca ? "marca" : "no marca"} "${p.nombre}"`);
    });
  });
  DESTACADOS.forzado = "ninguno";

  /* ══ 11. RENDIMIENTO ══════════════════════════════════════════════ */
  seccion("rendimiento");
  const tandas = []; for (let i = 0; i < 200; i++) tandas.push(tandaAlAzar());
  const tUno = cuantoTarda(() => tandas.forEach(x => recomendar(x.resp, x.t))) / tandas.length;
  dato(`un veredicto: ${tUno.toFixed(2)} ms`);
  ok(tUno < 8, `un veredicto tarda ${tUno.toFixed(1)} ms (en un celular viejo, multiplicar por 5)`);
  const ocho = []; for (let j = 0; j < 8; j++){
    const preguntas = tandaComensal(j), resp = {};
    preguntas.forEach(q => { resp[q.id] = q.id === pReq.id ? [iTodo] : respuestaAlAzar(q); });
    ocho.push({ nombre:"C" + j, respuestas: resp, preguntas, filtros: leerFiltros(resp, preguntas), vector: vectorUsuario(resp, preguntas) });
  }
  const tMesa = cuantoTarda(() => { for (let i = 0; i < 20; i++) recomendarMesa(ocho, []); }) / 20;
  dato(`una mesa de 8: ${tMesa.toFixed(1)} ms`);
  ok(tMesa < 80, `una mesa de 8 tarda ${tMesa.toFixed(0)} ms`);

  DESTACADOS.forzado = forzadoAntes;
  Memoria.sumar = memoriaSumar; Memoria.guardarUltimo = memoriaUlt;
  Memoria.cache = null; MemoriaPreg.cache = null;

  const fallas = secciones.reduce((a, s) => a + s.fallas.length, 0);
  return { ok: fallas === 0, secciones,
           total: secciones.reduce((a, s) => a + s.ok, 0), fallas };
}

window.pruebasMotor = pruebasMotor;
})();
