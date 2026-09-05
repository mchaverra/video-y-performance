let video;
let recognition;
let palabras = [];
let historialTexto = [];
let ultimaPalabraTiempo = 0;
let tiempoPausaBucle = 2500; // 2.5 segundos para considerar pausa
let haHablado = false;
let fontMonospace; // Para la tipografía de máquina de escribir

function preload() {
  // Opcional: Si quieres usar una fuente específica de máquina de escribir cargada, descomenta y sube el archivo.
  // Pero por defecto usaremos la fuente monospace del sistema que ya se parece.
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');

  // Inicializar Cámara Web (La que detecte Chrome por defecto)
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Configurar Reconocimiento de Voz
  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if ('SpeechRecognition' in window) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onresult = (event) => {
      let current = event.resultIndex;
      let transcript = event.results[current][0].transcript;

      // Actualizar tiempo cuando habla
      ultimaPalabraTiempo = millis();
      haHablado = true; // Flag para saber que ha empezado a hablar

      if (event.results[current].isFinal) {
        // Al terminar la frase, añadir al historial para la superposición
        historialTexto.push(transcript);
        
        // Crear las palabras para la lluvia
        let palabrasDeFrase = transcript.split(' ');
        for (let pTexto of palabrasDeFrase) {
          palabras.push(crearPalabra(pTexto));
        }
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

  // 1. Mostrar Video (La cámara vieja si está configurada en Chrome)
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  // Capa translúcida para contraste
  fill(0, 0, 0, 100);
  rect(0, 0, width, height);

  // 2. Lógica de Pausas y Superposición al volver a hablar
  // Si ha hablado antes y ha pasado el tiempo de pausa
  if (haHablado && millis() - ultimaPalabraTiempo > tiempoPausaBucle && historialTexto.length > 0) {
    
    // Al hablar de nuevo (el micrófono detecta sonido, pero el reconocimiento aún procesa),
    // esta lógica se activará una vez y luego el flag volverá a true con la nueva frase.
    // Para simplificar, haremos que durante el silencio la masa de palabras aumente una vez.
    
    let frasePasada = random(historialTexto);
    let palabrasDeFrase = frasePasada.split(' ');
    for (let pTexto of palabrasDeFrase) {
        // Palabras de pausas caen más rápido y son más opacas
        let p = crearPalabra(pTexto);
        p.vy = random(3, 7); // Caen más rápido
        p.opacidad = 255; // Súper opacas para el colapso visual
        p.tamano = random(50, 120); // Mucho más grandes
        palabras.push(p);
    }
    
    // Reiniciar flag para evitar bucles infinitos durante el silencio,
    // se activará de nuevo cuando el reconocimiento detecte voz nueva.
    haHablado = false; 
  }

  // 3. Actualizar y Dibujar la Lluvia de Palabras
  // Usar tipografía de máquina de escribir del sistema
  textFont('Courier New', 'Courier', 'monospace');
  
  for (let i = palabras.length - 1; i >= 0; i--) {
    let p = palabras[i];
    
    // Movimiento (Lluvia)
    p.y += p.vy;

    // Estilo (Máquina de escribir, tamaño, grosor)
    fill(255, p.opacidad);
    textSize(p.tamano);
    
    // p5.js textStyle no afecta mucho a monospace, el grosor lo simularemos con grosor de trazo si es muy grande
    if (p.tamano > 80) {
        stroke(255, p.opacidad - 100);
        strokeWeight(2);
    } else {
        noStroke();
    }
    textStyle(BOLD); 
    textAlign(CENTER, TOP);
    
    text(p.texto, p.x, p.y);

    // Opcional: Eliminar palabras que salen de la pantalla para rendimiento
    if (p.y > height + 100) {
        palabras.splice(i, 1);
    }
  }
}

// Función auxiliar para crear objetos de palabra consistentes
function crearPalabra(texto) {
    return {
        texto: texto,
        x: random(width * 0.05, width * 0.95), // Repartidas por todo el ancho
        y: random(-200, -50), // Aparecen arriba, fuera de pantalla
        vy: random(1, 4), // Velocidad de caída
        // Variación de tamaño y grosor
        tamano: random(20, 70), 
        opacidad: 200
    };
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}