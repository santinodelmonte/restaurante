# BO | Fomento — carta digital + Chef recomendador

Demo comercial. `index.html` se abre con doble clic, sin servidor, sin
`npm install`, sin backend y sin llamadas a ninguna API. Al lado va la
carpeta `img/`, que es donde vive lo único que no está adentro del archivo:
las fotos de los platos. Lo demás que sale a la red son las fuentes de
Google Fonts, y si no cargan el sitio se ve igual de bien con las
tipografías de sistema.

## Qué hay adentro

**La carta.** Categorías reales del local, búsqueda por texto y filtros
rápidos (vegetariano, sin TACC, para compartir). Cada plato con nombre,
descripción, precio en pesos uruguayos, sus etiquetas y su foto.

**El Chef.** Una experiencia de chat que termina armando la mesa entera:
entrada, plato principal, alternativas, algo para tomar y el postre.
El orden de la pantalla es el orden en que las cosas llegan a la mesa, y
no es casualidad: una entrada que aparece abajo, al lado del postre, no se
pide.

No es un test que se hace una vez. El banco tiene 29 preguntas rotativas y
cada corrida arma su propia tanda con las que la persona vio menos veces,
así que dos corridas seguidas sólo comparten los dos filtros. La rotación
se guarda en el celular.

Hay cinco formatos: botones, grilla de opciones, deslizador con el chef
comentando mientras arrastrás, una ronda de pares, y campos para escribir.
Ninguno es un juego: el reloj de tres segundos se fue, y con él la regla
que forzaba a que entrara un juego por tanda. Lo lúdico quedó del lado de
Tito, que es donde corresponde.

**Todas las preguntas son sobre comida.** La mitad son directas —con qué
te quedás si tenés que elegir una sola cosa, cómo te gusta que llegue la
comida, hasta dónde llegás con el queso— y la otra mitad son sensoriales
—qué olor te da hambre de golpe, el primer bocado o el último, cómo queda
tu plato cuando terminás—. Las directas le dan al motor con qué acertar;
las sensoriales son las que hacen que la persona se sienta leída.

Quedan dos preguntas para escribir a mano. El chef las devuelve textual en
el veredicto, sin interpretarlas: es lo que más impacto tiene y lo que
menos puede fallar.

El nombre es opcional, se pide una sola vez y no sale del celular.

**El Vasco.** El chef tiene cara. Es un parrillero dibujado en SVG con la
misma línea del sello —gorra, bigote, delantal, pinzas— y seis gestos que
cambian solos según lo que está pasando. Respira y parpadea; con
`prefers-reduced-motion` se queda quieto. Va inline y no con `<use>`,
porque `<use>` arma un shadow tree y `display` no se hereda: desde afuera
no se podrían prender y apagar las capas de gesto.

Su voz es la de alguien que sabe de comida, no la de un comediante: tutea,
usa tu nombre y es cálido, pero no carga a nadie. El criterio va adelante
y el chiste, si cae, cae solo.

**La entrada, elegida contra el plato.** No se elige contra la persona: se
elige contra lo que viene después, que es como se arma una comida. Antes
de una carne va queso —abre el apetito y aguanta los veinte minutos de
parrilla—; antes de un pescado va algo del mar y con acidez, para no
taparlo. El chef lo explica en una línea, que es lo que hace que se pida.

**El punto de la carne.** Cuando el principal es un corte de la parrilla,
el chef pregunta el punto *después* de recomendarlo. Con la respuesta
reelige el vino —bien cocida la carne pierde el jugo que ablanda el tanino—
y, si el corte sufre en ese punto, lo dice antes y ofrece el cambio. No lo
cambia solo: el que decide qué come es el que se lo va a comer.

**El vino.** La carta real del local: 49 etiquetas, de $260 la copa de la
casa a $8.400 el Cru d'Exception. Marida de verdad: mira cuerpo, tanino y
acidez del vino contra lo que pide el plato según su proteína y lo graso
que sea. Por eso resuelve los casos que "carne tinto, pescado blanco" no
cubre. Pasa al frente sólo cuando el plato lo pide; si no, va la bebida de
siempre y el vino queda al costado como sugerencia.

Tres cosas que la carta real obligó a agregar y la inventada no:

