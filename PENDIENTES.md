# Pendientes — Bo Fomento

La carta oficial y el menú de peques ya están cargados. La planilla de
alérgenos la mandamos nosotros para que el local la complete. Todo lo que
sigue es trabajo nuestro, en el orden en que conviene hacerlo.

Lo acordado con el local (propuesta de setiembre 2026 y documento de la
reunión de cambios), en pesos uruguayos con IVA incluido:

- Puesta en marcha: $ 32.000 de lista, o $ 25.000 contratando también el
  plan de redes.
- Mensualidad: Esencial $ 2.900 o Temporada $ 4.900.
- Fotos en la carta y en la recomendación: $ 5.000 aparte.
- Pago: 50% al arranque y 50% contra entrega.

## 1. Cargar el material recibido

- [x] **Carta oficial:** cargada desde la carta impresa, sin descripciones
      inventadas (sólo las que trae la carta). 186 ítems y 65 vinos.
- [x] **Milanesas, burgers, chivitos, pastas, risottos, ensaladas y
      guarniciones:** cargadas como categorías propias.
- [x] **Vinos:** actualizados a la carta nueva (65 etiquetas, precios nuevos,
      altas de Bo Fomento, Cerro del Toro, Fin del Mundo, Trumpeter, Rutini).
- [x] **Menú de peques:** los 3 platos que decidió el local. Tito recomienda
      sólo el plato; las preguntas de bebida y postre no entran mientras el
      menú de peques no tenga bebida ni postre.
- [x] **Planilla de alérgenos para completar:**
      `docs/planilla-alergenos-bo-fomento.xlsx`, con nuestra lectura
      preliminar y las salsas de las pastas aparte.
- [ ] Mandar la planilla de alérgenos al local.
- [ ] Cargar en el `MENU` lo que devuelvan en la planilla.
- [ ] **Massini:** la descripción no se lee en la carta impresa. Pedirla al
      local; hoy va sin descripción.
- [ ] **Limonada con menta repetida:** la carta trae «Limonada natural con
      menta» ($ 340, en Refrescos) y «Jarra limonada con menta 1L» ($ 340, en
      Licuados). Confirmar con el local si son dos productos distintos.
- [ ] **Nombres:** reemplazar «El Vasco» y «Tito» en textos, frases, la
      tarjeta para compartir, la voz de Tito y el README.
- [ ] **Platos a empujar:** cargar el campo `margen`.

## 2. Ajustar el motor contra la carta oficial

- [ ] **Ejes de cada plato:** ya están cargados con una primera pasada
      nuestra (los seis ejes, `proteina` y `empieza`). Falta revisarlos
      probando el chef, sobre todo las categorías nuevas: milanesas,
      burgers, chivitos, pastas, risottos y ensaladas.
- [ ] **Guarniciones:** hoy el chef no las recomienda. Evaluar sugerir una
      guarnición junto a los platos de parrilla, que en la carta van solos.
- [ ] **Vino después del plato:**
  - Sacar `bebida-pref` de la tanda de preguntas.
  - Preguntar por el vino sólo si el plato lo pide, según `meritaVino`.
  - Repartir los pesos que esa pregunta daba a intensidad, untuosidad y
    acidez.
- [ ] **Entradas definidas a mano:**
  - Decidir qué entrada va con cada principal y qué platos no llevan entrada.
  - Ajustar el autotest, que hoy exige entrada siempre.
  - Que no salga más queso antes de un plato con queso, como el provolone
    antes del caliente.
- [ ] **Punto de la carne:** revisar qué platos cuentan como corte de
      parrilla y en qué punto sufre cada uno.
- [ ] **Horno de barro o parrilla sin preguntarlo:**
  - Diseñar preguntas sensoriales que sumen afinidad a esa cocina.
  - Que se citen en «Lo que me dijiste».
- [ ] **Banco de preguntas:**
  - Decidir si se llega a las 35 que promete la propuesta (hoy son 29
    rotativas).
  - Revisar las frases con la voz y el nombre definitivos.
- [x] **Tito:** las opciones de «lo que más te gusta» ahora apuntan a los
      tres platos reales (papas fritas, puré, fideos, pollito, salsa de
      tomate, carne).
- [ ] **Autotest:** sumar una verificación por cada cambio de este grupo:
  - que no se pregunte por el vino si no se recomienda vino;
  - que la entrada sea la definida para ese principal;
  - que la preferencia horno/parrilla se note en el resultado.
- [ ] Correr el autotest (`index.html?test=1`) y la prueba de humo
      (`docs/humo.js`) hasta que todo dé verde.

## 3. Fotos (sólo si contrataron las fotos, $ 5.000)

- [ ] Cargar las 136 fotos de la sesión en el local en
      `img/platos/<id>.jpg`, siguiendo `img/platos/LEEME.txt`.
- [ ] Hacer coincidir el nombre de cada foto con el id de su plato en la
      carta nueva.
- [ ] Optimizar el peso de las fotos para que la carta cargue rápido con mala
      señal.
- [ ] Borrar `img/platos/ojo-bife.jpg`, que es de banco de imágenes.
- [ ] Revisar que se vean bien en la carta, en el visor, en el veredicto, en
      la tarjeta para compartir y en modo sol.

## 4. Identidad y genio

- [ ] Ajustar la paleta, las tipografías y el sello con Aura, si hay cambios.
- [ ] Ajustar la cara del genio y la de su ayudante a los nombres y la
      personalidad definidos.
- [ ] Rediseñar la tarjeta para compartir junto con Aura.
- [ ] Diseñar el QR con arte propio para mesa, vidriera y bio de Instagram.

## 5. Puesta en producción

- [ ] Registrar el dominio a nombre de Bo Fomento.
- [ ] Contratar el hosting, el certificado de seguridad y los respaldos.
- [ ] Incrustar las fuentes de Google en el archivo para no depender de
      internet.
- [ ] Publicar y correr `docs/humo.js` contra la URL real, para confirmar que
      la tarjeta sale con la foto.
- [ ] Probar en celulares reales, iOS y Android:
  - compartir la imagen a Instagram;
  - sonido, vibración y voz de Tito;
  - modo sol y carta hablada;
  - modo claro y oscuro;
  - conexión lenta.
- [ ] Revisar la accesibilidad: lector de pantalla y movimiento reducido.
- [ ] Generar los QR finales con el dominio definitivo antes de imprimirlos,
      para no tener que cambiarlos después.

## 6. Entrega y lanzamiento

- [ ] Mandarles el link de prueba para que lo usen con el equipo.
- [ ] Hacer una ronda de correcciones con lo que devuelvan.
- [ ] Hacer la revisión final con el local.
- [ ] Imprimir los QR y ponerlos en las mesas.
- [ ] Salir al aire y coordinar el anuncio en redes con Aura.
- [ ] Cobrar el 50% restante.

## 7. Documentación interna

- [ ] Actualizar el README: sacar las secciones de «Pendiente» y «Cuando
      llegue el menú oficial» y dejar documentado cómo quedó.
- [ ] Escribir un instructivo de actualización de la carta para el soporte
      mensual: cómo cambiar un precio o un plato, cómo subir una foto y cómo
      verificar antes de publicar.
- [ ] Mergear la rama de trabajo a `main` al cierre.

## Opcional (se cotiza aparte, sólo si lo piden)

- Carta en inglés y portugués.
- Métricas de uso.
- Pedido por WhatsApp.
- Reservas.
- Modo temporada para prender y apagar secciones.
- Panel para que ellos mismos cambien precios.
- Pantalla en el local.
- Fidelidad y sorteos.
