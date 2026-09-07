# Handoff: App de evaluación técnica de natación — UMCE

App móvil para evaluar en terreno la técnica de natación de estudiantes de la carrera de **Pedagogía en Educación Física de la Universidad Metropolitana de Ciencias de la Educación (UMCE), generación 2026**, asignatura **Natación Básica UMCE**.

El evaluador (docente) observa a **un nadador a la vez** ejecutando una prueba de **50 m** en **piscina de 25 m** (dos largos), y registra **10 observaciones** puntuadas 1–3. La app funciona **offline** y sincroniza a **Google Sheets** cuando hay conexión.

---

## Overview

- **Usuario:** un docente al borde de la piscina, celular en una mano, sol directo, dedos mojados.
- **Restricción central:** ~3 minutos por estudiante. Toda la evaluación cabe en una pantalla, con blancos de 52 px mínimo.
- **Autenticación:** acceso directo, sin login de usuario. OAuth2 solo para la cuenta de Google que recibe la planilla.
- **Offline primero:** cada toque persiste local de inmediato; la nube es un estado visible, no un requisito.

---

## About the Design Files

Los archivos de este paquete son **referencias de diseño creadas en HTML** — prototipos que muestran la apariencia y el comportamiento buscados, **no código de producción para copiar directamente**.

La tarea es **recrear estos diseños en el entorno del codebase de destino** (el pedido original es **React Native**, iOS + Android) usando sus patrones y librerías establecidas. Si no existe codebase todavía, se recomienda partir con **Expo (React Native) + TypeScript**, `expo-sqlite` para persistencia, `@react-native-google-signin/google-signin` para OAuth2 y `@react-native-community/netinfo` para detección de conectividad.

El prototipo es una sola página HTML con un runtime propio (`support.js`) y un marco de iPhone (`ios-frame.jsx`) que **no** deben portarse: son andamiaje de previsualización. Lo que se porta es la estructura de pantallas, la jerarquía visual, los valores exactos de color/tipografía/espaciado, el modelo de datos y la lógica de cálculo de notas.

## Fidelity

**Alta fidelidad (hifi).** Colores, tipografía, espaciado, radios y estados están definidos con valores finales y deben reproducirse fielmente. La navegación entre pantallas, la selección de puntajes, el despliegue de la rúbrica, el modo "prueba incompleta" y el cálculo de notas están implementados y son funcionales en el prototipo.

Lo que el prototipo **simula** y debe implementarse de verdad: persistencia local, cola de sincronización, OAuth2, exportación a Sheets, validación real de formularios, cronómetro (no incluido).

---

## Modelo de dominio

### Sistema de puntuación

| Nivel | Puntos |
|---|---|
| Logrado | 3 |
| Medianamente logrado | 2 |
| No logrado | 1 |

### Estilos

`Crol`, `Espalda`, `Pecho`, `Mariposa`.

### Criterios (8 oficiales)

1. Salida
2. Sub acuático
3. Break out
4. Respiración
5. Brazadas
6. Patadas
7. Viraje
8. Llegada

### Las 10 observaciones de una prueba de 50 m en piscina de 25 m

Como la piscina es de 25 m, la prueba de 50 m tiene **dos largos** y por lo tanto **dos salidas bajo el agua**: una tras la partida y otra tras el viraje. Sub acuático y break out se observan **dos veces**. El orden de la lista en pantalla es el orden real de la prueba.

| # | key | Criterio | Etiqueta | Fase (group) | Distancia (dist) | Ubicación (where) |
|---|---|---|---|---|---|---|
| 1 | `salida` | Salida | — | Partida · largo 1 | 0 – 15 m | Poyete y entrada al agua |
| 2 | `sub1` | Sub acuático | Ida | Partida · largo 1 | 0 – 15 m | Bajo el agua tras la partida |
| 3 | `bo1` | Break out | Ida | Partida · largo 1 | 0 – 15 m | Al emerger, antes de los 15 m |
| 4 | `resp` | Respiración | — | Nado · largo 1 | 15 – 25 m | Nado continuo hacia la pared |
| 5 | `braz` | Brazadas | — | Nado · largo 1 | 15 – 25 m | Nado continuo hacia la pared |
| 6 | `pat` | Patadas | — | Nado · largo 1 | 15 – 25 m | Nado continuo hacia la pared |
| 7 | `vir` | Viraje | — | Viraje | 25 m | Pared de los 25 m |
| 8 | `sub2` | Sub acuático | Vuelta | Largo 2 | 25 – 40 m | Bajo el agua tras el viraje |
| 9 | `bo2` | Break out | Vuelta | Largo 2 | 25 – 40 m | Al emerger después del viraje |
| 10 | `lleg` | Llegada | — | Llegada | 50 m | Última brazada y toque final |

Los encabezados de fase se muestran cuando `group` cambia respecto de la fila anterior.

### Rúbrica completa (descripciones por nivel)

Referencia de terreno; el texto es genérico de crol. En **pecho y mariposa** el viraje y la llegada exigen **toque simultáneo con ambas manos**.

**1. Salida** — *Reacción, impulso y entrada*
- **1 · No logrado:** No reacciona a la señal; entra de pie o desequilibrado, casi sin impulso.
- **2 · Medianamente:** Reacciona con demora; impulso débil y entrada plana que frena el avance.
- **3 · Logrado:** Reacción inmediata, extensión completa de piernas y entrada hidrodinámica en flecha.

**2. Sub acuático** — *Flecha y ondulación bajo el agua*
- **1:** Emerge de inmediato; no logra posición de flecha ni aprovecha el impulso.
- **2:** Mantiene la flecha un instante y pierde alineación de cabeza o brazos.
- **3:** Flecha alineada y sostenida, con patada ondulatoria continua desde la cadera.

**3. Break out** — *Transición del agua a la superficie*
- **1:** Sale a la superficie sin brazada, deteniendo por completo el avance.
- **2:** Coordina la salida pero pierde velocidad al emerger; brazada tardía.
- **3:** Transición fluida: la primera brazada empieza justo antes de emerger, sin frenar.