- **El precio del plato es la referencia.** Por perfil, el Cru d'Exception
  marida una carne igual de bien que el Don Pascual —son los dos Tannat—
  así que el desempate al azar mandaba la botella de $8.400 arriba de un
  asado de $580 una de cada seis veces. Se penaliza el exceso contra el
  precio del plato en vez de prohibirlo: si de verdad no hay nada mejor,
  la botella cara puede salir; lo que no puede es salir por empate.
- **La copa de la casa.** Una botella entera para alguien que vino solo y
  no comparte es mucha botella. Cuando el eje `social` está bajo, la copa
  gana; en una mesa de seis, pierde.
- **No hay ningún rosado seco.** Los únicos rosados de esta carta son
  cosecha tardía, dulces. El perfil de las verduras apuntaba a rosado, o
  sea a algo que no existe: ahora el color lo decide cómo está hecho el
  plato —una parmeggiana gratinada pide tinto liviano, una ensalada pide
  blanco—.

**El vino del postre.** La carta trae cuatro cosecha tardía y un demi sec
que con el maridaje contra el plato fuerte no los recomendaba nadie: un
vino dulce nunca gana contra una carne. Se calculan aparte, contra el
postre, y el color lo decide el postre: chocolate y dulce de leche piden
tinto, las frutas piden blanco o rosado, y lo que va al medio de la mesa
pide burbuja. Sólo se ofrece a quien ya está tomando vino.

**Armá la mesa.** Decís cuántos grandes son, si vienen chicos, y el celular
da la vuelta. Al final El Vasco arma el pedido de todos con el total y
cuánto sale por cabeza. Lo que va al medio se filtra contra la intersección
de las restricciones de la mesa entera: si hay un celíaco, nadie comparte
gluten. Y se elige contra la proteína dominante de la mesa: si la mayoría
pidió carne, al medio va queso. Lo que está al medio no se le sirve además
a alguien como plato propio.

**Tito, el Chef Kid.** Un personaje aparte, ayudante del Vasco, para los
chicos de 5 a 10. Recomienda **sólo** del menú de niños, y el Vasco no ve
ese menú nunca: las dos reglas están verificadas en el autotest.

No hay juegos para la espera: el juego es pedir. El chico **cocina con
Tito**, y cada respuesta es algo que hace en la cocina:

- lo que más le gusta lo tira a la olla, tocándolo o arrastrándolo, y queda
  flotando;
- crocante o blandita sube o baja el fuego; "¿probás cosas nuevas?" le
  echa polvo mágico; el hambre agranda o achica la olla; el color pinta la
  salsa;
- la bebida y el postre van a la mesada, al lado;
- "¿hay algo que no podés comer?" no va a la olla: es una lista que se
  marca, porque es un contrato y no un ingrediente. Recién al cerrarla se
  prende el fuego.

Arriba, una receta con un casillero por pregunta se va llenando con lo que
eligió. Con todo adentro, revuelve tocando la olla, entra al horno, cuenta
3-2-1, suena la campanita y sale su plato con confeti. Las preguntas y los
pesos son los mismos de antes: sólo cambió cómo se contestan.

Tiene sonido —sintetizado en el navegador, sin archivos—, vibración suave
y Tito lee en voz alta cada pregunta, para el que todavía no lee bien. Un
botón arriba lo apaga todo, y queda apagado para la próxima visita. Con
`prefers-reduced-motion` no hay vuelos, temblores ni confeti.

Mientras atiende Tito, **la carta muestra sólo la de los chicos**, con un
aviso y un botón para que un grande vea la carta entera.

En la mesa, a cada chico se le pasa el celular y cocina lo mismo, con tres
preguntas y menos vueltas de cuchara, y "elegile vos" siempre a mano. Lo
que sale de su horno es exactamente lo que después aparece en el pedido de
la mesa. Que haya chicos además baja lo más raro de lo que va al medio.

**Las fotos.** Una por plato, en `img/platos/<id>.jpg`. Sumar una foto es
copiar un archivo. Mientras no está, no deja ningún hueco: la carta se ve
exactamente como sin fotos. La lógica va al revés de lo obvio —la caja no
ocupa nada hasta que la foto carga— porque con `loading="lazy"` las de más
abajo no se piden hasta que alguien scrollea, así que nunca fallan y el
hueco se quedaba para siempre.

En la carta la foto es una miniatura al costado y nada más: el que lee una
carta está comparando platos y precios, y una foto por plato a todo el
ancho convierte 137 renglones en un scroll de media hora. La que quiera
verla la toca y se abre en grande, con el nombre y el precio abajo —el que
abre la foto de un plato está a un paso de pedirlo y no hay que mandarlo de
vuelta a buscar cuánto sale—. La lupa aparece sólo sobre las fotos que
existen: un afordance sobre una caja vacía es una promesa que no se cumple.

