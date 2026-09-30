"use strict";
// Scripted educational responses, not a validated physiological model.

/* == AQUÍ SE GUARDA EL ESTADO DEL PACIENTE SIMULADO == */
const clinical = {
  elapsed: 0,
  target: 0,
  paused: false,
  voice: false,
  event: null,
  stopped: false,
  assessed: false,
  called: false,
  reassured: false,
  drainage: 0,
  initial: 900,
  hr: 104,
  rr: 22,
  sys: 154,
  dia: 88,
  pain: 8,
  log: [],
  lastMessage: "",
  lastPaint: 0,
  frame: 0,
  announced: new Set(),
};

/* == AQUÍ SE FIJAN LOS VALORES INICIALES DEL GUION == */
const clinicalDefaults = {
  male: { hr: 104, rr: 22, sys: 154, dia: 88, pain: 8, volume: 900 },
  female: { hr: 96, rr: 20, sys: 142, dia: 84, pain: 6, volume: 650 },
  trauma: { hr: 108, rr: 24, sys: 118, dia: 76, pain: 7, volume: 0 },
};

/* == AQUÍ SE NOMBRAN LAS INCIDENCIAS DISPONIBLES == */
const incidentLabels = {
  resistance: "Resistencia durante el avance",
  vagal: "Mareo y respuesta vagal",
  obstruction: "Acodamiento del tubo de drenaje",
  contamination: "Material contaminado",
};

/* == AQUÍ SE GUARDA UN EVENTO EN LA BITÁCORA CLÍNICA SIMULADA == */
function recordClinical(message) {
  clinical.log.push({ time: Math.floor(clinical.elapsed), message });
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: clinical.log.length>80 == */
  if (clinical.log.length > 80) clinical.log.shift();
  $("#clinical-log").innerHTML = clinical.log
    .map(
      (e) =>
        "<li><time>" +
        String(Math.floor(e.time / 60)).padStart(2, "0") +
        ":" +
        String(e.time % 60).padStart(2, "0") +
        "</time> " +
        esc(e.message) +
        "</li>",
    )
    .reverse()
    .join("");
}

/* == AQUÍ SE PRESENTA EL MENSAJE DEL PACIENTE y se reproduce voz si está activada == */
function sayClinical(message) {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: clinical.lastMessage===message == */
  if (clinical.lastMessage === message) return;
  clinical.lastMessage = message;
  $("#patient-voice").textContent = message;
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: clinical.voice&&'speechSynthesis' in window == */
  if (clinical.voice && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    /* == AQUÍ SE PREPARAN LOS VALORES u == */
    const u = new SpeechSynthesisUtterance(message);
    u.lang = "es-CO";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }
}

/* == AQUÍ SE RESTABLECEN LOS VALORES PROGRAMADOS DEL CASO == */
function resetClinical() {
  /* == AQUÍ SE PREPARAN LOS VALORES d == */
  const d = clinicalDefaults[state.scenario];
  Object.assign(clinical, {
    elapsed: 0,
    target: 0,
    paused: false,
    event: null,
    stopped: false,
    assessed: false,
    called: false,
    reassured: false,
    drainage: 0,
    initial: d.volume,
    hr: d.hr,
    rr: d.rr,
    sys: d.sys,
    dia: d.dia,
    pain: d.pain,
    log: [],
    lastMessage: "",
    announced: new Set(),
  });
  window.speechSynthesis?.cancel();
  $("#clinical-pause").textContent = "Pausar paciente";
  $("#clinical-pause").setAttribute("aria-pressed", "false");
  recordClinical(
    "Inicio del caso. Valores y evolución programados para docencia.",
  );
  updateClinical(0);
}

/* == AQUÍ SE DETECTA UNA OBSTRUCCIÓN SIMULADA == */
function obstructed() {
  return (
    clinical.event === "obstruction" || (state.step >= 10 && state.bag < 65)
  );
}

/* == AQUÍ SE DECIDE SI EL GUION PERMITE DRENAJE == */
function clinicalFlow() {
  return (
    state.scenario !== "trauma" &&
    state.insertion >= 82 &&
    !obstructed() &&
    !clinical.event &&
    !clinical.paused &&
    !paused
  );
}

