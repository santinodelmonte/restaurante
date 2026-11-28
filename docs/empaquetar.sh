#!/usr/bin/env bash
# Arma la carpeta Bofomento/ y Bofomento.zip, listas para subir al sitio de Aura.
# Sólo va lo que el sitio usa: index.html y las fotos. Nada de docs/, PDFs ni planillas.
# Uso, desde la raíz del repo:  bash docs/empaquetar.sh
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist && mkdir -p dist/Bofomento/img/platos
cp index.html dist/Bofomento/
cp img/platos/*.jpg dist/Bofomento/img/platos/
(cd dist && zip -qr Bofomento.zip Bofomento)
echo "Listo: dist/Bofomento/ ($(find dist/Bofomento -type f | wc -l) archivos) y dist/Bofomento.zip ($(du -h dist/Bofomento.zip | cut -f1))"
