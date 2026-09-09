let recognition;
let palabras = [];
let historialTexto = [];
let ultimaPalabraTiempo = 0;
let tiempoPausaBucle = 2000;
let borrando = false;
let opacidadGeneral = 255;
let estadoMic = "Haz clic en 'Iniciar Performance'";

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');

  // Configurar Reconocimiento de Voz
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onstart = () => {
      estadoMic = "Escuchando...";
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        let transcript = event.results[i][0].transcript.toLowerCase().trim();

        // 1. Detección de comando de borrado
        if (transcript.includes("y pues si") || transcript.includes("y pues sí")) {
          activarDesvanecimiento();
          return;
        }

        // 2. Procesar palabras cuando el resultado es final (frase clara)
        if (event.results[i].isFinal) {
          let nuevasPalabras = transcript.split(/\s+/);
          nuevasPalabras.forEach((p) => {
            if (p.length > 0) {
              // Tamaño variado drásticamente según longitud/énfasis de la palabra
              let tamanoCalculado = constrain(p.length * 12 + random(20, 50), 30, 110);
              palabras.push(crearGranoArena(p, tamanoCalculado));
              historialTexto.push(p);
            }
          });
          ultimaPalabraTiempo = millis();
        } 
        // 3. Murmullos o palabras no entendidas/intermedias -> Generar balbuceos sin sentido
        else if (transcript.length > 2 && random() < 0.15) {
          let balbuceo = generarBalbuceo(random(2, 6));
          palabras.push(crearGranoArena(balbuceo, random(18, 35))); // Tamaño más pequeñito para balbuceos
        }
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
      try { recognition.start(); } catch (e) {}
    };
  }

  // Evento Botón Inicio
  let startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (recognition) {
        try { recognition.start(); } catch (e) {}
      }
      startBtn.style.display = 'none';
    });
  }

  // Evento Botón Pantalla Completa
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
  clear(); // Fondo transparente para OBS

  // Indicador de estado en la esquina superior izquierda
  noStroke();
  fill(255, 160);
  textSize(14);
  textAlign(LEFT, TOP);
  textStyle(NORMAL);
  text(estadoMic, 20, 20);

  // Lógica de Pausa Larga (Si te quedas en silencio, vuelven a caer palabras del historial o balbuceos)
  if (!borrando && millis() - ultimaPalabraTiempo > tiempoPausaBucle && historialTexto.length > 0) {
    let esBalbuceo = random() < 0.4;
    let textoCaida = esBalbuceo ? generarBalbuceo(random(3, 7)) : random(historialTexto);
    let tam = esBalbuceo ? random(20, 40) : random(60, 120);
    
    palabras.push(crearGranoArena(textoCaida, tam));
    ultimaPalabraTiempo = millis() - 1000;
  }

  // Desvanecimiento ("y pues si")
  if (borrando) {
    opacidadGeneral -= 12;
    if (opacidadGeneral <= 0) {
      palabras = [];
      historialTexto = [];
      borrando = false;
      opacidadGeneral = 255;
    }
  }

  // Configuración de la fuente manuscrita estilo libreta
  textFont('Caveat', 'cursive');

  for (let i = 0; i < palabras.length; i++) {
    let p = palabras[i];

    // Caída con física de gravedad desde arriba de la pantalla
    if (p.cayendo) {
      p.vy += p.gravedad;
      p.y += p.vy;

      let alturaSuelo = height - 40 - (i * 0.4);
      if (p.y >= alturaSuelo) {
        p.y = alturaSuelo;
        p.cayendo = false;
      }
    }

    let opacidadFinal = borrando ? opacidadGeneral : p.opacidad;

    push();
    translate(p.x, p.y);
    rotate(p.rotacion); // Leve inclinación orgánica como escrita a mano

    // Contorno grueso para lectura clara sobre video
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
    x: random(width * 0.1, width * 0.9),
    y: random(-120, -40), // Empieza arriba fuera de la pantalla
    vy: random(2, 6),
    gravedad: 0.4,
    cayendo: true,
    tamano: tamano || random(30, 75),
    opacidad: random(220, 255),
    rotacion: random(-0.15, 0.15) // Rotación manuscrita orgánica
  };
}

// Generador de palabras inventadas / balbuceos sin sentido
function generarBalbuceo(longitud) {
  const caracteres = "bcdfghjklmnpqrstvwxyz";
  const vocales = "aeiou";
  let resultado = "";
  for (let i = 0; i < longitud; i++) {
    if (i % 2 === 0) {
      resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    } else {
      resultado += vocales.charAt(Math.floor(Math.random() * vocales.length));
    }
  }
  return resultado;
}

function activarDesvanecimiento() {
  borrando = true;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}