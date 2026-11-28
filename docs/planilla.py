#!/usr/bin/env python3
"""Arma la planilla de alérgenos que se le manda a Bo Fomento para completar.

Lee el MENU de index.html y escribe docs/planilla-alergenos-bo-fomento.xlsx
con todos los platos de la carta y nuestra lectura preliminar de cada uno.
Lo que el local corrija en la planilla vuelve después al array MENU.

Uso:  python3 docs/planilla.py      (requiere openpyxl)
"""
import json
import re
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

RAIZ = Path(__file__).resolve().parent.parent
FUENTE = RAIZ / "index.html"
SALIDA = RAIZ / "docs" / "planilla-alergenos-bo-fomento.xlsx"

MARINO, ESPUMA, ONDA, ARENA = "1B3A57", "F6F9FB", "CBD9E3", "FDF0D8"

ALERGENOS = [
    ("gluten", "Gluten"), ("lacteos", "Lácteos"), ("huevo", "Huevo"),
    ("pescado", "Pescado"), ("mariscos", "Mariscos"), ("frutos-secos", "Frutos secos"),
    ("cerdo", "Cerdo"), ("carne", "Carne"), ("pollo", "Pollo"), ("alcohol", "Alcohol"),
]

COLUMNAS = [
    ("#", 5), ("Categoría", 20), ("Sección", 18), ("Plato", 34), ("Precio $", 10),
    ("Vegetariano", 12), ("Vegano", 11), ("Sin gluten", 12), ("Para compartir", 14),
] + [(n, 11) for _, n in ALERGENOS] + [("Picante", 10), ("Notas / correcciones", 40)]

PRIMERA_MARCA = 6                                   # columna de «Vegetariano»
COL_SIN_GLUTEN = 8
COL_NOTAS = len(COLUMNAS)

# Los vinos quedan afuera: no hay nada que clasificar, son todos
# vegetarianos, sin gluten y con alcohol.
FUERA = {"vinos"}

# Las salsas de las pastas no son platos de la carta, pero cambian los
# alérgenos de cada pasta: unos ñoquis con 4 quesos tienen lácteos y con
# fileto no. Se clasifican aparte.
SALSAS = [
    ("Boloñesa", {"carne"}),
    ("Fileto", set()),
    ("4 quesos", {"lacteos"}),
    ("Tuco de pollo", {"pollo"}),
    ("Pesto", {"lacteos", "frutos-secos"}),
    ("Camarones", {"mariscos", "lacteos"}),
]


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
    crudo = re.sub(r"/\*.*?\*/", "", crudo, flags=re.S)       # comentarios de sección
    crudo = re.sub(r"(?m)//.*$", "", crudo)
    crudo = re.sub(r"([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:", r'\1"\2":', crudo)  # claves con comillas
    crudo = re.sub(r",(\s*[}\]])", r"\1", crudo)              # comas colgadas
    return json.loads(crudo)


def leer_menu():
    return [p for p in leer_js("MENU") if p["categoria"] not in FUERA]


def si_no(v):
    return "sí" if v else "no"


ANIMAL = {"lacteos", "huevo", "pescado", "mariscos", "carne", "cerdo", "pollo", "achuras"}


def es_vegano(p):
    """Propuesta preliminar: vegetariano y sin ningún ingrediente animal declarado."""
    return bool(p["apto"].get("vegetariano")) and not (ANIMAL & set(p.get("contiene", [])))


def nota(p):
    if p["categoria"] == "pastas":
        return "Marcar la pasta sola. Las salsas van abajo, en «Salsas de las pastas»."
    if "frito" in p["nombre"].lower() or "fritas" in p["nombre"].lower() or "papas fritas" in p.get("descripcion", "").lower():
        return "¿Se fríe en el mismo aceite que los rebozados?"
    return ""