**4. Respiración** — *Momento, lado y efecto en el cuerpo*
- **1:** Levanta la cabeza al frente y detiene el avance; respira sin ritmo.
- **2:** Respira al lado, con ritmo irregular y leve pérdida de alineación.
- **3:** Respiración lateral rítmica y bilateral, sin alterar la posición del cuerpo.

**5. Brazadas** — *Agarre, tracción y recobro*
- **1:** Los brazos cruzan la línea media; recorrido incompleto y codo caído.
- **2:** Recorrido completo, con agarre inconsistente y recobro tenso.
- **3:** Agarre firme con codo alto, tracción completa hasta la cadera y recobro relajado.

**6. Patadas** — *Origen, amplitud y continuidad*
- **1:** Patea desde la rodilla, con tobillo rígido y sin propulsión.
- **2:** Patea desde la cadera pero con amplitud irregular y pausas.
- **3:** Patada continua desde la cadera, tobillo suelto y amplitud constante.

**7. Viraje** — *Aproximación, giro y empuje*
- **1:** Toca y se detiene; se incorpora y parte sin empuje de pared.
- **2:** Ejecuta el viraje completo con pérdida evidente de velocidad.
- **3:** Viraje compacto, pies bien apoyados, empuje potente y salida en flecha.

**8. Llegada** — *Última brazada y toque final*
- **1:** Desacelera varios metros antes y toca sin control.
- **2:** Llega sin ajustar la última brazada; toque impreciso.
- **3:** Mantiene la velocidad, ajusta la última brazada y toca según la norma del estilo.

---

## Cálculo de puntaje y nota (crítico — replicar exactamente)

### Escala de puntaje (configurable)

Dos modos, expuestos como configuración:

- **`10 observaciones (máx. 30)` — por defecto.** El puntaje del estilo es la **suma de las 10 observaciones** (1–3 cada una). Rango 10–30. Ambas ejecuciones de sub acuático y break out suman.
- **`8 criterios (máx. 24)`.** Se **consolidan** las 10 observaciones en los 8 criterios oficiales: sub acuático = `floor(mean(sub1, sub2))`, break out = `floor(mean(bo1, bo2))`, el resto toma su valor directo. El puntaje es la suma de los 8. Rango 8–24.

### Conversión a nota chilena 1,0–7,0

Escala lineal en dos tramos con **nota de aprobación 4,0** en el porcentaje de exigencia (configurable 50–70%, **60% por defecto**):

```
aprob = max * (exigencia / 100)
nota  = pts < aprob
      ? 1 + 3 * (pts / aprob)
      : 4 + 3 * ((pts - aprob) / (max - aprob))
```

Se presenta con **un decimal y coma decimal** (`5,3`). `max` es 30 o 24 según la escala, o el máximo observado si la prueba es incompleta (ver abajo).

### Prueba incompleta

Si el estudiante no termina los 50 m, el evaluador marca la prueba como incompleta:
- Las observaciones no registradas quedan **N/O** (no observado) y **no cuentan como 0**.
- `max` pasa a ser `nObservadas * 3` en vez de 30/24 — la nota se calcula sobre el puntaje máximo observado.
- La fila se marca como **incompleta** al sincronizar, para no confundirla con una prueba completa.

### Nota general del estudiante

Promedio de las **notas** (1,0–7,0) de los estilos ya evaluados, **nunca de los puntajes brutos** — cada estilo puede tener un `max` distinto si hubo pruebas incompletas. Los estilos pendientes no entran en el promedio. Un estudiante sin evaluaciones muestra `—`.

### Promedio de la sección

Promedio de las notas generales de los estudiantes que tienen al menos una evaluación.

---

## Screens / Views

Nueve pantallas. Cuatro son alcanzables desde la barra inferior (Inicio, Estudiantes, Reporte, Rúbrica); el resto son de flujo.

### Chrome común

**Header** — `background #16305B`, `color #fff`, padding `58px 20px 12px` (los 58px son safe area + status bar; usar safe-area-inset real).
- Eyebrow: `Barlow Condensed 700 10px`, `letter-spacing .18em`, mayúsculas, `#8FBBDD` — texto fijo `UMCE · Pedagogía en Ed. Física`.
- Título: `Barlow 600 19px`, cambia por pantalla (ver tabla).
- Chip de sync a la derecha: `background rgba(255,255,255,.12)`, `border-radius 100px`, padding `5px 10px 5px 8px`; punto de 8px `#E0A93C`; label `Barlow 600 11.5px` `#DCE8F4`. Estados: `Sin conexión`, `Sincronizando`, `Al día`.

**Títulos por pantalla:** Inicio `Sesión de hoy` · Estudiantes `{sección} · Gen. 2026` · Nuevo `Nuevo estudiante` · Estilo `Estilo a evaluar` · Evaluación `Evaluación en terreno` · Resumen `Resumen del estilo` · Rúbrica `Rúbrica de natación` · Reporte `Reporte de notas` · Sesión `Editar sesión`.

**Tab bar** — `background #FFFCF4`, `border-top 1px solid rgba(22,48,91,.12)`, padding `9px 8px 30px` (los 30px son home indicator; usar safe area). Cuatro tabs en flex, cada uno columna centrada, gap 3px: glifo `Barlow 700 17px` + label `Barlow 600 10.5px`. Color del tab activo `#16305B`, inactivo `#8A8270`. Glifos usados en el prototipo: `◉` Inicio, `☷` Estudiantes, `▤` Reporte, `☰` Rúbrica — **reemplazar por iconos reales** del set del codebase.

---

### 1. Inicio (`home`)

**Propósito:** ver el estado de la sesión, continuar donde quedó, y saber qué falta por subir.

Padding `18px 20px 26px`, columna con `gap 14px`.

