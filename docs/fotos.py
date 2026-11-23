#!/usr/bin/env python3
"""Las fotos de los platos: estado, carga y planilla.

    python3 docs/fotos.py estado
        Qué platos tienen foto y cuáles no, por categoría, y qué archivos de
        img/platos/ no le corresponden a ningún plato o no cumplen el tamaño.

    python3 docs/fotos.py cargar CARPETA [--mapa MAPA.csv] [--destino DIR]
        Toma las fotos tal como salen de la cámara, las endereza, las lleva
        a 1.200 px de ancho, las comprime a menos de 200 KB y las guarda
        como img/platos/<id>.jpg. El id sale, en este orden, de:
          1. el mapa (CSV con columnas `archivo` e `id`, ver `planilla`);
          2. el nombre del archivo, si ya es un id de la carta;
          3. el nombre viejo, si es de la carta de prueba y el plato sigue
             en la oficial con otro id (RENOMBRES).
        Lo que no se puede ubicar no se carga: se lista al final.
        Con --destino se escribe en otra carpeta, para probar sin tocar
        img/platos/.

    python3 docs/fotos.py planilla
        Escribe docs/fotos-bo-fomento.xlsx: todos los platos de la carta con
        su id y una columna para anotar qué archivo de la sesión es cada
        uno. Guardada como CSV (archivo, id), es el --mapa de `cargar`.

Requiere Pillow (cargar) y openpyxl (planilla).
"""
import argparse
import csv
import io
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
FUENTE = RAIZ / "index.html"
FOTOS = RAIZ / "img" / "platos"
PLANILLA = RAIZ / "docs" / "fotos-bo-fomento.xlsx"

ANCHO = 1200          # lo que pide la imagen que se comparte (1080 px)
ANCHO_MINIMO = 1000   # abajo de esto se nota en la imagen compartida
PESO_MAXIMO = 200 * 1024
EXTENSIONES = {".jpg", ".jpeg", ".png", ".heic", ".webp", ".tif", ".tiff"}

# La foto de banco de imágenes que está de muestra. Sale con la primera
# tanda de fotos reales: el documento del cliente promete que no queda.
MUESTRA = "ojo-bife.jpg"

# La sesión de fotos se planeó con la carta de prueba. Estos platos siguen
# en la carta oficial con otro id; los que no están acá salieron de la
# carta (calzones, vacío, rack de cordero, lemon pie…) y sus fotos no se
# cargan.
RENOMBRES = {
    "molleja-verdeo": "mollejas-verdeo",
    "stella-noire": "stella-noir",
    "franziscaner": "franziskaner",
    "bayleys": "baileys",
    "flan-ddl": "flan-casero",
    "tartas-frutales": "tarta-frutal",
    "brownie-helado": "brownie",
    "mousse-sin": "mousse-chocolate",
    "cafe": "expreso",
    "limonada-jarra": "limonada-menta",   # era la misma limonada, cargada dos veces
}

# Los de la carta de prueba que no están en la oficial. Sus fotos, si
# llegan, no se cargan: se avisan aparte para no confundirlas con una foto
# que no se pudo ubicar.
SALIERON = {
    "arrolladitos", "faina-espinaca", "calzone-jq", "calzone-aceitunas", "calzone-cebolla",
    "calzone-capresse", "calzone-espinaca", "pan-bata", "vacio", "matambre-arrollado",
    "ojo-champinones", "picana-mostaza", "medallon-lomo", "rack-cordero", "salmon-camarones",
    "helado-2", "lemon-pie", "degustacion-cheesecake", "bombon-ddl", "franui",
    "copa-frutilla", "panqueques-ddl",
}


# ── la carta ─────────────────────────────────────────────────────────
def leer_js(nombre):
    """Saca un array de index.html sin ejecutar JavaScript."""
    src = FUENTE.read_text(encoding="utf-8")
    i = src.index(f"const {nombre} = [")
    inicio = src.index("[", i)
    prof, j = 0, inicio
    while j < len(src):
        if src[j] == "[":
            prof += 1
        elif src[j] == "]":
            prof -= 1
            if prof == 0:
                j += 1
                break
        j += 1
    crudo = src[inicio:j]
    crudo = re.sub(r"/\*.*?\*/", "", crudo, flags=re.S)
    crudo = re.sub(r"(?m)//.*$", "", crudo)
    crudo = re.sub(r"([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:", r'\1"\2":', crudo)
    crudo = re.sub(r",(\s*[}\]])", r"\1", crudo)
    return json.loads(crudo)


def carta():
    cats = {c["id"]: c["nombre"] for c in leer_js("CATEGORIAS")}
    orden = list(cats)
    menu = leer_js("MENU")
    menu.sort(key=lambda p: orden.index(p["categoria"]))
    return menu, cats


# ── estado ───────────────────────────────────────────────────────────
def medir(ruta):
    try:
        from PIL import Image
        with Image.open(ruta) as im:
            return im.size
    except Exception:
        return None