Donde la foto sí va grande es en el veredicto del chef, que es una sola
recomendación y no una lista, y en la tarjeta para compartir.

Con el modo sol prendido las fotos se quedan; lo que cambia es que se les
marca el borde, porque sobre blanco puro una foto clara se desarma.

**Alergias.** La primera pregunta separa lo que la persona elige de lo que
le hace mal: celiaquía, lácteos, huevo, frutos secos y mariscos se marcan
aparte, se ven distinto y filtran igual de duro que el resto. Pero además
encienden un aviso en el veredicto, y eso es lo que importa: el motor sabe
lo que dice la carta que cargamos —que es nuestra lectura del papel
impreso— y la cocina sabe lo que pasa adentro de la olla. Entre esas dos
cosas hay una distancia que ningún filtro puede cerrar, así que se dice y
se manda a confirmar con el mozo.

En la mesa el aviso dice otra cosa, porque la verdad es otra: lo que va al
medio pasa los filtros de todos, pero el plato individual del de al lado no
tiene por qué. Prometer que la mesa entera está limpia sería mentir, y acá
no se puede.

Marcar una alergia también poda las preguntas que quedaron sin sentido:
preguntarle a alguien alérgico a los lácteos hasta dónde llega con el queso
no es sólo perder una pregunta, es decirle que no lo escuchaste dos
pantallas atrás.

**Lo que me dijiste.** El veredicto abre con las respuestas de la persona
escritas, y debajo de cada una qué hizo el chef con ella: *«Que el olor a
brasa te desarma — por eso te llevo a la parrilla y no al horno»*. Va
arriba de la recomendación y no abajo, porque el orden importa: primero se
demuestra que escuchaste y recién después se dice qué pedir. Al revés
suena a que la recomendación ya estaba elegida y las preguntas eran
decorado. Es lo único de la pantalla que la persona no puede atribuir a la
suerte.

Las consecuencias que afirman un resultado llevan condición y se verifican
contra el veredicto real: una frase escrita de antemano no sabe qué más
marcó la persona dos pantallas atrás, así que "la entrada va con queso" no
se muestra si la entrada no es de queso. Cuando la condición no se cumple,
el eco se muestra igual, sin la segunda mitad.

**La tarjeta.** El veredicto termina en una tarjeta con la foto del plato,
el sello, el nombre —con el punto de la carne, si lo hubo— y una frase
corta del Vasco.

El botón no comparte texto: **arma una imagen**. La tarjeta se vuelve a
dibujar en un `canvas` de 1080 × 1350 —el vertical que Instagram no
recorta— y eso es lo que sale por el menú de compartir del celular, donde
Instagram es una opción más. Compartir texto no servía para lo único que la
gente hace con esto, que es subirlo: Instagram no recibe texto, recibe una
imagen. Publicar directo desde una página web, sin que la persona pase por
la app, no se puede —ninguna web puede— y está bien que sea así; lo que sí
se puede es dejarle la imagen hecha y que el paso que le queda sea elegir el
ícono.

En la compu no hay menú de compartir con archivos: ahí se baja el JPEG, que
es lo que esa persona iba a hacer igual. Y si la imagen no se puede armar,
el botón se esconde en vez de fallar: ofrecer compartir y después no poder
es peor que no ofrecerlo.

Un detalle del `canvas`: una foto traída de `file://` lo *mancha* y el
navegador no deja exportarlo. Así que si el archivo se abre con doble clic,
la imagen compartida sale sin la foto del plato —sello, nombre y frase, que
es la tarjeta de antes—. Servido desde una URL, que es como va a estar el
día que salga, sale completa. El reintento sin foto es automático.

**Modo sol y carta hablada.** Un botón sube el contraste a tope y agranda
el texto para leer con el sol de frente —el problema número uno de una
carta digital en un parador— y otro hace que el navegador lea la carta en
voz alta. Los dos son locales: sin backend y sin costo.

## El motor

No hay IA, no hay API, no hay backend. Es scoring local: costo cero por
usuario, latencia cero, anda con mala señal y es determinístico, así que se
puede testear y nunca improvisa una barbaridad delante del dueño.