/* == AQUÍ SE ACTUALIZAN EL MONITOR, EL DRENAJE Y LAS ALERTAS DEL GUION == */
function updateClinical(dt) {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: clinical.paused||paused||document.hidden == */
  if (clinical.paused || paused || document.hidden) dt = 0;
  clinical.elapsed += dt;

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: dt>0&&state.step===7&&!clinical.event&&!busy&&clinical.target>state.insertion == */
  if (
    dt > 0 &&
    state.step === 7 &&
    !clinical.event &&
    !busy &&
    clinical.target > state.insertion
  ) {
    baseAdvance(Math.min(clinical.target, state.insertion + dt * 8));
    /* == AQUÍ SE PREPARAN LOS VALORES slider == */
    const slider = $("#advance");
    /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: slider == */
    if (slider) slider.value = state.insertion;
  }

  /* == AQUÍ SE PREPARAN LOS VALORES d == */
  const d = clinicalDefaults[state.scenario];
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: clinicalFlow() == */
  if (clinicalFlow())
    clinical.drainage = Math.min(
      clinical.initial - 40,
      clinical.drainage + dt * 12,
    );

  /* == AQUÍ SE PREPARAN LOS VALORES relief == */
  const relief = clinical.initial
    ? clinical.drainage / (clinical.initial - 40)
    : 0;

  /* == AQUÍ SE PREPARAN LOS VALORES pain == */
  let pain = Math.max(2, d.pain - relief * (d.pain - 2));
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: clinical.reassured == */
  if (clinical.reassured) pain = Math.max(2, pain - 0.5);
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.step===7&&state.insertion>0&&state.insertion<82 == */
  if (state.step === 7 && state.insertion > 0 && state.insertion < 82)
    pain = Math.min(8, pain + 1);

  /* == AQUÍ SE PREPARAN LOS VALORES hr, rr, sys, dia == */
  let hr = d.hr - relief * (d.hr - 78) - (clinical.reassured ? 3 : 0),
    rr = d.rr - relief * (d.rr - 16),
    sys = d.sys - relief * (d.sys - 126),
    dia = d.dia - relief * (d.dia - 78);

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: clinical.event==='resistance' == */
  if (clinical.event === "resistance") {
    pain = clinical.stopped ? 7 : 9;
    hr = clinical.stopped ? 104 : 116;
    rr = clinical.stopped ? 22 : 26;
    sys = 164;
    dia = 94;
  }

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: clinical.event==='vagal' == */
  if (clinical.event === "vagal") {
    hr = 48;
    rr = 18;
    sys = 86;
    dia = 52;
    pain = 5;
  }

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: clinical.event==='obstruction' == */
  if (clinical.event === "obstruction") {
    pain = Math.max(5, pain);
    hr = Math.max(100, hr);
  }

  /* == AQUÍ SE PREPARAN LOS VALORES a == */
  const a = dt === 0 ? 0 : 1 - Math.exp(-dt / 2);
  /* == AQUÍ SE RECORREN LOS ELEMENTOS O SE REPITE EL BLOQUE == */
  for (const [key, target] of Object.entries({ hr, rr, sys, dia, pain }))
    clinical[key] += (target - clinical[key]) * a;
  $("#v-hr").textContent = Math.round(clinical.hr);
  $("#v-rr").textContent = Math.round(clinical.rr);
  $("#v-bp").textContent =
    Math.round(clinical.sys) + "/" + Math.round(clinical.dia);
  $("#v-pain").textContent = Math.round(clinical.pain) + "/10";
  $("#v-drain").textContent = Math.round(clinical.drainage);
  $("#v-bladder").textContent =
    state.scenario === "trauma"
      ? "Sin estimar"
      : Math.round(clinical.initial - clinical.drainage) + " mL";
  $("#clinical-clock").textContent =
    String(Math.floor(clinical.elapsed / 60)).padStart(2, "0") +
    ":" +
    String(Math.floor(clinical.elapsed) % 60).padStart(2, "0");
  $("#patient-status").textContent = clinical.event
    ? incidentLabels[clinical.event]
    : relief > 0.75
      ? "Alivio progresivo del globo vesical"
      : state.scenario === "trauma"
        ? "Sospecha de lesión uretral"
        : "Retención urinaria · valoración continua";
  $("#patient-status").classList.toggle("incident", !!clinical.event);
  $("#clinical-monitor").classList.toggle("incident", !!clinical.event);
  $("#clinical-monitor").classList.toggle("frozen", clinical.paused || paused);
  $("#clinical-alert").hidden = !clinical.event;
  $("#clinical-alert-text").textContent = clinical.event
    ? {
        resistance:
          "El maniquí comunica dolor y el avance está bloqueado. Detén la maniobra, valora y solicita ayuda; no fuerces.",
        vagal:
          "El guion muestra bradicardia e hipotensión. Detén la maniobra, valora al paciente y solicita ayuda inmediata.",
        obstruction:
          "El flujo está interrumpido. Inspecciona el tubo y la posición del colector sin desconectar el sistema.",
        contamination:
          "Se perdió la esterilidad. Sustituye el material contaminado antes de continuar.",
      }[clinical.event]
    : "";

  /* == AQUÍ SE PREPARAN LOS VALORES message == */
  let message =
    state.scenario === "trauma"
      ? "Me duele desde el accidente."
      : relief > 0.75
        ? "La presión está disminuyendo. Me siento más aliviado."
        : state.insertion >= 82
          ? "Siento que empieza a disminuir la presión."
          : state.step === 7
            ? "Siento molestia; avance con suavidad."
            : clinical.reassured
              ? "Gracias por explicarme. Voy a intentar relajarme."
              : "Tengo presión y dolor en la parte baja del abdomen.";

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: clinical.event == */
  if (clinical.event)
    message = {
      resistance: clinical.stopped
        ? "Gracias por detenerse. Todavía me duele."
        : "¡Me duele! Siento mucha molestia.",
      vagal: "Me estoy mareando… me siento débil.",
      obstruction: "Sigo sintiendo presión.",
      contamination: "La práctica se pausa para recuperar la esterilidad.",
    }[clinical.event];
  sayClinical(message);
  $("#drainage-state").textContent =
    clinical.paused || paused
      ? "Evolución pausada"
      : clinical.event
        ? "Flujo detenido en este guion"
        : state.insertion < 82
          ? "Esperando acceso a la vejiga"
          : obstructed()
            ? "Revisar altura del colector"
            : relief >= 1
              ? "Drenaje del caso completado"
              : "Drenaje visible · tiempo abreviado";
  $("#reservoir-fill").style.height =
    (clinical.initial ? Math.max(0, (1 - relief) * 86) : 0) + "%";
  $("#collector-fill").style.height = relief * 86 + "%";
  $("#fluid-connection").classList.toggle(
    "flowing",
    clinicalFlow() && relief < 1,
  );
  $("#breathing-view").style.setProperty(
    "--breath-period",
    60 / clinical.rr + "s",
  );
  $("#breathing-view").classList.toggle("frozen", clinical.paused || paused);

  /* == AQUÍ SE RECORREN LOS ELEMENTOS O SE REPITE EL BLOQUE == */
  for (const e of document.querySelectorAll("[data-incident]")) {
    /* == AQUÍ SE PREPARAN LOS VALORES id == */
    const id = e.dataset.incident;
    e.disabled =
      busy ||
      clinical.paused ||
      !!clinical.event ||
      state.scenario === "trauma" ||
      (id === "resistance" && (state.step !== 7 || state.insertion >= 82)) ||
      (id === "vagal" && state.step < 7) ||
      (id === "obstruction" && state.insertion < 82) ||
      (id === "contamination" && (state.step < 4 || state.step > 6));
  }
  $("#clinical-resume").disabled =
    !clinical.event ||
    !clinical.assessed ||
    ((clinical.event === "resistance" || clinical.event === "vagal") &&
      (!clinical.stopped || !clinical.called));

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: clinical.event||clinical.paused == */
  if (clinical.event || clinical.paused) {
    /* == AQUÍ SE PREPARAN LOS VALORES slider == */
    const slider = $("#advance");
    /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: slider == */
    if (slider) slider.disabled = true;
    $("#next").disabled = true;
  }

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.recorded&&!clinical.announced.has('end') == */
  if (state.recorded && !clinical.announced.has("end")) {
    clinical.announced.add("end");
    recordClinical(
      "Registro completado. Volumen drenado simulado: " +
        Math.round(clinical.drainage) +
        " mL. Dolor: " +
        Math.round(clinical.pain) +
        "/10.",
    );
  }

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.insertion>=82&&!clinical.announced.has('urine') == */
  if (state.insertion >= 82 && !clinical.announced.has("urine")) {
    clinical.announced.add("urine");
    recordClinical(
      "Primer retorno de orina observado; falta confirmar la posición completa del balón.",
    );
  }

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.confirmed&&!clinical.announced.has('confirmed') == */
  if (state.confirmed && !clinical.announced.has("confirmed")) {
    clinical.announced.add("confirmed");
    recordClinical("Posición intravesical comprobada antes del inflado.");
  }

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.balloon&&!clinical.announced.has('balloon') == */
  if (state.balloon && !clinical.announced.has("balloon")) {
    clinical.announced.add("balloon");
    recordClinical("Balón inflado después de confirmar la posición.");
  }
  $("#clinical-summary").hidden = !state.recorded && state.traumaStep !== 3;
  $("#summary-text").textContent =
    state.scenario === "trauma"
      ? "Maniobra suspendida y valoración especializada solicitada."
      : state.done.length +
        " etapas · " +
        Math.round(clinical.drainage) +
        " mL drenados (guion) · dolor " +
        Math.round(clinical.pain) +
        "/10. Revisa la secuencia de decisiones en el registro.";
}