def estado(_args):
    menu, cats = carta()
    ids = {p["id"] for p in menu}
    archivos = {f.stem: f for f in FOTOS.glob("*.jpg")}

    print(f"Fotos en {FOTOS.relative_to(RAIZ)}: {len(archivos)}\n")
    total_con = 0
    for cat, nombre in cats.items():
        platos = [p for p in menu if p["categoria"] == cat]
        con = [p for p in platos if p["id"] in archivos]
        total_con += len(con)
        barra = "█" * round(10 * len(con) / max(1, len(platos)))
        print(f"  {nombre:<24} {len(con):>3} de {len(platos):<3} {barra}")
    print(f"\n  {'Total':<24} {total_con:>3} de {len(menu)}")

    avisos = []
    if MUESTRA[:-4] in archivos:
        avisos.append(f"{MUESTRA} es la foto de banco de imágenes: se borra con la primera tanda real.")
    for stem, f in sorted(archivos.items()):
        if stem not in ids:
            avisos.append(f"{f.name} no es de ningún plato de la carta.")
            continue
        peso = f.stat().st_size
        tam = medir(f)
        if peso > PESO_MAXIMO:
            avisos.append(f"{f.name} pesa {peso // 1024} KB (máximo {PESO_MAXIMO // 1024}).")
        if tam and tam[0] < ANCHO_MINIMO:
            avisos.append(f"{f.name} tiene {tam[0]} px de ancho (mínimo {ANCHO_MINIMO}).")
        if tam and tam[1] > tam[0]:
            avisos.append(f"{f.name} es vertical: la app la recorta al centro, horizontal.")
    if avisos:
        print("\nPara revisar:")
        for a in avisos:
            print("  · " + a)
    return 0


# ── cargar ───────────────────────────────────────────────────────────
def leer_mapa(ruta):
    """CSV con columnas `archivo` e `id` (también acepta `;` como separador)."""
    texto = Path(ruta).read_text(encoding="utf-8-sig")
    dialecto = csv.Sniffer().sniff(texto.splitlines()[0], delimiters=",;\t")
    filas = csv.DictReader(io.StringIO(texto), dialect=dialecto)
    mapa = {}
    for f in filas:
        claves = {k.strip().lower(): (v or "").strip() for k, v in f.items() if k}
        archivo, pid = claves.get("archivo", ""), claves.get("id", "")
        if archivo and pid:
            mapa[archivo.lower()] = pid
            mapa[Path(archivo).stem.lower()] = pid
    return mapa


