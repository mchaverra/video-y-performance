let recognition;
let palabras = [];
let historialTexto = [];
let ultimaPalabraTiempo = 0;
let tiempoPausaBucle = 2500;
let borrando = false;
let opacidadGeneral = 255;
let textoProcesado = "";

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');

  // Configurar Reconocimiento de Voz
  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if ('SpeechRecognition' in window) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onresult = (event) => {
      let current = event.resultIndex;
      let transcript = event.results[current][0].transcript.toLowerCase();

      if (transcript.includes("y pues si") || transcript.includes("y pues sí")) {
        activarDesvanecimiento();
        return;
      }

      ultimaPalabraTiempo = millis();
      let palabrasActuales = transcript.trim().split(' ');
      
      for (let i = 0; i < palabrasActuales.length; i++) {
        let palabra = palabrasActuales[i];
        if (palabra && !textoProcesado.includes(palabra + "_" + i)) {
          palabras.push(crearGranoArena(palabra));
          textoProcesado += palabra + "_" + i + " ";
          historialTexto.push(palabra);
        }
      }

      if (event.results[current].isFinal) {
        textoProcesado = "";
      }
    };

    recognition.onend = () => {
      recognition.start();
    };
  }

  document.getElementById('start-btn').addEventListener('click', () => {
    if (recognition) recognition.start();
    document.getElementById('start-btn').style.display = 'none';
  });

  ultimaPalabraTiempo = millis();
}

function draw() {
  (background(0);)

  // Lógica de Pausa Larga
  if (!borrando && millis() - ultimaPalabraTiempo > tiempoPausaBucle && historialTexto.length > 0) {
    let palabraPasada = random(historialTexto);
    let p = crearGranoArena(palabraPasada);
    p.tamano = random(55, 95);
    palabras.push(p);
    ultimaPalabraTiempo = millis() - 1200; 
  }

  // Animación de Desvanecimiento ("y pues si")
  if (borrando) {
    opacidadGeneral -= 12;
    if (opacidadGeneral <= 0) {
      palabras = [];
      historialTexto = [];
      borrando = false;
      opacidadGeneral = 255;
      textoProcesado = "";
    }
  }

  // Dibujar palabras (Texto blanco brillante)
  textFont('Courier New', 'Courier', 'monospace');
  
  for (let i = 0; i < palabras.length; i++) {
    let p = palabras[i];

    if (p.cayendo) {
      p.vy += p.gravedad;
      p.y += p.vy;

      let alturaSuelo = height - 25 - (i * 0.7); 
      if (p.y >= alturaSuelo) {
        p.y = alturaSuelo;
        p.cayendo = false;
      }
    }

    let opacidadFinal = borrando ? opacidadGeneral : p.opacidad;
    fill(255, opacidadFinal);
    textSize(p.tamano);
    
    if (p.tamano > 70) {
      stroke(255, opacidadFinal - 80);
      strokeWeight(2);
    } else {
      noStroke();
    }
    
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
    vy: random(2, 4),
    gravedad: 0.35,
    cayendo: true,
    tamano: random(24, 60),
    opacidad: random(210, 255)
  };
}

function activarDesvanecimiento() {
  borrando = true;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}