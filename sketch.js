let recognition;
let palabras = [];
let historialTexto = [];
let ultimaPalabraTiempo = 0;
let borrando = false;
let opacidadGeneral = 255;
let estadoMic = "Haz clic en 'Iniciar Performance'";
let palabrasProcesadasGlobal = 0;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true; // Para capturar en tiempo real palabra por palabra
    recognition.lang = 'es-ES';

    recognition.onstart = () => { estadoMic = "Escuchando en vivo..."; };

    recognition.onresult = (event) => {
      let transcripcionCompleta = "";
      for (let i = 0; i < event.results.length; i++) {
        transcripcionCompleta += event.results[i][0].transcript.toLowerCase() + " ";
      }

      // Comando de purga
      if (transcripcionCompleta.includes("y pues si") || transcripcionCompleta.includes("y pues sí")) {
        activarDesvanecimiento();
        return;
      }

      let listaPalabras = transcripcionCompleta.trim().split(/\s+/);

      // Flujo continuo: Suelta la palabra tan pronto como la voz la pronuncia
      while (palabrasProcesadasGlobal < listaPalabras.length) {
        let p = listaPalabras[palabrasProcesadasGlobal];
        if (p && p.length > 0) {
          let tamanoCalculado = constrain(p.length * 10 + random(25, 55), 35, 105);
          palabras.push(crearGranoArena(p, tamanoCalculado));
          historialTexto.push(p);
          ultimaPalabraTiempo = millis();
        }
        palabrasProcesadasGlobal++;
      }

      if (event.results[event.results.length - 1].isFinal) {
        palabrasProcesadasGlobal = 0;
      }
    };

    recognition.onerror = (e) => {
      if (e.error === 'no-speech') {
        try { recognition.start(); } catch (err) {}
      } else {
        estadoMic = "Reconectando...";
      }
    };

    recognition.onend = () => {
      palabrasProcesadasGlobal = 0;
      try { recognition.start(); } catch (e) {}
    };
  }

  // Eventos UI
  let startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (recognition) { try { recognition.start(); } catch (e) {} }
      startBtn.style.display = 'none';
    });
  }

  let fsBtn = document.getElementById('fullscreen-btn');
  if (fsBtn) {
    fsBtn.addEventListener('click', () => {
      let fs = fullscreen();
      fullscreen(!fs);
    });
  }

  ultimaPalabraTiempo = millis();
}

function draw() {
  clear(); // Limpia el canvas para fondo 100% transparente en OBS

  // Estado discreto
  noStroke();
  fill(255, 180);
  textSize(14);
  textAlign(LEFT, TOP);
  textFont('monospace');
  text(estadoMic, 20, 20);

  // Pausa prolongada: Goteo continuo de palabras pasadas o balbuceos
  if (!borrando && millis() - ultimaPalabraTiempo > 1800 && historialTexto.length > 0) {
    let esBalbuceo = random() < 0.35;
    let textoCaida = esBalbuceo ? generarBalbuceo(random(3, 6)) : random(historialTexto);
    let tam = esBalbuceo ? random(22, 38) : random(50, 90);
    
    palabras.push(crearGranoArena(textoCaida, tam));
    ultimaPalabraTiempo = millis() - 600; // Goteo constante uno a uno
  }

  // Desvanecimiento
  if (borrando) {
    opacidadGeneral -= 12;
    if (opacidadGeneral <= 0) {
      palabras = [];
      historialTexto = [];
      borrando = false;
      opacidadGeneral = 255;
      palabrasProcesadasGlobal = 0;
    }
  }

  // Estilo Manuscrito (Caveat)
  textFont('Caveat', 'cursive');

  for (let i = 0; i < palabras.length; i++) {
    let p = palabras[i];

    if (p.cayendo) {
      p.vy += p.gravedad;
      p.y += p.vy;

      let alturaSuelo = height - 45 - (i * 0.4);
      if (p.y >= alturaSuelo) {
        p.y = alturaSuelo;
        p.cayendo = false;
      }
    }

    let opacidadFinal = borrando ? opacidadGeneral : p.opacidad;

    push();
    translate(p.x, p.y);
    rotate(p.rotacion);

    stroke(0, opacidadFinal);
    strokeWeight(p.tamano > 60 ? 5 : 3);
    fill(255, opacidadFinal);
    textSize(p.tamano);
    textAlign(CENTER, CENTER);
    text(p.texto, 0, 0);
    pop();
  }
}

function crearGranoArena(texto, tamano) {
  return {
    texto: texto,
    x: random(width * 0.12, width * 0.88),
    y: random(-100, -30),
    vy: random(2, 5),
    gravedad: 0.38,
    cayendo: true,
    tamano: tamano || random(30, 70),
    opacidad: random(220, 255),
    rotacion: random(-0.12, 0.12)
  };
}

function generarBalbuceo(longitud) {
  const caracteres = "bcdfghjklmnpqrstvwxyz";
  const vocales = "aeiou";
  let res = "";
  for (let i = 0; i < longitud; i++) {
    res += (i % 2 === 0) ? caracteres.charAt(Math.floor(Math.random() * caracteres.length)) : vocales.charAt(Math.floor(Math.random() * vocales.length));
  }
  return res;
}

function activarDesvanecimiento() {
  borrando = true;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}