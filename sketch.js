let video;
let recognition;
let palabras = [];
let historialTexto = [];
let ultimaPalabraTiempo = 0;
let tiempoPausaBucle = 2500;
let borrando = false;
let opacidadGeneral = 255;
let textoProcesado = ""; // Control para no repetir palabras en tiempo real

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');

  // Inicializar Cámara Web
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Configurar Reconocimiento de Voz
  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if ('SpeechRecognition' in window) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true; // Permite captura instantánea en tiempo real
    recognition.lang = 'es-ES';

    recognition.onresult = (event) => {
      let current = event.resultIndex;
      let transcript = event.results[current][0].transcript.toLowerCase();

      // DETONANTE DE LIMPIEZA: Detecta "y pues si" o "y pues sí" en tiempo real
      if (transcript.includes("y pues si") || transcript.includes("y pues sí")) {
        activarDesvanecimiento();
        return;
      }

      ultimaPalabraTiempo = millis();

      // EXTRAER PALABRAS EN TIEMPO REAL (mientras se habla)
      let palabrasActuales = transcript.trim().split(' ');
      
      // Compara lo que está diciendo ahora con lo que ya se dibujó para soltar solo las palabras NUEVAS
      for (let i = 0; i < palabrasActuales.length; i++) {
        let palabra = palabrasActuales[i];
        if (palabra && !textoProcesado.includes(palabra + "_" + i)) {
          palabras.push(crearGranoArena(palabra));
          textoProcesado += palabra + "_" + i + " "; // Marcar como dibujada
          historialTexto.push(palabra);
        }
      }

      // Al cerrar la frase completa, reiniciamos el rastreador temporal
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
  background(0);

  // 1. Mostrar Video (Cámara)
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  // Capa translúcida para contraste
  fill(0, 0, 0, 100);
  rect(0, 0, width, height);

  // 2. Lógica de Pausa Larga (Acumulación extra si hay silencio)
  if (!borrando && millis() - ultimaPalabraTiempo > tiempoPausaBucle && historialTexto.length > 0) {
    let palabraPasada = random(historialTexto);
    let p = crearGranoArena(palabraPasada);
    p.tamano = random(55, 95); // Palabras más grandes en la pausa
    palabras.push(p);
    ultimaPalabraTiempo = millis() - 1200; 
  }

  // 3. Animación de Desvanecimiento ("y pues si")
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

  // 4. Dibujar y Simular Física de "Arena"
  textFont('Courier New', 'Courier', 'monospace');
  
  for (let i = 0; i < palabras.length; i++) {
    let p = palabras[i];

    // Aplicar Gravedad
    if (p.cayendo) {
      p.vy += p.gravedad;
      p.y += p.vy;

      // Apilamiento gradual en el suelo
      let alturaSuelo = height - 25 - (i * 0.7); 
      if (p.y >= alturaSuelo) {
        p.y = alturaSuelo;
        p.cayendo = false;
      }
    }

    // Estilo y Renderizado
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