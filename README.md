# BO | Fomento — carta digital + Chef recomendador

Demo comercial. Un solo archivo: `index.html`. Se abre con doble clic, sin
servidor, sin `npm install`, sin backend y sin llamadas a ninguna API.
Lo único que sale a la red son las fuentes de Google Fonts, y si no cargan
el sitio se ve igual de bien con las tipografías de sistema.

## Qué hay adentro

**La carta.** Categorías reales del local, búsqueda por texto y filtros
rápidos (vegetariano, sin TACC, para compartir). Cada plato con nombre,
descripción, precio en pesos uruguayos y sus etiquetas a la vista.

**El Chef.** Un chat que hace preguntas —casi ninguna sobre comida— y
termina recomendando un plato principal, dos alternativas, una bebida y un
postre. Ese combo es el que sube el ticket promedio.

## El motor

No hay IA, no hay API, no hay backend. Es scoring local: costo cero por
usuario, latencia cero, anda con mala señal y es determinístico, así que se
puede testear y nunca improvisa una barbaridad delante del dueño.

Cinco ejes de 0 a 10 —`contundencia`, `aventura`, `social`, `frescura`,
`dulce`— que comparten platos, respuestas y persona.

1. Los filtros duros (vegetariano, sin gluten, algo que odie) **sacan platos
   del pool** y no se negocian con ningún puntaje.
2. Los filtros blandos (hambre, presupuesto) no eliminan a nadie: penalizan.
3. Las respuestas de sabor arman el vector del usuario.
4. Cada plato se puntúa por distancia euclidiana invertida contra ese vector.
5. Empate → gana el plato que menos veces salió recomendado; si sigue
   empatado, aleatorio con semilla.

El signo, la música y el domingo ideal mueven un eje como máximo ±1 y sobre
todo alimentan el copy. Si el signo definiera el plato, dos personas
idénticas con distinto cumpleaños comerían distinto y el truco se cae solo.

### Tres correcciones que no son obvias

- **Centrado por datos.** El 5 de cada eje no está en el cero de la escala:
  está en el promedio de lo que ofrecen las preguntas. Si tres de cuatro
  opciones suben `frescura`, cualquiera que conteste sale fresco y sólo
  ganan los platos fríos. Se corrige contra el promedio real, así que sigue
  andando si se reescriben las preguntas.
- **Ganancia.** El tope de un eje es la suma de los máximos de cada
  pregunta, y para alcanzarlo habría que elegir la opción más extrema en
  todas. Sin ganancia el vector vive pegado al 5 y los platos fuertes, que
  viven en los extremos, no ganan nunca.
- **Pesos por varianza.** Un eje en el que todos los candidatos valen lo
  mismo no sirve para elegir entre ellos: si todas las milanesas son 0 de
  dulce, `dulce` sólo agrega distancia muerta. Cada eje se pesa por lo que
  ese pool realmente varía.

## Autotest

Abrir `index.html?test=1`, o llamar `bofoTest()` desde la consola. Recorre
más de 15.000 combinaciones de respuestas y verifica los criterios de
aceptación: que un vegetariano nunca reciba carne, que ningún camino lleve a
un veredicto incompleto, y que el veredicto siempre tenga respuestas
concretas para citar.

## Clonarlo a otro restaurante

Se cambian sólo dos constantes al principio del `<script>`: `MENU` (con
`CATEGORIAS`) y `PREGUNTAS`. El motor no sabe nada de Bo Fomento.

## Identidad

La dirección visual sale de la carta impresa, no de una idea propia: azul
marino sobre blanco, la trama de olas de fondo, el sello circular
«BO • FOMENTO / ESTAMOS EN LA PLAYA» y los zigzags que separan las
subsecciones. Tres roles tipográficos, los mismos tres que usa el papel:
brush en mayúscula para las secciones, script para los remates, y una sans
limpia para los platos y los precios.

El Chef es la misma carta de noche: el mismo azul, invertido.

El único color que no está en la carta impresa es el arena del acento, que
existe porque un monocromo no puede dar jerarquía a un botón. Va donde hace
falta y en ningún otro lado.

## Pendiente

Estas secciones de la carta todavía no están cargadas porque no vinieron en
las imágenes: **vinos** y **milanesas / burgers**. Se agregan al array
`MENU` con la misma forma que el resto; no hay que tocar nada más.