def a_jpeg(origen):
    """Abre, endereza según la cámara, lleva a ANCHO y comprime bajo PESO_MAXIMO.

    Devuelve (bytes, ancho original, era_vertical, calidad)."""
    from PIL import Image, ImageOps
    with Image.open(origen) as im:
        im = ImageOps.exif_transpose(im)
        im = im.convert("RGB")
        ancho_original = im.width
        # Una vertical se recorta al centro en 4:3 horizontal: la app la
        # mostraría recortada igual, y así no carga píxeles que nadie ve.
        vertical = im.height > im.width
        if vertical:
            alto = round(im.width * 3 / 4)
            arriba = (im.height - alto) // 2
            im = im.crop((0, arriba, im.width, arriba + alto))
        # Si a 1.200 px no entra en el peso, se prueba a 1.080, que es el
        # ancho de la imagen que se comparte: más chico ya se notaría.
        for ancho in (ANCHO, 1080):
            cuadro = im if im.width <= ancho else im.resize(
                (ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
            for calidad in (86, 82, 78, 74, 70, 66, 62, 58):
                buf = io.BytesIO()
                cuadro.save(buf, "JPEG", quality=calidad, optimize=True, progressive=True)
                if buf.tell() <= PESO_MAXIMO:
                    return buf.getvalue(), ancho_original, vertical, calidad
        return buf.getvalue(), ancho_original, vertical, calidad


def cargar(args):
    menu, _ = carta()
    ids = {p["id"] for p in menu}
    mapa = leer_mapa(args.mapa) if args.mapa else {}
    destino = Path(args.destino) if args.destino else FOTOS
    destino.mkdir(parents=True, exist_ok=True)

    origenes = sorted(f for f in Path(args.carpeta).iterdir()
                      if f.is_file() and f.suffix.lower() in EXTENSIONES)
    cargadas, sin_ubicar, fuera_de_carta, problemas, avisos = [], [], [], [], []
    usados = {}
    for f in origenes:
        nombre = f.name.lower()
        pid = mapa.get(nombre) or mapa.get(f.stem.lower())
        if not pid and f.stem.lower() in ids:
            pid = f.stem.lower()
        if not pid and f.stem.lower() in RENOMBRES:
            pid = RENOMBRES[f.stem.lower()]
        if not pid and f.stem.lower() in SALIERON:
            fuera_de_carta.append(f"{f.name} → {f.stem.lower()}, que salió de la carta")
            continue
        if not pid:
            sin_ubicar.append(f.name)
            continue
        if pid not in ids:
            fuera_de_carta.append(f"{f.name} → {pid}")
            continue
        if pid in usados:
            avisos.append(f"{f.name} y {usados[pid]} son los dos de «{pid}»: queda la última.")
        usados[pid] = f.name
        try:
            datos, ancho_original, vertical, calidad = a_jpeg(f)
        except Exception as e:                                   # HEIC sin soporte, archivo roto
            problemas.append(f"{f.name}: no se pudo abrir ({e.__class__.__name__}).")
            continue
        (destino / f"{pid}.jpg").write_bytes(datos)
        cargadas.append(pid)
        if ancho_original < ANCHO_MINIMO:
            avisos.append(f"{pid}.jpg viene de {ancho_original} px: se va a notar en la imagen compartida.")
        if vertical:
            avisos.append(f"{pid}.jpg era vertical: se recortó al centro en horizontal. Mirala.")
        if len(datos) > PESO_MAXIMO:
            avisos.append(f"{pid}.jpg quedó en {len(datos) // 1024} KB aun con calidad {calidad}.")

    # La de muestra sale con la primera tanda real, salvo que justo haya
    # llegado la foto real del ojo de bife, que ya la pisó.
    muestra = destino / MUESTRA
    if cargadas and muestra.exists() and "ojo-bife" not in cargadas and not args.destino:
        muestra.unlink()
        avisos.append(f"Se borró {MUESTRA}, la foto de banco de imágenes de muestra.")

    print(f"Cargadas: {len(cargadas)} en {destino}")
    for titulo, lista in (("Sin ubicar (no están en el mapa ni son un id)", sin_ubicar),
                          ("De platos que no están en la carta", fuera_de_carta),
                          ("No se pudieron abrir", problemas),
                          ("Para revisar", avisos)):
        if lista:
            print(f"\n{titulo}: {len(lista)}")
            for x in lista:
                print("  · " + x)
    print("\nDespués: python3 docs/fotos.py estado, y la prueba de humo (docs/humo.js).")
    return 1 if problemas else 0


# ── planilla ─────────────────────────────────────────────────────────
def planilla(_args):
    from openpyxl import Workbook
    from openpyxl.styles import Alignment, Font, PatternFill
    menu, cats = carta()
    archivos = {f.stem for f in FOTOS.glob("*.jpg")} - {MUESTRA[:-4]}

    wb = Workbook()
    ws = wb.active
    ws.title = "Fotos"
    cab = ["id", "Categoría", "Sección", "Plato", "¿Ya tiene foto?", "archivo"]
    anchos = [26, 22, 22, 44, 14, 28]
    marino = PatternFill("solid", fgColor="1B3A57")
    for c, (t, a) in enumerate(zip(cab, anchos), start=1):
        celda = ws.cell(row=1, column=c, value=t)
        celda.font = Font(bold=True, color="FFFFFF", size=9)
        celda.fill = marino
        celda.alignment = Alignment(horizontal="center", vertical="center")
        ws.column_dimensions[celda.column_letter].width = a
    ws.freeze_panes = "A2"
    for r, p in enumerate(menu, start=2):
        fila = [p["id"], cats.get(p["categoria"], p["categoria"]), p.get("sub", ""), p["nombre"],
                "sí" if p["id"] in archivos else "no", ""]
        for c, v in enumerate(fila, start=1):
            ws.cell(row=r, column=c, value=v).font = Font(size=9)
    ws.auto_filter.ref = f"A1:F{len(menu) + 1}"

    ins = wb.create_sheet("Cómo usarla", 0)
    ins.column_dimensions["A"].width = 100
    for i, linea in enumerate([
        "FOTOS DE LOS PLATOS — BO FOMENTO",
        "",
        "En la columna «archivo» va el nombre del archivo de la cámara que es la foto de ese plato",
        "(por ejemplo IMG_4021.JPG). Una foto por plato; los que no tienen foto quedan vacíos.",
        "",
        "Después: Archivo → Guardar como → CSV, y se carga con",
        "    python3 docs/fotos.py cargar CARPETA_DE_LA_SESION --mapa fotos.csv",
        "",
        "La herramienta las endereza, las lleva a 1.200 px de ancho, las comprime a menos de 200 KB",
        "y las guarda con el nombre que corresponde. No hace falta renombrar nada a mano.",
        "",
        "Si las fotos ya están nombradas con el id del plato, no hace falta la planilla.",
    ], start=1):
        celda = ins.cell(row=i, column=1, value=linea)
        celda.font = Font(bold=(i == 1), size=12 if i == 1 else 10, color="1B3A57" if i == 1 else None)
    wb.active = 0
    wb.save(PLANILLA)
    print(f"Planilla lista: {PLANILLA} ({len(menu)} ítems, {len(archivos)} con foto)")
    return 0


def main():
    ap = argparse.ArgumentParser(description="Las fotos de los platos de Bo Fomento.")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("estado").set_defaults(fn=estado)
    c = sub.add_parser("cargar")
    c.add_argument("carpeta")
    c.add_argument("--mapa")
    c.add_argument("--destino")
    c.set_defaults(fn=cargar)
    sub.add_parser("planilla").set_defaults(fn=planilla)
    args = ap.parse_args()
    sys.exit(args.fn(args))


if __name__ == "__main__":
    main()