def encabezado(ws, fila=1):
    borde = Side(style="thin", color=MARINO)
    for col, (titulo, ancho) in enumerate(COLUMNAS, start=1):
        c = ws.cell(row=fila, column=col, value=titulo)
        c.font = Font(bold=True, color="FFFFFF", size=9)
        c.fill = PatternFill("solid", fgColor=MARINO)
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        c.border = Border(bottom=borde)
        ws.column_dimensions[get_column_letter(col)].width = ancho
    ws.row_dimensions[fila].height = 32
    ws.freeze_panes = f"E{fila + 1}"
    ws.auto_filter.ref = f"A{fila}:{get_column_letter(len(COLUMNAS))}{fila}"


def validaciones(ws, ultima):
    """Desplegables sí/no en todas las columnas que se marcan."""
    dv = DataValidation(type="list", formula1='"sí,no"', allow_blank=True)
    dv.error = "Poné sí o no."
    dv.errorTitle = "Valor no válido"
    ws.add_data_validation(dv)
    for col in range(PRIMERA_MARCA, COL_NOTAS):
        letra = get_column_letter(col)
        dv.add(f"{letra}2:{letra}{max(ultima, 2)}")


def hoja_instrucciones(wb, total):
    ws = wb.create_sheet("Cómo completar", 0)
    ws.column_dimensions["A"].width = 3
    ws.column_dimensions["B"].width = 104
    texto = [
        ("t", "PLANILLA DE ALÉRGENOS — BO FOMENTO"),
        ("s", "Carta digital + el genio · Aura Marketing · Temporada 2026-27"),
        ("", ""),
        ("h", "Qué hay que hacer"),
        ("p", f"En la hoja «Platos» están los {total} platos de la carta de este año, con el precio de la "
              "carta impresa. Cada fila se marca con sí o no en las columnas de color."),
        ("p", "Las casillas ya vienen con NUESTRA LECTURA de la carta. Es una propuesta, no un dato "
              "confirmado: lo que no corrijan, lo damos por bueno y sale publicado así."),
        ("p", "Las pastas se marcan solas, sin la salsa. Las salsas tienen su propia sección al final de "
              "la hoja, porque cambian los alérgenos según cuál se elija."),
        ("p", "Los vinos no están: son todos vegetarianos, sin gluten y con alcohol."),
        ("", ""),
        ("h", "Qué significa cada columna"),
        ("p", "Vegetariano · sin carne, pollo, pescado ni mariscos. Puede llevar lácteos y huevo."),
        ("p", "Vegano · además, sin lácteos, huevo ni miel. Ojo con la manteca de la plancha y los aderezos."),
        ("p", "Sin gluten · sin trigo, avena, cebada ni centeno: harina, pan rallado, rebozados, panko, "
              "salsas espesadas, cerveza."),
        ("p", "Para compartir · si tiene sentido pedirlo para el centro de la mesa."),
        ("p", "Alérgenos · marcar sí en todo lo que el plato contenga, aunque sea en poca cantidad. "
              "Gluten, lácteos, huevo, frutos secos y mariscos son las cinco alergias que la persona puede "
              "marcar en el sitio: esas columnas son las más importantes."),
        ("p", "Alcohol · para que el genio no se lo recomiende a quien pidió algo sin alcohol."),
        ("p", "Picante · para avisarlo en la ficha del plato."),
        ("p", "Precio · si alguno está mal, se corrige ahí mismo."),
        ("", ""),
        ("h", "Lo importante"),
        ("p", "En el sitio, los filtros de vegetariano, sin gluten y las alergias SACAN platos de la "
              "recomendación: no los penalizan, los eliminan. Un plato mal marcado se le recomienda a la "
              "persona equivocada con total seguridad. Por eso pedimos que esta planilla la revise alguien "
              "de cocina antes de devolverla."),
        ("p", "Contaminación cruzada: si un plato no lleva harina pero se fríe en el mismo aceite que los "
              "rebozados, no es apto para celíacos. En ese caso va no en «Sin gluten» y se aclara en Notas. "
              "Las casillas resaltadas en «Sin gluten» son las que declaramos aptas: son las que más "
              "conviene revisar."),
        ("p", "Igual que hoy, el sitio le pide a la persona con alergias que lo confirme con el mozo. La "
              "planilla no reemplaza esa pregunta, pero hace que el genio no le ofrezca algo que no puede comer."),
        ("p", "Publicamos exactamente lo que ustedes marcan y no lo cambiamos por nuestra cuenta."),
        ("", ""),
        ("h", "Cuando esté pronta"),
        ("p", "Nos la mandan por WhatsApp o mail y la cargamos en el sitio."),
        ("", ""),
        ("s", "Aura Marketing · +598 92 681 102 · auramkt.uy"),
    ]
    fila = 2
    for tipo, linea in texto:
        c = ws.cell(row=fila, column=2, value=linea)
        c.alignment = Alignment(wrap_text=True, vertical="top")
        if tipo == "t":
            c.font = Font(bold=True, size=16, color=MARINO)
        elif tipo == "s":
            c.font = Font(size=10, color="4A6379")
        elif tipo == "h":
            c.font = Font(bold=True, size=12, color=MARINO)
        else:
            c.font = Font(size=10)
            ws.row_dimensions[fila].height = 15 * (1 + len(linea) // 95)
        fila += 1
    return ws


def escribir_fila(ws, r, valores, raya, borde):
    for col, valor in enumerate(valores, start=1):
        c = ws.cell(row=r, column=col, value=valor)
        c.font = Font(size=9)
        c.border = borde
        c.alignment = Alignment(
            horizontal="center" if PRIMERA_MARCA <= col < COL_NOTAS else "left",
            vertical="top", wrap_text=col in (4, COL_NOTAS),
        )
        if raya and col < PRIMERA_MARCA:
            c.fill = PatternFill("solid", fgColor=ESPUMA)


def main():
    cats = {c["id"]: c["nombre"] for c in leer_js("CATEGORIAS")}
    menu = leer_menu()
    wb = Workbook()
    ws = wb.active
    ws.title = "Platos"
    encabezado(ws)

    marca = PatternFill("solid", fgColor=ARENA)
    borde = Border(bottom=Side(style="hair", color=ONDA))

    r = 1
    for n, p in enumerate(menu, start=1):
        contiene = set(p.get("contiene", []))
        r += 1
        escribir_fila(ws, r, [
            n, cats.get(p["categoria"], p["categoria"]), p.get("sub", ""), p["nombre"], p["precio"],
            si_no(p["apto"].get("vegetariano")), si_no(es_vegano(p)),
            si_no(p["apto"].get("singluten")), si_no(p["apto"].get("compartir")),
        ] + [si_no(k in contiene) for k, _ in ALERGENOS] + ["no", nota(p)], n % 2 == 0, borde)
        # Lo que declara «sin gluten» queda resaltado: es lo más riesgoso de la planilla.
        if p["apto"].get("singluten"):
            ws.cell(row=r, column=COL_SIN_GLUTEN).fill = marca

    # ── Las salsas de las pastas ────────────────────────────────────
    r += 2
    t = ws.cell(row=r, column=2, value="Salsas de las pastas")
    t.font = Font(bold=True, size=11, color=MARINO)
    for k, (salsa, contiene) in enumerate(SALSAS, start=1):
        r += 1
        veg = not ({"carne", "pollo", "pescado", "mariscos", "cerdo"} & contiene)
        escribir_fila(ws, r, [
            f"S{k}", "Pastas", "Salsas", salsa, "",
            si_no(veg), si_no(veg and not (ANIMAL & contiene)), "no", "no",
        ] + [si_no(a in contiene) for a, _ in ALERGENOS] + ["no", ""], k % 2 == 0, borde)

    validaciones(ws, r)
    hoja_instrucciones(wb, len(menu))
    wb.active = 0
    SALIDA.parent.mkdir(exist_ok=True)
    wb.save(SALIDA)
    print(f"Planilla lista: {SALIDA} ({len(menu)} platos y {len(SALSAS)} salsas)")


if __name__ == "__main__":
    main()