Seis ejes de 0 a 10 que comparten platos y personas, y que hablan de comida
y no de estados de ánimo:

| eje | 0 | 10 |
|---|---|---|
| `intensidad` | suave | te pega en la cara |
| `untuosidad` | seco y limpio | graso, cremoso |
| `acidez` | redondo | filoso, limpia la boca |
| `aventura` | lo de siempre | sorprendeme |
| `social` | mi plato es mío | al medio de la mesa |
| `dulce` | salado | postre sí o sí |

La `untuosidad` es la que hace el trabajo nuevo: es la que pide una entrada
de queso antes de una carne y la que decide si el vino necesita tanino.

Cada plato lleva además `proteina` —de eso cuelgan el maridaje y la
entrada— y `empieza`, porque en una parrilla el provolone es una entrada
aunque la carta lo imprima bajo parrilla.

1. Los filtros duros (vegetariano, sin gluten, algo que no come) **sacan
   platos del pool** y no se negocian con ningún puntaje. Además esconden
   las opciones imposibles de las preguntas siguientes: a un vegetariano no
   se le ofrece "carne roja".
2. El hambre no elimina a nadie: penaliza. No hay preguntas sobre dinero,
   así que el precio no influye en la recomendación.
3. Las respuestas de sabor arman el vector del usuario.
4. Cada plato se puntúa por distancia euclidiana invertida contra ese vector.
5. Las afinidades declaradas ("me quedo con la carne") suman sin sacar a
   nadie del pool: es lo que hace que decirlo se note en el resultado. Su
   espejo, `evita`, resta fuerte: "prefiero que no" no es una alergia, pero
   el chef no puede citar esa respuesta y servir justo eso.
6. Las variantes del mismo plato no compiten entre sí. "Queso provolone" y
   "Queso provolone caprese" son el mismo plato con un agregado; ofrecer
   los dos no es dar a elegir. Si al sacarlas no quedan dos alternativas
   distintas, se ofrece una sola.
7. Empate → gana el plato que menos veces salió recomendado; si sigue
   empatado, aleatorio con semilla.

Las preguntas de tipo `chamuyo` no puntúan nada. Como la tanda cambia en
cada corrida, el vector se calcula contra el promedio y el tope de las
preguntas que efectivamente se hicieron, así que tandas distintas siguen
dando vectores comparables.

### Cuatro correcciones que no son obvias

- **Centrado por datos.** El 5 de cada eje no está en el cero de la escala:
  está en el promedio de lo que ofrecen las preguntas. Si tres de cuatro
  opciones suben `acidez`, cualquiera que conteste sale ácido y sólo ganan
  los platos con tomate. Se corrige contra el promedio real, así que sigue
  andando si se reescriben las preguntas. Medido: el usuario promedio sale
  entre 4,85 y 5,11 en los seis ejes.
- **Ganancia.** El tope de un eje es la suma de los máximos de cada
  pregunta, y para alcanzarlo habría que elegir la opción más extrema en
  todas. Sin ganancia el vector vive pegado al 5 y los platos fuertes, que
  viven en los extremos, no ganan nunca.
- **Pesos por varianza.** Un eje en el que todos los candidatos valen lo
  mismo no sirve para elegir entre ellos. Cada eje se pesa por lo que ese
  pool realmente varía.
- **La acidez pesa la mitad para elegir el plato fuerte.** Una persona no
  "tiene" un nivel de acidez como lo tiene un plato: tiene una preferencia
  sobre lo que la acompaña. Medida como distancia, la acidez castigaba
  sistemáticamente a la parrilla —que es poco ácida por naturaleza— y
  empujaba a todo el mundo a las pizzas. Donde vale entera es en la entrada
  y en el vino, que es donde de verdad decide.

## Autotest

Abrir `index.html?test=1`, o llamar `bofoTest()` desde la consola. Recorre
1.408 tandas reales —armadas por el mismo selector que ve la gente—, 96
mesas y 96 corridas del Chef Kid, con respuestas al azar en los seis
formatos, y verifica más de 245.000 condiciones. Con las alergias, los subconjuntos
de restricciones posibles pasaron de 32 a 512: se recorren todos, con menos
vueltas cada uno, para que siga tardando dos segundos y alguien pueda
abrirlo en el celular. Entre lo que verifica:

- que un vegetariano nunca reciba carne **ni se la vean ofrecer**;
- que el Vasco nunca recomiende del menú de niños, y Tito nunca salga de él;
- que siempre haya entrada cuando hay con qué;
- que el vino maride con la proteína del plato, salvo que la persona haya
  pedido un color con todas las letras;
