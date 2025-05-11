const horariosContainer = document.getElementById("horariosContainer");
const horas = Array.from({ length: 12 }, (_, i) => 12 + i); // 12 a 23
const estados = ["rojo", "verde", "amarillo"]; // 0: no puede, 1: puede, 2: duda

// 🔁 Reinicio automático cada domingo 9:00 AM
function getNextResetTime() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0: domingo
  let daysUntilReset = 0;

  if (dayOfWeek === 0 && now.getHours() < 9) {
    daysUntilReset = 0;
  } else {
    daysUntilReset = (7 - dayOfWeek) % 7;
    if (daysUntilReset === 0) daysUntilReset = 7;
  }

  const nextReset = new Date(now);
  nextReset.setDate(now.getDate() + daysUntilReset);
  nextReset.setHours(9, 0, 0, 0);
  return nextReset;
}

function updateLocalStorageReset() {
  const now = new Date();
  let storedResetTime = localStorage.getItem("resetTime");

  if (!storedResetTime) {
    const nextReset = getNextResetTime();
    localStorage.setItem("resetTime", nextReset.toISOString());
    return;
  }

  storedResetTime = new Date(storedResetTime);
  if (now >= storedResetTime) {
    localStorage.removeItem("yaVoto");
    const nextReset = getNextResetTime();
    localStorage.setItem("resetTime", nextReset.toISOString());
  }
}

updateLocalStorageReset();

// ✅ Si ya votó, mostrar agradecimiento y salir
if (localStorage.getItem("yaVoto") === "true") {
  document.getElementById("disponibilidadForm").style.display = "none";
  const gracias = document.createElement("p");
  gracias.textContent = "¡Gracias por tu respuesta!";
  gracias.style.fontSize = "20px";
  gracias.style.textAlign = "center";
  gracias.style.marginTop = "30px";
  document.body.appendChild(gracias);
} else {
  // 🟦 Generar las franjas horarias con botones de estado
  horas.forEach(hora => {
    const franja = document.createElement("div");
    franja.className = "franja";

    const label = document.createElement("label");
    label.textContent = `${hora}:00`;
    franja.appendChild(label);

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "boton-estado rojo";
    boton.dataset.estado = "0";

    boton.addEventListener("click", () => {
      let estado = parseInt(boton.dataset.estado);
      estado = (estado + 1) % estados.length;
      boton.dataset.estado = estado.toString();
      boton.className = `boton-estado ${estados[estado]}`;
    });

    franja.appendChild(boton);
    horariosContainer.appendChild(franja);
  });

  // 📤 Envío del formulario
  document.getElementById("disponibilidadForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    if (!nombre) {
      alert("Por favor ingresá tu nombre.");
      return;
    }

    const botones = document.querySelectorAll(".boton-estado");
    if (botones.length !== horas.length) {
      alert("Error: cantidad de franjas incompleta.");
      return;
    }

    const disponibilidad = {};
    for (let i = 0; i < horas.length; i++) {
      const estado = estados[parseInt(botones[i].dataset.estado)];
      disponibilidad[`${horas[i]}:00`] = estado;
    }

    fetch("/https://script.google.com/macros/s/AKfycby15geaK6hOGwgRggrJVUd-3g0ixrxVTWDb5axA5UJQYmIRKVhznchB8qGAx0_PT9_ciw/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, disponibilidad })
    }).then(res => {
      if (res.ok) {
        // ✅ Guardar que ya votó
        localStorage.setItem("yaVoto", "true");

        // Ocultar formulario
        document.getElementById("disponibilidadForm").style.display = "none";

        // Mostrar agradecimiento
        const gracias = document.createElement("p");
        gracias.textContent = "¡Gracias por tu respuesta!";
        gracias.style.fontSize = "20px";
        gracias.style.textAlign = "center";
        gracias.style.marginTop = "30px";
        document.body.appendChild(gracias);
      } else {
        alert("Hubo un error al enviar los datos.");
      }
    });
  });
}
