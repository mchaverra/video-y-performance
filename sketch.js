let recognition;
let palabras = [];
let historialTexto = [];
let ultimaPalabraTiempo = 0;
let tiempoPausaBucle = 2500;
let borrando = false;
let opacidadGeneral = 255;
let textoProcesado = "";
let estadoMic = "Haz clic en el botón para activar";

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

    recognition.onstart = () => {
      estadoMic = "Micrófono Activo - Escuchando...";
    };

    recognition.onerror = (event) => {
      estadoMic = "Error de micrófono: " + event.error;
    };

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
      try { recognition.start(); } catch(e) {}
    };
  }

  document.getElementById('start-btn').addEventListener('click', () => {
    if (recognition) {
      try {
        recognition.start();
      } catch(e) {
        console.log(e);
      }
    }
    document.getElementById('start-btn').style.display = 'none';
  });

  ultimaPalabraTiempo = millis();
}

function draw() {
  clear(); // Transparente para OBS

  // Indicador visual de estado en la parte superior
  noStroke();
  fill(255, 180);
  textSize(14);
  textAlign(LEFT, TOP);
  text(estadoMic, 20, 20);

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

  // Dibujar palabras (Texto blanco con contorno negro para que resalte sobre tu cámara)
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
    
    // Borde negro grueso para que el texto sea legible sobre cualquier fondo o ropa
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
    vy: random(2, 4),
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