**Tarjeta de sesión** — `background #16305B`, `radius 14px`, padding `18px 20px`, texto blanco.
- Fila superior: bloque izquierdo + contador derecho (space-between, align-items flex-start).
- Eyebrow `Sesión activa` (`Barlow Condensed 700 10px`, `.16em`, mayúsculas, `#8FBBDD`) con un botón **Editar** al lado: borde `1px solid rgba(255,255,255,.35)`, transparente, `radius 100px`, padding `3px 10px`, `Barlow 600 10.5px`, `#DCE8F4` → navega a `sesion`.
- Asignatura: `Barlow 600 21px` (dato editable, por defecto `Natación Básica UMCE`).
- Línea 1: `{sección} · {lugar}` — `Barlow 400 13px`, `#B9CDE2`.
- Línea 2: `{día y hora} · {estilos}` — igual estilo.
- Contador derecho: `Barlow Condensed 700 30px` con denominador a 17px `#8FBBDD` → `{evaluados}/{total}`, y label `Evaluados`. **Ambos derivados de la nómina, no literales.**
- Barra de progreso: alto 6px, track `rgba(255,255,255,.18)`, fill `#4A96C4`, ancho `evaluados/total`.
- Pie: `Ritmo: 2 min 40 s por estudiante` a la izquierda, `{pendientes} estudiantes · {pendientes*3} min restantes` a la derecha — `Barlow 500 11.5px` `#B9CDE2`.

**Botón primario** — `background #2E7FB8`, `radius 14px`, padding `17px 20px`, texto a la izquierda + chevron `›` a la derecha. Título `Barlow 600 17px` `#fff` (`Continuar evaluación`), subtítulo `Barlow 400 12.5px` `#D6E8F5` con el siguiente estudiante y estilo.

**Dos accesos secundarios** (fila, gap 12px, cada uno flex:1) — `background #FFFCF4`, `border 1px solid rgba(22,48,91,.18)`, `radius 14px`, padding `15px 14px`: glifo `#2E7FB8` `Barlow Condensed 700 20px` + label `Barlow 600 14px` `#16305B`. Son **Nuevo estudiante** (`+`) y **Rúbrica** (`☰`).

**Tarjeta de pendientes de subir** — `background #FBF7EC`, `border 1px solid rgba(224,169,60,.5)`, `radius 14px`, padding `15px 17px`. Título `Pendientes de subir` (`Barlow 600 14px` `#16305B`) + contador `Barlow 700 15px` `#B4553F`; texto explicativo `Barlow 400 12.5px` `#5C5340` nombrando la planilla destino.

**Últimas evaluaciones** — eyebrow `Barlow Condensed 700 10px` `.16em` `#8A8270`, luego filas: `background #FFFCF4`, `border 1px solid rgba(22,48,91,.1)`, `radius 12px`, padding `12px 14px`, gap 12px. Avatar 36×36 `radius 9px` `#E4EDF5` con iniciales `Barlow 700 13px` `#1F4C86`; nombre `Barlow 600 14.5px` `#16305B`; detalle `estilo · N pts · subido|en cola` `Barlow 400 12px` `#8A8270`; nota `Barlow Condensed 700 19px` `#1B6E7C`.

---

### 2. Editar sesión (`sesion`)

**Propósito:** corregir los datos que encabezan cada evaluación y viajan con la fila a Sheets.

Padding `18px 20px 26px`, gap 15px. Nota introductoria `Barlow 400 13.5px` `#5C5340`.

Campos, cada uno con label `Barlow Condensed 600 11px` `.14em` mayúsculas `#8A8270` (margen inferior 7px):
- **Asignatura** — input de texto, `Barlow 600 16px`.
- **Sección** — tres botones en fila (flex:1 cada uno), `Sección 1 / 2 / 3`: seleccionado `background #16305B` `color #fff`, resto `#FFFCF4` `color #28374F`, borde `1px solid rgba(22,48,91,.16)`, `radius 10px`, padding `12px 6px`, `Barlow 600 14px`.
- **Lugar** — input (`Piscina UMCE`).
- **Día y hora** — input (`Miércoles 09:00 — 10:00`).
- **Estilos de la sesión** — input (`Crol y Espalda`).

Estilo de input: `width 100%`, `background #FFFCF4`, `border 1px solid rgba(22,48,91,.2)`, `radius 12px`, padding 14px, `Barlow 500 16px`, `color #16305B`.

Botón **Listo**: `#2E7FB8`, `radius 13px`, padding 16px, `Barlow 600 16px`, `#fff` → vuelve a `home`. Los cambios se reflejan en la tarjeta de inicio, el título de la lista y el chip de sección.

---

### 3. Estudiantes (`students`)

**Propósito:** encontrar y elegir al estudiante que entra al agua.

Padding `16px 20px 26px`, gap 10px.

- **Buscador** (visual, no funcional en el prototipo): `#FFFCF4`, borde `1px solid rgba(22,48,91,.14)`, `radius 12px`, padding `12px 14px`, glifo `⌕` + placeholder `Buscar por nombre o sección` `Barlow 400 14.5px` `#8A8270`.
- **Filtros** en fila con scroll horizontal, gap 8px: chip activo `#16305B`/`#fff`, inactivos `#FFFCF4` con borde `rgba(22,48,91,.16)` y texto `#28374F`; `radius 100px`, padding `7px 14px`, `Barlow 600 12.5px`. Chips: `{sección} · {total}`, `Pendientes`, `Sin subir`.
- **Filas de estudiante** — `#FFFCF4`, borde `1px solid rgba(22,48,91,.1)`, `radius 13px`, padding `13px 14px`, gap 12px. Avatar 40×40 `radius 10px` `#E4EDF5`, iniciales `Barlow 700 14px` `#1F4C86`. Nombre `Barlow 600 15.5px` `#16305B` en formato `Apellidos, Nombre`. Detalle `Barlow 400 12px` `#8A8270`: estilos evaluados + `N de 4`, o `Sin evaluaciones`. A la derecha nota general `Barlow Condensed 700 21px` `#16305B` y label `General` / `Pendiente` (`Barlow Condensed 600 9.5px` `.1em` mayúsculas `#8A8270`). Toca → pantalla de estilo.
- **Agregar** al final: botón de borde discontinuo `1px dashed rgba(22,48,91,.32)`, transparente, `radius 13px`, padding 15px, `Barlow 600 14.5px` `#1F4C86`, texto `+ Agregar estudiante a la sección`.

---

### 4. Nuevo estudiante (`new`)

**Propósito:** dar de alta a un estudiante con validación.