/* == AQUÍ SE VALIDA Y ACTIVA UNA INCIDENCIA DE CATETERISMO == */
function setIncident(id) {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: !incidentLabels[id]||clinical.event||busy||clinical.paused||state.scenario==='trauma' == */
  if (
    !incidentLabels[id] ||
    clinical.event ||
    busy ||
    clinical.paused ||
    state.scenario === "trauma"
  )
    return false;

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: id==='resistance'&&(state.step!==7||state.insertion>=82) == */
  if (id === "resistance" && (state.step !== 7 || state.insertion >= 82))
    return false;
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: id==='vagal'&&state.step<7 == */
  if (id === "vagal" && state.step < 7) return false;
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: id==='obstruction'&&state.insertion<82 == */
  if (id === "obstruction" && state.insertion < 82) return false;
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: id==='contamination'&&(state.step<4||state.step>6) == */
  if (id === "contamination" && (state.step < 4 || state.step > 6))
    return false;
  clinical.target = state.insertion;
  clinical.event = id;
  clinical.stopped = false;
  clinical.assessed = false;
  clinical.called = false;
  recordClinical("Docente activa: " + incidentLabels[id] + ".");
  updateClinical(0);
  return true;
}

/* == AQUÍ SE PROCESAN DETENER, VALORAR, PEDIR AYUDA Y REANUDAR == */
function handleClinical(action) {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: action==='reassure' == */
  if (action === "reassure") {
    clinical.reassured = true;
    recordClinical("Se explica el procedimiento y se acompaña al paciente.");
  }

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: action==='stop' == */
  if (action === "stop") {
    clinical.stopped = true;
    /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: busy&&!paused == */
    if (busy && !paused) $("#pause").click();
    recordClinical("Maniobra detenida.");
  }

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: action==='assess' == */
  if (action === "assess") {
    clinical.assessed = true;
    recordClinical(
      "Valoración del maniquí y revisión del monitor, dolor, sonda y drenaje.",
    );
  }

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: action==='call' == */
  if (action === "call") {
    clinical.called = true;
    recordClinical(
      "Solicitud de ayuda: comunicar situación, antecedentes, evaluación y recomendación.",
    );
  }

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: action==='resume'&&clinical.event == */
  if (action === "resume" && clinical.event) {
    /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: !clinical.assessed||(['resistance','vagal'].includes(clinical.event)&&(!clinical.stopped||!clinical. == */
    if (
      !clinical.assessed ||
      (["resistance", "vagal"].includes(clinical.event) &&
        (!clinical.stopped || !clinical.called))
    )
      return;

    /* == AQUÍ SE PREPARAN LOS VALORES old == */
    const old = clinical.event;
    clinical.event = null;
    recordClinical(
      old === "obstruction"
        ? "Acodamiento corregido y colector revisado en el guion."
        : old === "contamination"
          ? "Material contaminado sustituido en el guion."
          : "Docente finaliza la incidencia y autoriza continuar el caso simulado.",
    );
    /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: old==='obstruction' == */
    if (old === "obstruction") state.bag = 75;
    render();
  }
  updateClinical(0);
}

/* == AQUÍ SE DIBUJAN LAS CURVAS SIMULADAS DEL MONITOR en canvas == */
function traceMonitor() {
  /* == AQUÍ SE PREPARAN LOS VALORES canvas, ctx == */
  const canvas = $("#waveforms"),
    ctx = canvas.getContext("2d");
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: !ctx == */
  if (!ctx) return;
  /* == AQUÍ SE PREPARAN LOS VALORES w, h == */
  const w = canvas.width,
    h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#173d46";
  ctx.lineWidth = 1;
  /* == AQUÍ SE RECORREN LOS ELEMENTOS O SE REPITE EL BLOQUE == */
  for (let x = 0; x < w; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  /* == AQUÍ SE RECORREN LOS ELEMENTOS O SE REPITE EL BLOQUE == */
  for (let y = 0; y < h; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  /* == AQUÍ SE RECORREN LOS ELEMENTOS O SE REPITE EL BLOQUE == */
  for (let row = 0; row < 2; row++) {
    ctx.beginPath();
    ctx.strokeStyle = row ? "#69cafa" : "#63e2a5";
    ctx.lineWidth = 2;
    /* == AQUÍ SE RECORREN LOS ELEMENTOS O SE REPITE EL BLOQUE == */
    for (let x = 0; x < w; x++) {
      /* == AQUÍ SE PREPARAN LOS VALORES t == */
      const t = clinical.elapsed - (w - x) / 85;
      /* == AQUÍ SE PREPARAN LOS VALORES v == */
      let v;
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: row == */
      if (row) v = Math.sin(((t * clinical.rr) / 60) * Math.PI * 2) * 15;
      else {
        /* == AQUÍ SE PREPARAN LOS VALORES phase == */
        const phase = ((((t * clinical.hr) / 60) % 1) + 1) % 1;
        v =
          5 * Math.exp(-Math.pow((phase - 0.16) / 0.04, 2)) -
          9 * Math.exp(-Math.pow((phase - 0.36) / 0.017, 2)) +
          38 * Math.exp(-Math.pow((phase - 0.4) / 0.015, 2)) -
          15 * Math.exp(-Math.pow((phase - 0.44) / 0.022, 2)) +
          8 * Math.exp(-Math.pow((phase - 0.65) / 0.08, 2));
      }
      /* == AQUÍ SE PREPARAN LOS VALORES y == */
      const y = (row ? 106 : 47) - v;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
}

/* == AQUÍ SE PREPARAN LOS VALORES baseReset == */
const baseReset = reset;
reset = function (scenario = state.scenario) {
  baseReset(scenario);
  resetClinical();
};

/* == AQUÍ SE PREPARAN LOS VALORES baseAdvance == */
const baseAdvance = advance;
advance = function (value) {
  /* == AQUÍ SE PREPARAN LOS VALORES n == */
  const n = Number(value);
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: clinical.event||clinical.paused||busy||state.step!==7||done()||!Number.isFinite(n)||n<state.insertio == */
  if (
    clinical.event ||
    clinical.paused ||
    busy ||
    state.step !== 7 ||
    done() ||
    !Number.isFinite(n) ||
    n < state.insertion ||
    n > 100
  )
    return false;
  clinical.target = n;
  return true;
};

/* == AQUÍ SE PREPARAN LOS VALORES baseNavigate == */
const baseNavigate = navigate;
navigate = function (n) {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: clinical.event||clinical.paused == */
  if (clinical.event || clinical.paused) return false;
  return baseNavigate(n);
};

/* == AQUÍ SE PREPARAN LOS VALORES baseMaterial == */
const baseMaterial = useMaterial;
useMaterial = async function (id) {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: clinical.event||clinical.paused == */
  if (clinical.event || clinical.paused) {
    feedback(
      "Atiende la incidencia o reanuda el paciente antes de continuar.",
      true,
    );
    return false;
  }
  return baseMaterial(id);
};

/* == AQUÍ SE PREPARAN LOS VALORES baseAction == */
const baseAction = mainAction;
mainAction = async function () {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: clinical.event||clinical.paused == */
  if (clinical.event || clinical.paused) return;
  return baseAction();
};

/* == AQUÍ SE PREPARAN LOS VALORES baseReplay == */
const baseReplay = replay;
replay = async function () {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: clinical.event||clinical.paused == */
  if (clinical.event || clinical.paused) return;
  return baseReplay();
};

/* == AQUÍ SE CONECTA UN EVENTO DEL NAVEGADOR CON SU ACCIÓN == */
document.addEventListener("click", (e) => {
  /* == AQUÍ SE PREPARAN LOS VALORES trigger == */
  const trigger = e.target.closest("[data-incident]");
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: trigger == */
  if (trigger) setIncident(trigger.dataset.incident);
  /* == AQUÍ SE PREPARAN LOS VALORES action == */
  const action = e.target.closest("[data-clinical]");
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: action == */
  if (action) handleClinical(action.dataset.clinical);
});
$("#clinical-pause").onclick = () => {
  clinical.paused = !clinical.paused;
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: busy&&clinical.paused&&!paused == */
  if (busy && clinical.paused && !paused) $("#pause").click();
  $("#clinical-pause").textContent = clinical.paused
    ? "Reanudar paciente"
    : "Pausar paciente";
  $("#clinical-pause").setAttribute("aria-pressed", String(clinical.paused));
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: !clinical.paused == */
  if (!clinical.paused) {
    /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: busy&&paused == */
    if (busy && paused) $("#pause").click();
    renderGuide();
  }
  updateClinical(0);
};
$("#patient-audio").onclick = () => {
  clinical.voice = !clinical.voice;
  $("#patient-audio").textContent = clinical.voice
    ? "Voz activada"
    : "Activar voz";
  $("#patient-audio").setAttribute("aria-pressed", String(clinical.voice));
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: clinical.voice == */
  if (clinical.voice) {
    /* == AQUÍ SE PREPARAN LOS VALORES message == */
    const message = clinical.lastMessage;
    clinical.lastMessage = "";
    sayClinical(message);
  } else window.speechSynthesis?.cancel();
};

/* == AQUÍ SE COMPRUEBA LA CONDICIÓN: !('speechSynthesis' in window) == */
if (!("speechSynthesis" in window)) {
  $("#patient-audio").disabled = true;
  $("#patient-audio").textContent = "Voz no disponible";
}
$("#clinical-camera").onclick = () => {
  /* == AQUÍ SE PREPARAN LOS VALORES expanded == */
  const expanded = $("#breathing-view").classList.toggle("expanded");
  $("#clinical-camera").textContent = expanded
    ? "Reducir vista del maniquí"
    : "Ampliar vista del maniquí";
};

/* == AQUÍ SE CONECTA UN EVENTO DEL NAVEGADOR CON SU ACCIÓN == */
$("#stop").addEventListener("click", () => handleClinical("stop"));
resetClinical();
/* == AQUÍ SE PREPARAN LOS VALORES lastClinical == */
let lastClinical = null;
/* == AQUÍ SE ACTUALIZA EL RELOJ DE LA SIMULACIÓN CLÍNICA == */
function clinicalFrame(now) {
  /* == AQUÍ SE PREPARAN LOS VALORES dt == */
  const dt =
    lastClinical === null ? 0 : Math.min((now - lastClinical) / 1000, 0.1);
  lastClinical = now;
  updateClinical(dt);
  traceMonitor();
  /* == AQUÍ SE PROGRAMA EL SIGUIENTE CUADRO DE ANIMACIÓN == */
  requestAnimationFrame(clinicalFrame);
}
/* == AQUÍ SE PROGRAMA EL SIGUIENTE CUADRO DE ANIMACIÓN == */
requestAnimationFrame(clinicalFrame);