- que el punto de la carne sólo se pregunte sobre cortes de parrilla, y que
  avise cuando el corte sufre;
- que lo que va al medio de la mesa lo pueda comer todo el mundo y no se le
  sirva además a alguien como plato propio;
- que ninguna alternativa sea el mismo plato del principal con un agregado;
- que al que dijo que prefiere esquivar algo no se le sirva justo eso;
- que ninguna botella salga por empate a un precio absurdo contra el plato;
- que a unas verduras no les toque un tinto áspero;
- que ninguna consecuencia mostrada contradiga el veredicto: si el chef
  dice "te puse queso adelante", la entrada tiene que ser de queso;
- que nadie reciba como plato propio algo que ya está al medio de su mesa;
- que de las respuestas citadas, al menos una diga qué hizo el chef con ella;
- que la cuenta cierre con lo que se muestra en pantalla;
- que dos corridas seguidas no repitan ni una sola pregunta rotativa.

Para correrlo fuera del navegador —el motor no toca el DOM, así que se
puede— alcanza con simular `localStorage` y `document`. También hay una
prueba de humo con Chromium en `docs/humo.js`, que recorre las pantallas y
falla ante cualquier excepción o error de consola:

```
npm install puppeteer-core
node docs/humo.js                       # sobre file://, como el doble clic
node docs/humo.js http://localhost:8000/index.html
```

Conviene correr las dos formas, porque no prueban lo mismo: con `file://` la
foto mancha el canvas de la tarjeta y la imagen compartida sale sin ella, que
es exactamente lo que pasa cuando la demo se abre con doble clic. Además del
autotest del motor verifica que la foto que está aparezca, que la que no está
no deje hueco, que el visor tome el foco y que el Escape cierre la foto sin
llevarse la carta puesta.

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

El Chef es la misma carta de noche: el mismo azul, invertido. El mundo de
Tito es el mismo azul con un acento propio, turquesa, y todo un punto más
grande.

El único color que no está en la carta impresa es el arena del acento, que
existe porque un monocromo no puede dar jerarquía a un botón.

## Pendiente

Dos cosas están cargadas con **datos inventados**, marcadas como tales en
el código y en el documento que se le manda al local. No son trabajo
pendiente nuestro: es material que sólo tiene el local. Los vinos ya
llegaron y están cargados de verdad.

- **Menú de niños.** Once platos inventados con precios inventados.
- **Fotos.** Hay **una sola y es de muestra**: `img/platos/ojo-bife.jpg`,
  de banco de imágenes, puesta para que se vea el mecanismo andando de
  punta a punta. No es una foto del local y no debería sobrevivir a la
  primera tanda de fotos reales. Las otras 136 salen de una sesión nuestra
  en el local —quedaron de nuestro lado, no del de ellos— y
  `img/platos/LEEME.txt` es el instructivo para cargarlas.

Falta además cargar la sección de **milanesas / burgers**, que nunca vino en
las imágenes de la carta.

El desempate por margen está implementado y **vacío a propósito**: cuando el
local diga qué platos quiere empujar, se cargan en el campo `margen` de cada
plato. Es una decisión comercial de ellos, no nuestra.

## Cuando llegue el menú oficial

Estos cambios quedan para cuando tengamos el menú oficial, y no antes. El
menú va a ser el mismo toda la temporada: no vamos a tocar el sitio
mientras se usa. Así que el motor no necesita adivinar una carta que
cambia: se puede ajustar a mano contra la carta que va a estar, plato por
plato, y hacerlo una sola vez. Afinar esto contra la carta de muestra es
trabajo que se tira.

**1. Cada pregunta, cuando hace falta.** El chef pregunta algo sólo cuando
la respuesta va a cambiar lo que recomienda.

- *El punto de la carne:* ya funciona así. Se pregunta después de
  recomendar y sólo si el principal es un corte de parrilla. Con el menú
  oficial hay que revisar qué platos cuentan como corte (hoy decide la
  `categoria`/`proteina`) y en qué punto sufre cada uno.