Padding `18px 20px 26px`, gap 16px. Nota: *Los datos quedan en el dispositivo al guardar. El nombre y la sección son obligatorios.*

Campos (mismo estilo de input y label que Editar sesión):
- **Nombre** — obligatorio.
- **Apellidos** — obligatorio. El prototipo muestra el **estado de error**: borde `1.5px solid #B4553F`, placeholder `Apellido paterno y materno` en `#B0A896`, y mensaje bajo el campo `Barlow 500 12.5px` `#B4553F`: *Falta el apellido — se usa para ordenar la lista y evitar duplicados.*
- **Sección** — mismos tres botones que en Editar sesión.
- **RUT (opcional)** — placeholder `12.345.678-5`, ayuda `Barlow 400 12px` `#8A8270`: *Se valida el dígito verificador antes de guardar.*

Botón **Guardar estudiante** (`#2E7FB8`, `radius 13px`, padding 16px, `Barlow 600 16px`).

**Validaciones a implementar:** nombre y apellidos no vacíos y con largo mínimo 2; sección obligatoria; RUT opcional pero, si viene, validar módulo 11 y normalizar a `12345678-5`; detectar duplicado por (apellidos + nombre + sección) y por RUT; recortar espacios; no permitir guardar dos veces con doble toque.

---

### 5. Estilo a evaluar (`style`)

**Propósito:** ver el avance del estudiante y elegir el estilo de la prueba.

Padding `18px 20px 26px`, gap 12px.

- **Ficha del estudiante** — `#FFFCF4`, borde `1px solid rgba(22,48,91,.12)`, `radius 13px`, padding 14px, gap 13px: avatar 44×44 `radius 11px` `#E4EDF5` con iniciales `Barlow 700 15px` `#1F4C86`; nombre `Barlow 600 17px` `#16305B`; detalle `{sección} · N de 4 estilos evaluados` `Barlow 400 12.5px` `#8A8270`; a la derecha nota general `Barlow Condensed 700 24px` `#1B6E7C` + label `General`.
- Eyebrow `Elige el estilo a evaluar`.
- **Cuatro tarjetas de estilo** (Crol, Espalda, Pecho, Mariposa) — `#FFFCF4`, borde `1px solid rgba(22,48,91,.12)`, `radius 13px`, padding 16px, gap 14px. Barra vertical de 5×42 px `radius 100px` `#2E7FB8` a la izquierda; nombre `Barlow 600 19px` `#16305B`; estado `Barlow 400 12.5px` `#8A8270` (`50 m evaluados el {fecha} · N pts` / `En curso · N de 10 observaciones` / `Pendiente`); a la derecha nota `Barlow Condensed 700 23px` `#16305B` y puntaje `N/max`.

---

### 6. Evaluación en terreno (`eval`) — pantalla clave

**Propósito:** registrar las 10 observaciones mientras el estudiante nada, sin quitar la vista del agua más de un instante.

Padding `14px 16px 20px`.

**Barra de contexto** — `#FFFCF4`, borde `1px solid rgba(22,48,91,.12)`, `radius 12px`, padding `11px 14px`, margen inferior 12px. Izquierda: `{Estudiante} · 50 m {Estilo}` (`Barlow 600 15.5px` `#16305B`) y `N de 10 observaciones · nota parcial X,X` (`Barlow 400 11.5px` `#8A8270`). Derecha: puntaje `Barlow Condensed 700 22px` `#16305B` con `/max` a 13px `#8A8270`, label `Puntaje`.

**Control de prueba incompleta:**
- Estado normal → botón de borde discontinuo `1px dashed rgba(180,85,63,.45)`, transparente, `radius 11px`, padding 10px, `Barlow 600 12.5px` `#B4553F`: `Marcar prueba incompleta (no terminó los 50 m)`.
- Estado activo → tarjeta `background #F8E9E2`, borde `1px solid rgba(180,85,63,.45)`, `radius 12px`, padding `12px 14px`: título `Prueba incompleta` (`Barlow 600 13.5px` `#8A3A26`), link `Deshacer` subrayado `Barlow 600 12px` `#8A3A26`, y explicación `Barlow 400 12px` `#6B3223` con el conteo de observaciones registradas.

**Encabezado de columnas** — fila con label izquierdo `Criterio · toca para ver la rúbrica` (`Barlow Condensed 600 9.5px` `.08em` mayúsculas `#8A8270`) y tres columnas de 52px centradas: `No log.` `#B4553F`, `Median.` `#9A7A28`, `Logrado` `#1B6E7C`.

**Filas de observación** (10, con encabezados de fase intercalados), gap 7px:
- **Encabezado de fase** (cuando cambia `group`): nombre de fase `Barlow Condensed 700 10px` `.14em` mayúsculas `#2E7FB8`, línea divisoria flexible `1px` `rgba(22,48,91,.14)`, y distancia a la derecha `Barlow Condensed 600 10px` `#8A8270`.
- **Fila** — `#FFFCF4`, borde `1px solid rgba(22,48,91,.1)`, `radius 12px`, overflow hidden. Contenido en flex, gap 7px, padding `6px 8px 6px 12px`:
  - **Zona táctil de rúbrica** (flex:1): nombre del criterio `Barlow 600 14.5px` `#16305B`; si la observación es duplicada, badge `Ida`/`Vuelta` a su lado (`Barlow Condensed 700 9px` `.1em` mayúsculas, `color #1F4C86`, `background #E0EAF3`, `radius 5px`, padding `3px 6px`); debajo la ubicación `Barlow 400 11px` `#8A8270`. Toca → despliega/colapsa la rúbrica de ese criterio.
  - **Tres botones de puntaje** de **52×52 px**, `radius 11px`, cifra `Barlow Condensed 700 21px`:
    | Puntaje | No seleccionado | Seleccionado |
    |---|---|---|
    | 1 | bg `#FBF1EC`, borde `rgba(180,85,63,.35)`, cifra `#B4553F` | bg `#B4553F`, cifra `#FFF4EE` |
    | 2 | bg `#FBF6EA`, borde `rgba(154,122,40,.35)`, cifra `#9A7A28` | bg `#9A7A28`, cifra `#FFF9EC` |
    | 3 | bg `#EDF5F6`, borde `rgba(27,110,124,.35)`, cifra `#1B6E7C` | bg `#1B6E7C`, cifra `#EFF9FA` |
