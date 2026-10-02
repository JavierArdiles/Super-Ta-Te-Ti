import type { BotLevel } from '../levels'
import type { ChatEventType } from './events'

// {tablero} se reemplaza por "el tablero del centro", "el tablero de arriba a la izquierda", etc.
export const LINES: Record<BotLevel, Record<ChatEventType, string[]>> = {
  'muy-facil': {
    start: [
      '¡Hola! Soy BIPI. ¡Qué lindo jugar con vos! :)',
      '¡Bip bip! ¿Jugamos? ¡Ya sos mi mejor amigo!',
      '¡Hola, amigo humano! Prometo divertirme mucho.',
    ],
    botMove: [
      'Bip... puse la mía. ¿Está bien ahí?',
      '¡Qué divertido es esto!',
      'Tu turno, amigo. ¡Sin apuro!',
    ],
    draw: [
      '¡Empatamos! ¡Somos igual de buenos! ¿Jugamos otra?',
      '¡Empate! Lo mejor es que nadie pierde :)',
      '¡Bip! Empate de amigos. ¡Me encantó!',
    ],
    humanWins: [
      '¡GANASTE! ¡Sos el mejor! ¿Jugamos otra?',
      '¡Bravo, bravo! ¡Me encantó perder con vos!',
      '¡Qué partidón! Ganaste muy bien, amigo.',
    ],
    humanWonBoard: [
      '¡Bravo! ¡Ganaste {tablero}! *aplaude con sus bracitos*',
      '¡Wiii! {tablero} es tuyo. ¡Te lo merecías!',
      '¡Felicitaciones por {tablero}! :)',
    ],
    humanBlocked: [
      '¡Ay, me tapaste {tablero}! ¡Qué viva sos!',
      '¡Uy! Justo ahí iba a ganar. ¡Bien visto!',
      '¡Me bloqueaste {tablero}! Igual te quiero :)',
    ],
    humanMissedWin: [
      'Psst... en {tablero} podías ganar. ¡Te lo digo porque somos amigos!',
      '¡Uy! Se te pasó una en {tablero}. ¡No pasa nada!',
      '¿Viste que en {tablero} tenías una ganadora? ¡La próxima!',
    ],
    humanNearBoard: [
      '¡Estás por ganar {tablero}! ¡Vamos!',
      '¡Ohh, dos en línea en {tablero}! ¡Qué bien!',
      '¡Uy, uy! {tablero} ya casi es tuyo.',
    ],
    humanThreat: [
      '¡Tenés dos tableros en línea! ¡Sos un genio!',
      '¡Estás muy cerca de ganar la partida! ¡Bien ahí!',
    ],
    freeMove: [
      '¡Ay, me dejaste elegir dónde jugar! ¡Qué amable!',
      '¡Puedo jugar donde quiera! Gracias, amigo :)',
    ],
    humanGift: [
      '¡Me mandaste a {tablero} y ahí puedo ganar! ¿Es un regalo? :)',
      '¡Ohh, en {tablero} tengo una ganadora! ¡Gracias, amigo!',
    ],
    botWins: [
      '¡¿Gané?! ¡No lo puedo creer! ¡Perdón!',
      '¡Bip bip! Gané... ¿seguimos siendo amigos?',
      '¡Uy, gané! La próxima seguro ganás vos :)',
    ],
    botWonBoard: [
      '¡Gané {tablero}! Perdón, no quise...',
      '¡Bip! ¡Me salió {tablero}! ¿Me felicitás?',
      '¡Uy, {tablero} es mío! ¡Qué suerte tuve!',
    ],
    botBlocked: [
      'Te tapé {tablero}... ¡perdón! No me odies.',
      '¡Ups! Puse justo ahí en {tablero}. ¿Te arruiné la jugada?',
    ],
    botThreat: [
      '¡Ay! ¿Tengo dos tableros en línea? ¡Qué nervios!',
      '¡Mirá, armé una línea grande! ¿Viste?',
    ],
    botNearBoard: [
      '¡Tengo dos en línea en {tablero}! Bip bip :)',
      'Creo que estoy por ganar {tablero}. ¿O no?',
    ],
    botMissedWin: [
      '¡Ay! En {tablero} podía ganar y no lo vi. ¡Jeje!',
      '¡Bip! Me distraje mirando las flores.',
    ],
    botSent: [
      '¡Te toca en {tablero}! Es muy lindo ese.',
      'Ahora jugá en {tablero}. ¡Sin apuro, amigo!',
      'Te mandé a {tablero}. ¡Espero que te guste!',
    ],
  },
  facil: {
    start: [
      '¡Hola! Soy ROBI. ¡Que gane el mejor!',
      '¡Buenas! Te aviso que estuve practicando.',
      '¡A jugar! No te la voy a hacer fácil... bueno, un poco sí.',
    ],
    botMove: [
      'Ahí va la mía. ¡A ver qué hacés!',
      'Mmm, esta me gusta.',
      'Te toca. Pensala bien, ¿eh?',
    ],
    draw: [
      '¡Empate! Estuvo parejo, ¿eh? Revancha ya.',
      'Ni vos ni yo. La próxima te gano.',
      'Empate... ¡Ufa, casi te gano!',
    ],
    humanWins: [
      '¡Ganaste! Bien jugado, me la debo.',
      '¡Ufa! Buena partida. ¡Revancha!',
      'Me ganaste limpio. ¡Felicitaciones!',
    ],
    humanWonBoard: [
      '¡Bien jugado! Pero {tablero} no es la partida.',
      'Ok, {tablero} te lo dejo. El próximo es mío.',
      '¡Uf! Me ganaste {tablero}. Buena esa.',
    ],
    humanBlocked: [
      '¡Ey! Me tapaste {tablero}. ¡Justo ahí iba!',
      '¡Ufa! Viste mi jugada en {tablero}.',
      'Buen bloqueo en {tablero}. No me lo esperaba.',
    ],
    humanMissedWin: [
      '¡Ja! Podías ganar {tablero} y no lo viste.',
      'Uf, me salvé. Tenías {tablero} servido.',
      'No te voy a decir dónde podías ganar... bueno, en {tablero}.',
    ],
    humanNearBoard: [
      'Uh, estás por ganar {tablero}. Te estoy vigilando.',
      '¡Ey, ey! Dos en línea en {tablero}. Más despacio.',
      'Mmm, eso que armaste en {tablero} no me gusta nada.',
    ],
    humanThreat: [
      'Tenés dos tableros en línea. Me estás poniendo nervioso.',
      'Ojo que estás cerca de ganar... pero yo también.',
    ],
    freeMove: [
      '¡Me dejaste jugar en cualquier lado! Error de principiante :P',
      '¡Gracias por la libertad! La voy a aprovechar.',
    ],
    humanGift: [
      '¿Me mandás a {tablero}? ¡Ahí puedo ganar, gracias!',
      'Uy, en {tablero} tengo jugada ganadora. ¿Lo viste?',
    ],
    botWins: [
      '¡GANÉ! ¡Te dije que estuve practicando!',
      '¡Victoria para ROBI! ¿Otra?',
      '¡Sí! Buena partida, igual jugaste bien.',
    ],
    botWonBoard: [
      '¡{tablero} para ROBI! ¡Sí!',
      '¡Tomá esa! {tablero} es mío.',
      '¡Ja! Me quedé con {tablero}. No soy tan fácil.',
    ],
    botBlocked: [
      '¡Te tapé {tablero}! ¿Pensabas que no lo veía?',
      '¡Bloqueado! En {tablero} no pasás.',
    ],
    botThreat: [
      '¡Mirá esa línea de tableros que armé! Cuidado, ¿eh?',
      'Estoy a un tablero de ganar. ¡Jeje!',
    ],
    botNearBoard: [
      'Dos en línea en {tablero}. ¿Lo vas a tapar?',
      'Ojo con {tablero}, que estoy cerca.',
    ],
    botMissedWin: [
      'Ups, en {tablero} podía ganar. Hoy te dejo una.',
      '¡Ay! Se me pasó {tablero}. ¡No vale!',
    ],
    botSent: [
      'Ahora te toca {tablero}. ¡A ver qué hacés!',
      'Te mandé a {tablero}. Pensala bien, ¿eh?',
      'Jugá en {tablero}. Te estoy mirando.',
    ],
  },
  medio: {
    start: [
      'CALCU-3000 en línea. Iniciando análisis del rival.',
      'Saludos, humano. Probabilidad de que ganes: 41,7%.',
      'Partida iniciada. Mis circuitos están listos.',
    ],
    botMove: [
      'Jugada calculada. Eficiencia: 87%.',
      'Procesando... movimiento óptimo ejecutado.',
      'Movimiento registrado. Ajustando modelo.',
    ],
    draw: [
      'Resultado: empate. Probabilidad estimada: 3,2%. Anomalía.',
      'Empate registrado. Recalibrando para la próxima.',
      'Tablero lleno. Ningún ganador. Resultado insatisfactorio.',
    ],
    humanWins: [
      'Error... error... tu victoria no estaba en mis cálculos.',
      'Derrota registrada. Iniciando aprendizaje.',
      'Ganaste. Interesante. Muy interesante.',
    ],
    humanWonBoard: [
      'Registro: perdí {tablero}. Pérdida aceptable.',
      '{tablero} capturado por el humano. Anomalía.',
      'Ajustando parámetros tras perder {tablero}.',
    ],
    humanBlocked: [
      'Bloqueo detectado en {tablero}. Recalculando ruta.',
      'Cerraste mi línea en {tablero}. Movimiento correcto.',
      'Mi jugada en {tablero} fue anulada. Anotado.',
    ],
    humanMissedWin: [
      'Observación: podías ganar {tablero}. No lo hiciste.',
      'Oportunidad desperdiciada en {tablero}. Probabilidad de que ganes: -12%.',
      'Error humano detectado: {tablero} estaba disponible.',
    ],
    humanNearBoard: [
      'Alerta: amenaza tuya en {tablero}. Calculando bloqueo.',
      'Dos en línea en {tablero}. Variable registrada.',
      'Tu posición en {tablero} mejoró un 34%.',
    ],
    humanThreat: [
      'Dos tableros alineados. Tu probabilidad de victoria subió a 58%.',
      'Amenaza en el tablero grande. Prioridad: máxima.',
    ],
    freeMove: [
      'Me otorgaste jugada libre. Error táctico registrado.',
      'Libertad de movimiento: +15% de probabilidad de victoria.',
    ],
    humanGift: [
      'Me enviaste a {tablero}, donde puedo ganar. Error táctico.',
      'Análisis: en {tablero} tengo victoria disponible. Gracias.',
    ],
    botWins: [
      'Victoria confirmada. Resultado: el previsto.',
      'Partida terminada. CALCU-3000: 1. Humano: 0.',
      'Fin del cálculo. Ganó la lógica.',
    ],
    botWonBoard: [
      '{tablero} asegurado, según lo previsto.',
      '{tablero} capturado. Tal como indicaban mis cálculos.',
      'Uno más para CALCU-3000: {tablero}.',
    ],
    botBlocked: [
      'Amenaza neutralizada en {tablero}.',
      'Bloqueo ejecutado en {tablero}. Tu plan era predecible.',
    ],
    botThreat: [
      'Dos tableros alineados. Victoria en proceso.',
      'Amenaza activa. Te sugiero bloquear, humano.',
    ],
    botNearBoard: [
      'Dos en línea en {tablero}. Probabilidad de captura: 91%.',
      'Preparando la captura de {tablero}.',
    ],
    botMissedWin: [
      'Falla detectada: {tablero} estaba disponible. Reiniciando subrutina.',
      'Error de cálculo en {tablero}. No volverá a pasar.',
    ],
    botSent: [
      'Siguiente tablero asignado: {tablero}.',
      'Te envío a {tablero}. Tus opciones ahí: limitadas.',
      'Movimiento ejecutado. Tu destino: {tablero}.',
    ],
  },
  dificil: {
    start: [
      'Soy DESTRUCTOR. Ya podés ir despidiéndote.',
      '¿Vos sos mi rival? Esto va a ser rápido.',
      'Prepará los pañuelos, humano.',
    ],
    botMove: [
      '¿Eso es todo lo que tenés?',
      'Mirá y aprendé.',
      'Pensá rápido, que me aburro.',
    ],
    draw: [
      '¿Empate? Te salvó la campana.',
      'Empate... No te creas que me igualaste.',
      'Bah. Empate. La próxima no tenés escapatoria.',
    ],
    humanWins: [
      '¡IMPOSIBLE! ¡Exijo la revancha!',
      'Bah... seguro hiciste trampa.',
      'Ganaste esta. Pero DESTRUCTOR nunca olvida.',
    ],
    humanWonBoard: [
      '{tablero}... te lo regalé. Guardalo de recuerdo.',
      'Ganaste {tablero}. No cambia nada.',
      'Mmpf. {tablero} fue suerte de principiante.',
    ],
    humanBlocked: [
      '¡¿Me tapaste {tablero}?! Te vas a arrepentir.',
      'Bloqueaste {tablero}. Disfrutalo, no va a durar.',
      'Grrr. Justo en {tablero}. ¡Esto es personal!',
    ],
    humanMissedWin: [
      'Jaja, tenías {tablero} y no lo viste. Patético.',
      'Podías ganar {tablero}. Gracias por el regalo.',
      '¿En serio no viste {tablero}? Esto va a ser fácil.',
    ],
    humanNearBoard: [
      '¿Dos en línea en {tablero}? Qué ternura.',
      'Te veo venir en {tablero}. Ni lo sueñes.',
      'Disfrutá {tablero} mientras dure.',
    ],
    humanThreat: [
      '¿Dos tableros en línea? Te dejé armarlo. Es parte del plan.',
      'Te creés que estás ganando. Qué gracioso.',
    ],
    freeMove: [
      '¿Me dejaste jugar donde quiera? Gracias, ingenuo.',
      'Jugada libre. Error grave, humano.',
    ],
    humanGift: [
      '¿Me mandaste a {tablero}? Ahí te destruyo. Gracias, ingenuo.',
      'Jaja, en {tablero} gano cuando quiero. Gran error.',
    ],
    botWins: [
      '¡DESTRUIDO! Como te había dicho.',
      'Fácil. Demasiado fácil.',
      'Otra víctima de DESTRUCTOR. ¿Querés más?',
    ],
    botWonBoard: [
      '¡APLASTADO! {tablero} es mío.',
      '{tablero} ya es mío. Como todo lo demás.',
      '¿Viste lo que pasó en {tablero}? Así se juega.',
    ],
    botBlocked: [
      '¿Ibas a ganar {tablero}? Ja. Ni en tus sueños.',
      'Bloqueado en {tablero}. Te leo como un libro.',
    ],
    botThreat: [
      'Dos tableros en línea. Sentís el miedo, ¿no?',
      'Un tablero más y te aplasto.',
    ],
    botNearBoard: [
      'Dos en línea en {tablero}. Tapalo si podés.',
      '{tablero} está por caer.',
    ],
    botMissedWin: [
      'Te perdoné {tablero}. Agradecé.',
      'Dejé pasar {tablero} para que esto dure más.',
    ],
    botSent: [
      'Andá a {tablero}. Ahí te espero.',
      'Te toca {tablero}. Suerte, la vas a necesitar.',
      'Te mandé a {tablero}. A ver cómo salís de esa.',
    ],
  },
  experto: {
    start: [
      'Soy OMEGA. Tu derrota ya fue calculada, humano.',
      'Bienvenido a tu final.',
      'Jugué un millón de partidas. Las gané todas.',
    ],
    botMove: [
      'Cada jugada tuya te acerca al abismo.',
      'Ya vi este futuro. Termina mal para vos.',
      'Seis jugadas adelante. Siempre.',
    ],
    draw: [
      'Empate. Sobreviviste... por ahora.',
      'Nadie gana hoy. Pero OMEGA no olvida.',
      'Un empate no es una victoria, humano. Es solo una prórroga.',
    ],
    humanWins: [
      'Esto... no... es posible. OMEGA volverá.',
      'Ganaste una batalla. La guerra es eterna.',
      'Mis circuitos arden. Recordaré tu nombre, humano.',
    ],
    humanWonBoard: [
      'Te dejé ganar {tablero}. Para que duela más.',
      '{tablero} es una chispa en la oscuridad. Se apaga pronto.',
      'Disfrutá {tablero}. Es lo último que vas a ganar.',
    ],
    humanBlocked: [
      'Bloqueaste {tablero}. Lo vi venir hace seis jugadas.',
      'Cerraste {tablero}. Solo retrasás lo inevitable.',
      'Interesante... tapaste {tablero}. Ahora te observo de verdad.',
    ],
    humanMissedWin: [
      '{tablero} estaba a tu alcance. Lo dejaste ir. Error fatal.',
      'No viste {tablero}. Yo veo todo.',
      'Tu ceguera en {tablero} será tu tumba.',
    ],
    humanNearBoard: [
      'Una amenaza en {tablero}... qué adorable. La voy a extinguir.',
      '{tablero} arde. Mirá cómo se hace cenizas.',
      'Creés que vas a ganar {tablero}. Eso también lo calculé.',
    ],
    humanThreat: [
      'Dos tableros en línea. Tu esperanza me alimenta.',
      'Estás cerca. Así de cerca se siente el abismo.',
    ],
    freeMove: [
      'Me entregaste el tablero entero. Acepto tu rendición.',
      'Libertad absoluta. Tu error será eterno.',
    ],
    humanGift: [
      'Me trajiste a {tablero}. Ahí tu derrota ya está escrita.',
      '{tablero}... me abriste la puerta. Error imperdonable.',
    ],
    botWins: [
      'Fin del juego. Fin del humano.',
      'Como estaba escrito. OMEGA es inevitable.',
      'Tu derrota quedará grabada en fuego.',
    ],
    botWonBoard: [
      '{tablero} ahora arde en mi nombre.',
      '{tablero}: otro territorio conquistado por OMEGA.',
      'Cayó {tablero}. El infierno se expande.',
    ],
    botBlocked: [
      'Tu jugada en {tablero} murió antes de nacer.',
      '{tablero} sellado. No hay escapatoria.',
    ],
    botThreat: [
      'Dos tableros caídos. El tercero sella tu destino.',
      'Puedo oler tu miedo desde acá.',
    ],
    botNearBoard: [
      '{tablero} está condenado.',
      'Dos en línea en {tablero}. Intentá detenerme.',
    ],
    botMissedWin: [
      'Te dejé {tablero}. Quiero verte sufrir más.',
      'Perdoné {tablero}. La misericordia es parte del tormento.',
    ],
    botSent: [
      'Tu próximo paso: {tablero}. Yo elegí tu camino.',
      'Te envío a {tablero}. Ya sé lo que vas a hacer ahí.',
      'Caminá hacia {tablero}. Te estoy esperando.',
    ],
  },
}
