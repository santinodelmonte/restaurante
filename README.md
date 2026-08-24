# BO | Fomento — carta digital + Chef recomendador

Demo comercial. Un solo archivo: `index.html`. Se abre con doble clic, sin
servidor, sin `npm install`, sin backend y sin llamadas a ninguna API.
Lo único que sale a la red son las fuentes de Google Fonts, y si no cargan
el sitio se ve igual de bien con las tipografías de sistema.

## Qué hay adentro

**La carta.** Categorías reales del local, búsqueda por texto y filtros
rápidos (vegetariano, sin TACC, para compartir). Cada plato con nombre,
descripción, precio en pesos uruguayos y sus etiquetas a la vista.

**El Chef.** Una experiencia de chat que termina recomendando un plato
principal, dos alternativas, una bebida y un postre. Ese combo es el que
sube el ticket promedio.

No es un test que se hace una vez. El banco tiene 35 preguntas y cada
corrida arma su propia tanda con las que la persona vio menos veces, así
que dos corridas seguidas sólo comparten los tres filtros: las otras nueve
son distintas. La rotación se guarda en el celular.

Hay seis formatos de pregunta: botones, grilla de emojis, deslizador con
el chef comentando mientras arrastrás, "elegí rápido" con tres segundos de
reloj, ráfagas de esto-o-aquello, y campos para escribir. Siempre entra al
menos un juego por tanda.

Casi ninguna pregunta es sobre comida: son situaciones absurdas en la
arena, vivencias, y cosas que no le contás a cualquiera. Varias no puntúan
nada —están para que la persona se abra y para que el chef tenga qué
citarle— y eso es a propósito.

El nombre es opcional, se pide una sola vez y no sale del celular. Lo que
la persona escribe el chef se lo devuelve textual en el veredicto, sin
interpretarlo: es lo que más impacto tiene y lo que menos puede fallar.

**El Vasco.** El chef tiene cara. Es un parrillero dibujado en SVG con la
misma línea del sello —gorra, bigote, delantal, pinzas— y seis gestos que
cambian solos según lo que está pasando: saluda, piensa, te guiña cuando
te carga, se sorprende, duda y remata. Respira y parpadea; con
`prefers-reduced-motion` se queda quieto. Va inline y no con `<use>`,
porque `<use>` arma un shadow tree y `display` no se hereda: desde afuera
no se podrían prender y apagar las capas de gesto.

Te carga con tu nombre apenas se lo decís, y en la mesa se ríe de los
nombres repetidos.

**Armá la mesa.** Decís cuántos son y el celular da la vuelta: cada uno
pone su nombre y contesta tres cosas. Al final El Vasco arma el pedido de
todos —qué va al medio, un plato para cada uno, qué tomar y el postre— con
el total y cuánto sale por cabeza. Lo que va al medio se filtra contra la
intersección de las restricciones de la mesa entera: si hay un celíaco,
nadie comparte algo con gluten. En una mesa de tres o más la bebida es
para compartir, porque nadie pide cuatro vasos sueltos.

**La tarjeta.** El veredicto termina en una tarjeta pensada para que le
saquen captura: sello, nombre, plato y una frase corta del Vasco. El botón
de compartir usa el menú del propio celular y, si no hay, copia al
portapapeles.

**Modo sol y carta hablada.** Un botón sube el contraste a tope y agranda
el texto para leer con el sol de frente —el problema número uno de una
carta digital en un parador— y otro hace que el navegador lea la carta en
voz alta, para el que se olvidó los lentes de cerca. Los dos son locales:
sin backend y sin costo.

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

Las preguntas de tipo `chamuyo` no puntúan nada. Como la tanda cambia en
cada corrida, el vector se calcula contra el promedio y el tope de las
preguntas que efectivamente se hicieron, así que tandas distintas siguen
dando vectores comparables.

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
1.664 tandas reales —armadas por el mismo selector que ve la gente— con
respuestas al azar en los seis formatos, y verifica los criterios de
aceptación: que un vegetariano nunca reciba carne, que ningún camino lleve
a un veredicto incompleto, que las dos alternativas nunca sean de la misma
categoría, que el veredicto siempre tenga respuestas concretas para citar,
y que dos corridas seguidas no repitan ni una sola pregunta rotativa.

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