- **Rúbrica desplegada** (dentro de la misma fila, bajo un `border-top 1px rgba(22,48,91,.08)`): `background #F4F0E2`, padding `11px 12px`, gap 8px. Tres líneas, cada una con cuadro de 20×20 `radius 6px` (colores `#B4553F` / `#9A7A28` / `#1B6E7C`, cifra blanca `Barlow Condensed 700 12px`) + descripción `Barlow 400 12.5px` `#4A4534`.

**CTA inferior** — `#16305B`, `radius 13px`, padding 16px, `Barlow 600 16px` `#fff`. Copy dinámico: `Faltan N observaciones` mientras no esté completa · `Cerrar evaluación · nota X,X` cuando están las 10 · `Cerrar prueba incompleta · nota X,X` en modo incompleto. Debajo, nota `Guardado local automático en cada toque.` (`Barlow 400 12px` `#8A8270`, centrada).

---

### 7. Resumen del estilo (`summary`)

**Propósito:** confirmar la nota antes de pasar al siguiente estudiante.

Padding `18px 20px 26px`, gap 13px.

- **Tarjeta de nota** — `#16305B`, `radius 15px`, padding 20px, texto blanco. Eyebrow `{Estilo} · nota del estilo`; nota `Barlow Condensed 700 52px`; línea de contexto `{N} de {max} puntos · {escala} · exigencia {N}%` (`Barlow 400 12.5px` `#B9CDE2`). Separada por `border-top 1px rgba(255,255,255,.18)` (margen 16px, padding 14px): fila con `Nota general del estudiante` (`Barlow 600 12.5px` `#8FBBDD`) y el valor `Barlow Condensed 700 29px`; debajo el detalle del promedio (`Promedio de Crol y Espalda`, con `· {Estilo} incompleta` si aplica).
- **Detalle por criterio** — `#FFFCF4`, borde `1px solid rgba(22,48,91,.1)`, `radius 13px`, padding `6px 14px`. Ocho filas (los **criterios oficiales**, no las 10 observaciones), separadas por `border-bottom 1px rgba(22,48,91,.07)`, padding vertical 9px: nombre `Barlow 500 14px` `#28374F`; si el criterio es duplicado, subtexto `ida / vuelta 2 / 3` (`Barlow 400 10.5px` `#8A8270`); barra de 66×8 `radius 100px`, track `#EAE4D2`, fill `#2E7FB8` a `valor/3`; valor `Barlow Condensed 700 15px` `#16305B` o `N/O`. Pie explicativo sobre la doble observación.
- **Aviso de cola** — `#FBF7EC`, borde `1px solid rgba(224,169,60,.5)`, `radius 13px`, padding `14px 16px`: título `En cola para Google Sheets` y descripción de la fila que se sube.
- **Acciones** — primaria `Guardar y evaluar al siguiente` (`#2E7FB8`); secundaria `Volver a corregir` (transparente, borde `1px solid rgba(22,48,91,.2)`, texto `#1F4C86`, padding 14px, `Barlow 600 15px`).

---

### 8. Reporte de notas (`reporte`)

**Propósito:** ver todas las notas de la sección de una vez y exportarlas.

Padding `16px 16px 26px`, gap 13px.

- **Tarjeta de promedio** — `#16305B`, `radius 14px`, padding `17px 18px`. Eyebrow `Promedio de la sección`; valor `Barlow Condensed 700 42px`; al lado, dos líneas `Barlow 400 12.5px` `#B9CDE2`: `{N} de {total} estudiantes con nota` y `{N} pruebas de 50 m registradas`. Bajo un `border-top 1px rgba(255,255,255,.18)`, dos métricas en fila: **Bajo 4,0** (valor `Barlow Condensed 700 17px` `#F0C9B9`) y **Sin evaluar** (valor blanco); labels `Barlow Condensed 600 9.5px` `.1em` mayúsculas `#8FBBDD`.
- **Encabezado de la matriz** — label `Estudiante` a la izquierda (`Barlow Condensed 700 9.5px` `.1em` mayúsculas `#8A8270`), cuatro columnas de 38px con la inicial del estilo (`C`, `E`, `P`, `M`) en `Barlow Condensed 700 11px` `#2E7FB8`, y columna de 42px `Gen.` en `#16305B`.
- **Filas** (una por estudiante) — `#FFFCF4`, borde `1px solid rgba(22,48,91,.1)`, `radius 11px`, padding `8px 6px 8px 11px`, gap 7px. Nombre truncado con elipsis `Barlow 600 13.5px` `#16305B`. Cuatro celdas de 38×30 `radius 7px`, cifra `Barlow Condensed 700 15px`:
  - nota ≥ 4,0 → bg `#F2EFE3`, texto `#28374F`
  - nota < 4,0 → bg `#FBF1EC`, texto `#B4553F`
  - sin evaluar → bg transparente, `·` en `#B5AE9B`
  - Nota general (42px, `Barlow Condensed 700 19px`): `#1B6E7C` si ≥ 4,0, `#B4553F` si < 4,0, `#B5AE9B` con `—` si no hay evaluaciones.
  - Toca la fila → ficha del estudiante.
- **Leyenda** `Barlow 400 11.5px` `#8A8270`: iniciales de estilo + escala + exigencia + explicación del punto.
- **Botón** `Exportar reporte a Google Sheets` (`#2E7FB8`, `radius 13px`, padding 16px, `Barlow 600 15.5px`) y nota al pie sobre la hoja generada.

---

### 9. Rúbrica de natación (`rubric`)

**Propósito:** consultar los descriptores completos sin estar evaluando.

Padding `16px 20px 26px`, gap 9px. Nota introductoria sobre los 50 m en piscina de 25 m, la doble observación, y el toque simultáneo en pecho y mariposa.