- *El vino:* hoy **no** funciona así. `bebida-pref` («Para tomar, ¿con
  qué te sentís cómodo?») entra en la tanda, en express y en completo,
  antes de que el chef sepa qué plato va a recomendar. Hay que sacarla de
  la tanda y preguntar por el vino igual que por el punto: después de
  elegir el plato y sólo si el plato pide vino (lo que hoy decide
  `meritaVino`). Si el plato no lo pide, va la bebida de siempre sin
  preguntar. Hay que tener en cuenta que esa pregunta también suma a
  `intensidad`, `untuosidad` y `acidez`. Al sacarla, esos pesos se pierden
  o pasan a otra pregunta, y el centrado por datos se recalcula solo.

**2. Entradas inteligentes.** Hoy la entrada se elige contra el plato: se
mira la `proteina` y la `untuosidad` del principal y el campo `empieza`.
Con el menú oficial la idea es analizar la carta real y definir a mano qué
entrada va con qué principal, en lugar de dejarlo a la regla general. Eso
también incluye decidir qué cuenta como entrada, qué se comparte y qué
pasa en la mesa. Lo vamos a definir cuando tengamos la carta.

Un caso real que muestra por qué la regla general no alcanza: el chef
recomendó *Caliente de jamón y queso* con *Queso provolone* de entrada y
copa de tinto de la casa.

- Es queso antes de queso. El caliente está cargado con `proteina:"cerdo"`
  por el jamón, así que recibe la regla del cerdo («queso adelante, que
  acompaña en vez de duplicar»). El motor no ve que el plato ya trae queso,
  y la entrada termina duplicando.
- Un sándwich no pide entrada. El provolone cuesta casi lo mismo que el
  caliente y es para compartir. Hoy el motor pone entrada siempre que haya
  con qué, y el autotest lo exige. Con la carta oficial hay que decidir qué
  platos llevan entrada y cuáles no, en vez de ponerla siempre.
- La copa de tinto pasa, pero con un caliente va más natural una cerveza o
  algo más liviano. Si salió porque la persona contestó «vino tinto» al
  principio, es el mismo problema del punto 1.
- El caliente tiene `untuosidad:10`, igual que el provolone con jamón
  crudo. Hay que revisar los ejes de todos los platos contra la carta
  oficial, empezando por los sándwiches.

**3. Horno de barro o parrilla, sin preguntarlo.** El chef tiene que
averiguar para qué lado va la persona (horno de barro, parrilla o lo que
traiga la carta oficial) sin preguntarlo de frente, y recomendar en base a
eso. Hoy hay señales sueltas que empujan para un lado o el otro, pero
ninguna está pensada para esto: el olor a brasa o a pan recién hecho, frito
o a la parrilla, el ruido de la carne cayendo. Hay que diseñar preguntas
sensoriales que midan esa preferencia sin que se note, que sumen afinidad
a la categoría con el mismo mecanismo que `afin`, y que se puedan citar en
«Lo que me dijiste» («por eso te llevo al horno y no a la parrilla»).
Depende de cuántas cocinas y qué platos tenga el menú oficial, así que
también se diseña con la carta en la mano.

Cada punto suma su verificación al autotest, como el punto de la carne:
que no se pregunte por el vino sin recomendar vino, que la entrada sea la
definida para ese principal, y que la preferencia horno/parrilla se note en
el resultado.

## docs — lo que se le manda al cliente

`docs/cambios-reunion-bo-fomento.pdf` es el documento que se entrega
**después de la reunión de cambios**: qué se pidió, cómo quedó cada cosa,
qué es provisorio y qué necesitamos de ellos para sacarlo de provisorio.

`docs/siguientes-pasos-bo-fomento.pdf` es el anterior, el de después de la
demo: qué necesitamos para pasar de la demo al sitio andando, el cronograma
y lo acordado.

Los dos se escriben en HTML —un solo archivo, con las fuentes incrustadas,
así se imprimen igual sin internet— y se convierten con:

```
npm install puppeteer-core
node docs/imprimir.js                          # todos
node docs/imprimir.js cambios-reunion-bo-fomento   # uno solo
```

`docs/planilla-clasificacion-bo-fomento.xlsx` es la planilla que se adjunta:
los 137 platos ya cargados, con nuestra lectura preliminar de la carta
impresa, para que el local corrija vegetariano, vegano, sin gluten, para
compartir, alérgenos y precios. Se regenera desde el `MENU` de `index.html`
con:

```
pip install openpyxl
python3 docs/planilla.py
```

Lo que el local devuelva en la planilla vuelve al array `MENU`. Los seis
ejes de cada plato los cargamos nosotros y no van en la planilla.
