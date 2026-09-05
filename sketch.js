let video;
let recognition;
let palabras = [];
let historialTexto = [];
let ultimaPalabraTiempo = 0;
let tiempoPausaBucle = 3000; // 3 segundos de pausa para activar la superposición en bucle

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');

  // Inicializar Cámara Web
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Configurar Reconocimiento de Voz (Web Speech API)
  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if ('SpeechRecognition' in window) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onresult = (event) => {
      let current = event.resultIndex;
      let transcript = event.results[current][0].transcript;

      // Registrar tiempo de la palabra hablada
      ultimaPalabraTiempo = millis();
      historialTexto.push(transcript);

      // Crear objeto visual de texto sobre la pantalla
      palabras.push({
        texto: transcript,
        x: random(width * 0.2, width * 0.8),
        y: random(height * 0.2, height * 0.8),
        tamano: random(24, 60),
        opacidad: 250
      });
    };

    recognition.onend = () => {
      recognition.start(); // Reiniciar automáticamente si se detiene
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

  // 1. Mostrar Video en vivo (El rostro/cuerpo frente a la silla)
  push();
  translate(width, 0);
  scale(-1, 1); // Espejar video
  image(video, 0, 0, width, height);
  pop();

  // Capa translúcida para contraste
  fill(0, 0, 0, 80);
  rect(0, 0, width, height);

  // 2. Lógica de Pausa Larga (Si hay silencio, superponer lo que se dijo antes)
  if (millis() - ultimaPalabraTiempo > tiempoPausaBucle && historialTexto.length > 0) {
    let frasePasada = random(historialTexto);
    palabras.push({
      texto: frasePasada,
      x: random(width * 0.1, width * 0.9),
      y: random(height * 0.1, height * 0.9),
      tamano: random(30, 80),
      opacidad: 220
    });
    // Reiniciar temporizador de pausa ligera para mantener el bucle acumulativo
    ultimaPalabraTiempo = millis() - (tiempoPausaBucle - 800);
  }

  // 3. Dibujar la masa de palabras acumuladas
  for (let i = 0; i < palabras.length; i++) {
    let p = palabras[i];
    fill(255, p.opacidad);
    textSize(p.tamano);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(p.texto, p.x, p.y);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}