Ocho tarjetas (una por criterio oficial) — `#FFFCF4`, borde `1px solid rgba(22,48,91,.1)`, `radius 13px`, padding `14px 16px`: número `01`–`08` (`Barlow Condensed 700 13px` `#8FBBDD`) + nombre (`Barlow 600 16.5px` `#16305B`); luego las tres descripciones con el mismo patrón de cuadro de color + texto que en la rúbrica desplegable.

---

## Interactions & Behavior

- **Navegación:** una sola pila de pantallas por `screen`. Tab bar → `home` / `students` / `reporte` / `rubric`. Flujo de evaluación: `students` → `style` → `eval` → `summary` → `home`.
- **Selección de puntaje:** un toque asigna y **persiste de inmediato**. Con `autoAvance` activo (por defecto), asignar un puntaje colapsa la rúbrica abierta; en la variante secuencial avanza a la observación siguiente.
- **Rúbrica inline:** acordeón de una sola fila abierta a la vez; toca el nombre del criterio para abrir/cerrar.
- **Prueba incompleta:** alterna el modo; recalcula `max` y la nota en vivo; cambia el copy del CTA.
- **Feedback táctil:** en RN agregar `Pressable` con `android_ripple` y opacidad activa; los botones de puntaje son objetivos de 52 px y merecen `Haptics.selectionAsync()` — el evaluador no mira la pantalla al tocar.
- **Estados de carga:** la sincronización nunca bloquea la UI; el chip del header es el único indicador. `Sincronizando` puede animar el punto.
- **Errores:** los de validación son inline bajo el campo (patrón de Apellidos). Los de red **no** interrumpen: se reflejan en el chip y en la tarjeta de pendientes.
- **Responsive:** todo en columna única, fluido al ancho del dispositivo; nada de scroll horizontal. La matriz del reporte cabe en 375 px de ancho (nombre flexible + 4×38 + 42 + gaps) truncando el nombre. Respetar safe areas arriba y abajo.
- **Legibilidad exterior:** fondos opacos (nada translúcido sobre foto), contraste alto, sin degradados. Considerar forzar brillo alto y `keep awake` durante una sesión.

---

## State Management

**Estado de sesión (persistente, editable):** `asignatura`, `seccion`, `lugar`, `horario`, `estilos`.

**Estado de navegación:** `screen`, más el estudiante y el estilo activos.

**Estado de evaluación en curso:**
- `scores`: mapa `{ [key de observación]: 1|2|3 }` con las 10 keys posibles.
- `open`: key del criterio con la rúbrica desplegada, o `null`.
- `incompleta`: boolean.

**Configuración:** `escalaPuntaje` (`10 observaciones (máx. 30)` | `8 criterios (máx. 24)`), `exigencia` (50–70, paso 5), `autoAvance` (boolean), y el estado de conexión observado.

**Derivados (calcular, nunca almacenar):** puntaje del estilo, `max` efectivo, nota del estilo, nota general del estudiante, promedio de sección, conteos de evaluados/pendientes, ancho de la barra de progreso, colores de la matriz del reporte. En el prototipo **todos** los números salen de la misma función de nota — ninguna nota es un literal.

### Esquema local sugerido (SQLite)

```sql
CREATE TABLE estudiante (
  id TEXT PRIMARY KEY,            -- uuid local
  nombre TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  seccion TEXT NOT NULL,
  rut TEXT,                       -- normalizado 12345678-5, nullable
  creado_en TEXT NOT NULL
);

CREATE TABLE evaluacion (
  id TEXT PRIMARY KEY,            -- uuid local: idempotency key para Sheets
  estudiante_id TEXT NOT NULL REFERENCES estudiante(id),
  estilo TEXT NOT NULL,           -- Crol | Espalda | Pecho | Mariposa
  distancia_m INTEGER NOT NULL DEFAULT 50,
  piscina_m INTEGER NOT NULL DEFAULT 25,
  incompleta INTEGER NOT NULL DEFAULT 0,
  escala TEXT NOT NULL,           -- '30' | '24'
  exigencia INTEGER NOT NULL,     -- 60
  puntaje INTEGER NOT NULL,
  puntaje_max INTEGER NOT NULL,
  nota REAL NOT NULL,             -- 1.0 - 7.0, un decimal
  asignatura TEXT NOT NULL,
  seccion TEXT NOT NULL,
  lugar TEXT,
  evaluador TEXT,
  evaluado_en TEXT NOT NULL,      -- ISO 8601
  actualizado_en TEXT NOT NULL,
  UNIQUE (estudiante_id, estilo, evaluado_en)
);

CREATE TABLE observacion (
  evaluacion_id TEXT NOT NULL REFERENCES evaluacion(id) ON DELETE CASCADE,
  obs_key TEXT NOT NULL,          -- salida | sub1 | bo1 | resp | braz | pat | vir | sub2 | bo2 | lleg
  criterio TEXT NOT NULL,         -- nombre oficial
  etiqueta TEXT,                  -- Ida | Vuelta | NULL
  puntaje INTEGER,                -- 1..3, NULL = N/O
  PRIMARY KEY (evaluacion_id, obs_key)
);

CREATE TABLE cola_sync (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evaluacion_id TEXT NOT NULL,
  operacion TEXT NOT NULL,        -- upsert | delete
  intentos INTEGER NOT NULL DEFAULT 0,
  proximo_intento TEXT,           -- ISO, backoff
  ultimo_error TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente'  -- pendiente | enviando | ok | fallido
);
```

---

## Integración con Google Drive / Sheets

### Configuración OAuth2 (paso a paso)

1. Google Cloud Console → crear proyecto (ej. `natacion-umce`).
2. **APIs y servicios → Biblioteca**: habilitar **Google Sheets API** y **Google Drive API**.
3. **Pantalla de consentimiento OAuth**: tipo *Externo* (o *Interno* si la cuenta es de Google Workspace de la UMCE). Scopes mínimos: `https://www.googleapis.com/auth/drive.file` (solo archivos creados por la app) y `https://www.googleapis.com/auth/spreadsheets`. Agregar la cuenta docente como usuario de prueba mientras la app esté en modo testing.
4. **Credenciales → Crear ID de cliente OAuth**, tres veces:
   - **Android**: package name (ej. `cl.umce.natacion`) + huella SHA-1 (`keytool -list -v -keystore <keystore>`; para debug, `~/.android/debug.keystore`, clave `android`). Registrar SHA-1 de debug **y** de release.
   - **iOS**: bundle ID. Añadir el `REVERSED_CLIENT_ID` como URL scheme en `Info.plist`.
   - **Web**: se usa como `webClientId` en `GoogleSignin.configure` para obtener `idToken` en ambas plataformas.
