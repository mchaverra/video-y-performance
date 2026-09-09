let recognition;
let palabras = [];
let historialTexto = [];
let ultimaPalabraTiempo = 0;
let tiempoPausaBucle = 2500;
let borrando = false;
let opacidadGeneral = 255;
let estadoMic = "Micrófono Activo - Habla ahora...";

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Configuración directa de Web Speech API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          let texto = event.results[i][0].transcript.toLowerCase().trim();

          if (texto.includes("y pues si") || texto.includes("y pues sí")) {
            activarDesvanecimiento();
            return;
          }

          let nuevasPalabras = texto.split(/\s+/);
          nuevasPalabras.forEach((p) => {
            if (p.length > 0) {
              palabras.push(crearGranoArena(p));
              historialTexto.push(p);
            }
          });

          ultimaPalabraTiempo = millis();
        }
      }
    };

    recognition.onerror = (e) => {
      estadoMic = "Error: " + e.error;
    };

    recognition.onend = () => {
      try { recognition.start(); } catch (e) {}
    };

    // Forzar inicio
    try {
      recognition.start();
    } catch (e) {}
  } else {
    estadoMic = "Navegador no compatible";
  }

  // Activar por botón si fue bloqueado
  let btn = document.getElementById('start-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      try { recognition.start(); } catch (e) {}
      btn.style.display = 'none';
    });
  }

  ultimaPalabraTiempo = millis();
}

function draw() {
  clear(); // Fondo transparente para OBS

  // Indicador de estado
  noStroke();
  fill(255, 180);
  textSize(14);
  textAlign(LEFT, TOP);
  text(estadoMic, 20, 20);

  // Lógica de Pausa Larga (Cae palabra del historial)
  if (!borrando && millis() - ultimaPalabraTiempo > tiempoPausaBucle && historialTexto.length > 0) {
    let palabraPasada = random(historialTexto);
    let p = crearGranoArena(palabraPasada);
    p.tamano = random(55, 95);
    palabras.push(p);
    ultimaPalabraTiempo = millis() - 1200;
  }

  // Desvanecimiento
  if (borrando) {
    opacidadGeneral -= 12;
    if (opacidadGeneral <= 0) {
      palabras = [];
      historialTexto = [];
      borrando = false;
      opacidadGeneral = 255;
    }
  }

  // Dibujar Palabras
  textFont('Courier New', 'Courier', 'monospace');

  for (let i = 0; i < palabras.length; i++) {
    let p = palabras[i];

    if (p.cayendo) {
      p.vy += p.gravedad;
      p.y += p.vy;

      let alturaSuelo = height - 35 - (i * 0.5);
      if (p.y >= alturaSuelo) {
        p.y = alturaSuelo;
        p.cayendo = false;
      }
    }

    let opacidadFinal = borrando ? opacidadGeneral : p.opacidad;

    stroke(0, opacidadFinal);
    strokeWeight(4);
    fill(255, opacidadFinal);
    textSize(p.tamano);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(p.texto, p.x, p.y);
  }
}

function crearGranoArena(texto) {
  return {
    texto: texto,
    x: random(width * 0.1, width * 0.9),
    y: random(-80, -20),
    vy: random(2, 5),
    gravedad: 0.35,
    cayendo: true,
    tamano: random(28, 65),
    opacidad: random(220, 255)
  };
}

function activarDesvanecimiento() {
  borrando = true;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}