5. En la app: `GoogleSignin.configure({ webClientId, iosClientId, scopes: [...], offlineAccess: true })`. Guardar el refresh token en **Keychain / Keystore** (`expo-secure-store`), nunca en AsyncStorage.
6. Renovar el access token cuando falte < 5 min para expirar; ante `401` renovar una vez y reintentar; ante `403 insufficientPermissions` volver a pedir consentimiento.
7. **Nunca** incrustar un client secret en la app móvil (flujo PKCE de cliente público).

### Estructura de la planilla

Un spreadsheet por asignatura y período: `Evaluaciones Natación {asignatura} {año}`. Guardar su `spreadsheetId` local tras crearlo; si no existe, crearlo y escribir los encabezados.

**Hoja `Evaluaciones`** — una fila por evaluación (estudiante × estilo):

| Columna | Campo |
|---|---|
| A | `id_local` (uuid — clave de idempotencia) |
| B | `fecha` (ISO 8601) |
| C | `asignatura` |
| D | `seccion` |
| E | `estudiante` (`Apellidos, Nombre`) |
| F | `rut` |
| G | `estilo` |
| H | `distancia_m` |
| I | `piscina_m` |
| J–S | puntaje de las 10 observaciones en orden (`salida`, `sub1`, `bo1`, `resp`, `braz`, `pat`, `vir`, `sub2`, `bo2`, `lleg`) — vacío = N/O |
| T | `puntaje` |
| U | `puntaje_max` |
| V | `nota` |
| W | `incompleta` (`sí`/`no`) |
| X | `exigencia` |
| Y | `evaluador` |
| Z | `lugar` |
| AA | `sincronizado_en` |

**Hoja `Reporte de notas`** — matriz derivada: `estudiante`, `Crol`, `Espalda`, `Pecho`, `Mariposa`, `nota_general`, `estilos_evaluados`. Se regenera completa en cada exportación (no incremental).

**Hoja `Rúbrica`** — los 24 descriptores (criterio × nivel), escrita una vez al crear la planilla, como referencia para quien lea la planilla.

**Upsert:** buscar `id_local` en la columna A; si existe, `spreadsheets.values.update` sobre esa fila; si no, `values.append`. Nunca duplicar. Enviar en lotes (`batchUpdate`) cuando haya varias evaluaciones en cola.

---

## Estrategia de errores y recuperación

**Principio:** escribir local primero, siempre. La UI nunca espera a la red.

1. **Escritura local transaccional.** Cada toque de puntaje hace un upsert en `observacion` dentro de una transacción; la evaluación se marca `dirty`. Si la app muere a mitad de una evaluación, al abrir se restaura el estado exacto.
2. **Encolar, no enviar.** Al cerrar una evaluación se inserta una fila en `cola_sync` con estado `pendiente`. El envío es un worker aparte.
3. **Disparadores del worker:** al recuperar conectividad (NetInfo), al volver la app al foreground, al cerrar una evaluación con red disponible, y por timer cada 5 min si hay pendientes.
4. **Reintentos con backoff exponencial y jitter:** 5 s, 15 s, 60 s, 5 min, 30 min, 2 h, tope 6 h. Máximo 12 intentos antes de pasar a `fallido` y avisar en la tarjeta de pendientes.
5. **Clasificación de errores:**
   - Sin red / timeout / `5xx` / `429` → reintentable (respetar `Retry-After` en 429).
   - `401` → renovar token y reintentar una vez.
   - `403 insufficientPermissions` / consentimiento revocado → **no** reintentable: pedir reautenticación al usuario.
   - `404` del spreadsheet (borrado o movido) → recrear la planilla y reencolar todo lo `dirty`.
   - `400` de datos → marcar `fallido` con el error a la vista; nunca reintentar en loop.
6. **Idempotencia:** el `id_local` es la clave. Un reintento tras un timeout ambiguo hace upsert sobre la misma fila, no una duplicada.
7. **Conflictos:** gana el registro con `actualizado_en` más reciente (la app es la fuente de verdad; nadie más edita esas filas). Si la fila remota cambió después de la última sincronización, escribir de todas formas y registrar el valor anterior en un log local.
8. **Validación de integridad antes de enviar:** puntajes ∈ {1,2,3} o nulos; sin nulos si `incompleta = 0`; `puntaje` == suma de observaciones según la escala; `puntaje_max` coherente; `nota` ∈ [1,0 – 7,0]; estudiante existente; estilo válido. Un registro que falla la validación no se envía y se marca `fallido` con el motivo.
9. **Logging:** log estructurado local con rotación (7 días) — evento, `evaluacion_id`, intento, código de error, latencia. Pantalla oculta de diagnóstico (toque largo en el chip de sync) que permite exportar el log. Nunca registrar tokens ni RUT completos.
10. **Respaldo de emergencia:** exportar toda la base local a CSV y compartirla, para no perder una sesión si Google falla.

---

## Design Tokens

### Colores

| Token | Hex | Uso |
|---|---|---|
| Azul marino (marca) | `#16305B` | Headers, tarjetas de dato, CTA de cierre, tab activo |
| Azul acción | `#2E7FB8` | Botones primarios, acentos, barras |
| Azul claro | `#4A96C4` | Fill de progreso |
| Azul texto | `#1F4C86` | Iniciales de avatar, links |
| Azul sobre marino | `#8FBBDD` | Eyebrows y labels sobre azul marino |
| Azul texto sobre marino | `#B9CDE2` | Texto secundario sobre azul marino |
| Azul chip claro | `#DCE8F4` / `#D6E8F5` | Labels sobre azul |
| Fondo avatar | `#E4EDF5` | Avatares |
| Fondo badge | `#E0EAF3` | Badges Ida/Vuelta |
| Crema fondo | `#F7F4E9` | Fondo de pantalla |
| Crema tarjeta | `#FFFCF4` | Tarjetas, filas, inputs, tab bar |
| Crema rúbrica | `#F4F0E2` | Fondo de rúbrica desplegada |
| Crema celda | `#F2EFE3` | Celdas con nota del reporte |
| Track barra | `#EAE4D2` | Track de barras |
| Tinta secundaria | `#28374F` | Texto de cuerpo |
| Gris texto | `#8A8270` | Texto terciario, tabs inactivos |
| Gris tenue | `#B5AE9B` / `#B0A896` | Vacíos, placeholders |
| Tierra texto | `#5C5340` / `#4A4534` | Notas y descripciones de rúbrica |
| Rojo · No logrado | `#B4553F` | Puntaje 1, errores, notas < 4,0 |
| Rojo fondo | `#FBF1EC` | Botón 1 en reposo, celdas reprobadas |
| Rojo texto claro | `#FFF4EE` / `#F3D9CF` / `#F0C9B9` | Texto sobre rojo |
| Rojo alerta oscuro | `#8A3A26` / `#6B3223` | Texto de prueba incompleta |
| Rojo alerta fondo | `#F8E9E2` | Tarjeta de prueba incompleta |
| Ámbar · Medianamente | `#9A7A28` | Puntaje 2 |
| Ámbar fondo | `#FBF6EA` | Botón 2 en reposo |
| Ámbar texto claro | `#FFF9EC` / `#F2E5C4` | Texto sobre ámbar |
| Ámbar aviso | `#E0A93C` | Punto de sync, bordes de aviso (`rgba(224,169,60,.5)`) |
| Ámbar aviso fondo | `#FBF7EC` | Tarjetas de pendientes / cola |
| Verde · Logrado | `#1B6E7C` | Puntaje 3, notas aprobadas |
| Verde fondo | `#EDF5F6` | Botón 3 en reposo |
| Verde texto claro | `#EFF9FA` / `#CFE8EB` | Texto sobre verde |

**Bordes:** `rgba(22,48,91,.1)` filas · `.12` tarjetas · `.14` inputs suaves · `.16`–`.2` inputs y chips · `.32` discontinuo · `rgba(255,255,255,.18)`–`.35` sobre azul marino.

### Tipografía

- **Barlow** — 400, 500, 600, 700. Todo el texto de UI.
- **Barlow Condensed** — 600, 700. Cifras grandes, eyebrows y labels en mayúsculas.

Escala usada: 9px–10px (eyebrows/labels con `letter-spacing .1em–.18em` y mayúsculas), 11–13.5px (texto secundario y descripciones), 14–17px (texto de UI y títulos de fila), 19–24px (títulos y notas medianas), 27–52px (cifras destacadas, Condensed). Mínimo absoluto en pantalla: 9px solo para labels de una palabra en mayúsculas; el texto legible nunca baja de 11px.

### Espaciado

Gaps 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18px. Padding de pantalla 16–20px horizontal, 14–18px superior, 20–26px inferior. Padding de tarjeta 11–20px. Padding de botón 10–17px.

### Radios

`5px` badges · `6–7px` cuadros de nivel y celdas · `9–11px` avatares y botones de puntaje · `12–15px` tarjetas y botones · `100px` chips, puntos y barras.

### Objetivos táctiles

Botones de puntaje **52×52 px**. Botones de acción ≥ 48px de alto. Tabs ≥ 44px. Ninguno por debajo de 44px.

### Sombras

**Ninguna.** El sistema separa por color de fondo y borde de 1px — decisión deliberada para legibilidad bajo sol directo.

---

## Assets

- `assets/vitta-logo.png` — logo VITTA High Performance (fuente del sistema de diseño del proyecto). Se usa en la ficha de contexto del documento de diseño, **no** dentro de la app. Si la app necesita marca en la interfaz, usar el escudo institucional UMCE, que debe pedirse al cliente.
- **Iconos:** el prototipo usa glifos Unicode como marcadores (`◉ ☷ ▤ ☰ ⌕ + › ‹`). **Reemplazar por un set real** (`lucide-react-native` o el del codebase): home, users, table, list, search, plus, chevron.
- **Fuentes:** Barlow y Barlow Condensed desde Google Fonts. En Expo, `@expo-google-fonts/barlow` y `@expo-google-fonts/barlow-condensed`.
- No hay imágenes ni ilustraciones en la app.

---

## Compilación y distribución

**Android (APK/AAB con EAS):**
```bash
npm i -g eas-cli && eas login
eas build:configure
eas build -p android --profile preview     # APK instalable directo
eas build -p android --profile production  # AAB para Play Store
```
Registrar el SHA-1 del keystore de EAS (`eas credentials`) en el cliente OAuth de Android, o la autenticación falla en el build firmado.

**iOS:** `eas build -p ios --profile production` con cuenta de Apple Developer; distribución interna vía TestFlight (suficiente para uso docente). Sin cuenta de desarrollador, solo `expo run:ios` en dispositivos registrados.

**Permisos:** ninguno sensible. Solo red. Declarar uso de red en `app.json`; no se requiere cámara, ubicación ni almacenamiento externo.

---

## Files

| Archivo | Qué es |
|---|---|
| `Natación VITTA.dc.html` | **El prototipo.** Nueve pantallas navegables con la lógica de puntaje y notas real. Abre en cualquier navegador. |
| `assets/vitta-logo.png` | Logo usado en la ficha de contexto del documento. |
| `support.js` | Runtime del prototipo. **Andamiaje — no portar.** |
| `ios-frame.jsx` | Marco de iPhone del prototipo. **Andamiaje — no portar.** |

**Cómo leer el prototipo:** el archivo tiene dos partes. El template (markup) define las nueve pantallas como bloques condicionales; la clase de lógica al final contiene las constantes `CRITERIA` (rúbrica), `ROWS` (las 10 observaciones), `DUAL` (criterios de doble observación) y `SEED` (nómina de ejemplo), más los métodos `nota()`, `promedio()` y `official()` — **esas tres funciones son la especificación ejecutable del cálculo de notas** y conviene portarlas primero, con tests.
