"use strict";

/* == AQUÍ SE PREPARAN LOS VALORES $ == */
const $ = (selector) => document.querySelector(selector);

/* == AQUÍ SE PREPARAN LOS VALORES esc == */
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

/* == AQUÍ SE PREPARAN LOS VALORES ICONS == */
const ICONS = {
  catheter:
    '<path d="M12 48V22a12 12 0 0 1 24 0v16a7 7 0 0 0 14 0V12M8 48h8M45 12h10M12 37l-6 7"/>',
  syringe:
    '<path d="M13 43l24-24 9 9-24 24zM36 14l15 15M44 20l7-7M48 9l7 7M13 52l-6 6M22 36l5 5M28 30l5 5"/>',
  fix: '<rect x="8" y="22" width="46" height="22" rx="6"/><rect x="24" y="19" width="14" height="28" rx="3"/><path d="M31 8v11M31 47v9"/>',
};

/* == AQUÍ SE DEFINEN LOS MATERIALES DEL SIMULADOR == */
const MATERIALS = [
  { id: "rub", name: "Higiene de manos", sprite: 0 },
  { id: "gloves", name: "Guantes estériles", sprite: 2 },
  { id: "drape", name: "Campo estéril", sprite: 3 },
  { id: "swab", name: "Gasas y solución", sprite: 4 },
  { id: "gel", name: "Lubricante", sprite: 5 },
  { id: "catheter", name: "Sistema Foley", icon: "catheter" },
  { id: "syringe", name: "Jeringa / balón", icon: "syringe" },
  { id: "fix", name: "Fijador y soporte", icon: "fix" },
];

/* == AQUÍ SE DEFINE LA SECUENCIA DEL PROCEDIMIENTO == */
const STEPS = [
  {
    short: "Valoración",
    view: "room",
    title: "Empieza por la persona",
    instruction:
      "Empieza con el frasco de higiene de manos. Luego toca la ficha, identifica a la persona y explica el procedimiento.",
    why: "La retención está confirmada en este caso ficticio. La valoración y el consentimiento preceden al procedimiento.",
  },
  {
    short: "Posición",
    view: "position",
    title: "Prepara la posición",
    instruction:
      "Activa la preparación de la camilla y observa la posición del maniquí.",
    why: "Preserva intimidad, iluminación y comodidad. Realiza higiene perineal inicial si hace falta, con guantes limpios; retíralos antes de la nueva higiene de manos y fase estéril.",
  },
  {
    short: "Higiene",
    view: "hands",
    title: "Realiza higiene de manos",
    instruction:
      "Selecciona el frasco de higiene de manos en la bandeja para iniciar la animación.",
    why: "Fricción alcohólica de todas las superficies durante 20–30 segundos hasta secar. Si hay suciedad visible, usa agua y jabón. Cada movimiento se muestra durante 5 segundos a velocidad normal.",
  },
  {
    short: "Material",
    view: "materials",
    title: "Completa tu bandeja",
    instruction:
      "Selecciona los siete materiales restantes. Verifica integridad, caducidad, alergias y el dispositivo indicado.",
    why: "Separa la apertura de envoltorios de la manipulación estéril. El calibre se elige según la valoración clínica y el drenaje necesario.",
  },
  {
    short: "Campo",
    view: "field",
    title: "Establece la asepsia",
    instruction:
      "Repite higiene de manos; luego selecciona guantes estériles y campo, en ese orden.",
    why: "En el hospital se usa equipo estéril. Si un material se contamina, se sustituye.",
  },
  {
    short: "Antisepsia",
    view: "clean",
    title: "Limpia la zona indicada",
    instruction:
      "Selecciona las gasas para aplicar cada pasada. Observa la dirección y el cambio de gasa.",
    why: "La mano que mantiene la exposición deja de ser estéril y no toca el material. Usa la solución del protocolo, respetando secado y contacto.",
  },
  {
    short: "Lubricación",
    view: "lubricate",
    title: "Prepara la sonda",
    instruction:
      "Aplica el lubricante desde la bandeja. Después selecciona el sistema Foley para confirmar su preparación.",
    why: "Utiliza lubricante estéril hidrosoluble y revisa el dispositivo. Mantén el sistema de drenaje cerrado.",
  },
  {
    short: "Inserción",
    view: "anatomy",
    title: "Observa el recorrido",
    instruction:
      "Desliza para elegir hasta dónde avanzar: la sonda recorrerá el trayecto lentamente. Observa la punta, el balón y la respuesta del paciente.",
    why: "Avance suave, sin forzar. Dolor intenso, resistencia o sangrado requieren detenerse y pedir ayuda. El control no representa centímetros ni fuerza.",
  },
  {
    short: "Confirmación",
    view: "anatomy",
    title: "Comprueba antes de inflar",
    instruction:
      "Activa los dos puntos de comprobación en la guía y confirma la posición simulada.",
    why: "La orina puede aparecer antes de que el balón esté completamente en la vejiga. Confirma su posición antes del inflado.",
  },
  {
    short: "Balón",
    view: "anatomy",
    title: "Observa el balón intravesical",
    instruction:
      "Selecciona la jeringa. El balón se expandirá únicamente con la posición ya confirmada.",
    why: "Usa el líquido y volumen indicados por el fabricante. Dolor o resistencia al inflado obligan a parar y reevaluar.",
  },
  {
    short: "Drenaje",
    view: "drain",
    title: "Fija y sitúa el colector",
    instruction:
      "Selecciona el fijador. Baja la bolsa con el control hasta el soporte, por debajo de la vejiga.",
    why: "Evita tracción y acodamientos. Mantén la bolsa bajo la vejiga, sin tocar el suelo. En el hombre, recoloca el prepucio si se retrajo.",
  },
  {
    short: "Registro",
    view: "finish",
    title: "Termina el cuidado",
    instruction:
      "Selecciona higiene de manos para representar la retirada de guantes y el cierre. Después guarda el registro de práctica.",
    why: "Registra dispositivo, volumen del balón, orina observada y tolerancia. Reevalúa a diario la indicación y retira cuanto antes.",
  },
];

/* == AQUÍ SE PREPARAN LOS VALORES state, ticket, busy, paused, speed, progress, kind, pendingScenario == */
let state = fresh("male"),
  ticket = 0,
  busy = false,
  paused = false,
  speed = 1,
  progress = 0,
  kind = "",
  pendingScenario = null;

/* == AQUÍ SE DEFINE EL RECORRIDO DE TRAUMA == */
const TRAUMA = [
  {
    short: "Reconocer",
    title: "Reconoce la señal de alarma",
    detail:
      "Paciente simulado de 32 años: accidente de tránsito, posible fractura pélvica y sangre en el meato.",
    button: "Reconocer sospecha de lesión uretral",
  },
  {
    short: "Suspender",
    title: "Suspende la instrumentación",
    detail:
      "La sospecha de lesión uretral requiere valoración especializada antes de introducir una sonda. Deja la bandeja sin utilizar.",
    button: "Suspender el cateterismo",
  },
  {
    short: "Comunicar",
    title: "Solicita valoración especializada",
    detail:
      "Comunica al equipo el mecanismo del trauma y la sangre en el meato. Solicita evaluación de la uretra antes de cualquier instrumentación.",
    button: "Comunicar hallazgos y solicitar valoración",
  },
  {
    short: "Cierre",
    title: "Ruta de seguridad completada",
    detail:
      "Has reconocido el riesgo, suspendido la maniobra y solicitado evaluación en el caso simulado. Este es el cierre correcto de esta práctica.",
    button: "Practicar caso de retención urinaria",
  },
];

/* == AQUÍ SE DEFINE renderTraumaGuide: función auxiliar del módulo == */
function renderTraumaGuide() {
  /* == AQUÍ SE PREPARAN LOS VALORES t == */
  const t = TRAUMA[Math.min(state.traumaStep, 3)];
  $("#step-number").textContent =
    "PRÁCTICA 03 · " +
    (state.traumaStep < 3
      ? "ACCIÓN " + (state.traumaStep + 1) + " / 3"
      : "COMPLETADA");
  $("#step-title").textContent = t.title;
  $("#instruction").textContent = t.detail;
  $("#explanation").textContent =
    "Este caso entrena la decisión de detenerse y pedir ayuda. La inserción no forma parte de esta ruta.";
  $("#controls").innerHTML = "";
  $("#next").disabled = false;
  $("#next").textContent = t.button;
  $("#replay").disabled = true;
}

/* == AQUÍ SE AVANZA EN EL CASO DE SOSPECHA DE TRAUMA URETRAL == */
function advanceTrauma() {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.scenario!=='trauma' == */
  if (state.scenario !== "trauma") return;
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.traumaStep===3 == */
  if (state.traumaStep === 3) {
    reset("male");
    return;
  }
  state.traumaStep++;
  state.traumaStopped = state.traumaStep >= 2;
  render();
  caption(
    state.traumaStep === 3
      ? "Caso completado: valoración especializada solicitada."
      : "Acción registrada. Continúa con la siguiente decisión.",
  );
}

/* == AQUÍ SE GENERA EL ESTADO INICIAL DEL SIMULADOR == */
function fresh(scenario) {
  return {
    scenario,
    step: 0,
    unlocked: 0,
    initialHygiene: false,
    done: [],
    checks: [],
    prepared: [],
    field: 0,
    clean: 0,
    lubricated: false,
    system: false,
    insertion: 0,
    confirmed: false,
    balloon: 0,
    fixed: false,
    bag: 0,
    foreskin: false,
    finalHygiene: false,
    record: "",
    recorded: false,
    traumaStopped: false,
    traumaStep: 0,
  };
}

/* == AQUÍ SE DEFINE female: función auxiliar del módulo == */
function female() {
  return state.scenario === "female";
}

/* == AQUÍ SE DEFINE done: función auxiliar del módulo == */
function done() {
  return state.done.includes(state.step);
}

/* == AQUÍ SE DEFINE asset: función auxiliar del módulo == */
function asset(id, extra = "") {
  /* == AQUÍ SE PREPARAN LOS VALORES m == */
  const m = MATERIALS.find((x) => x.id === id);
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: !m == */
  if (!m) return "";
  return m.icon
    ? '<div class="asset icon-asset ' +
        extra +
        '" aria-hidden="true"><svg viewBox="0 0 64 64">' +
        ICONS[m.icon] +
        "</svg></div>"
    : '<div class="asset sprite-' +
        m.sprite +
        " " +
        extra +
        '" aria-hidden="true"></div>';
}

/* == AQUÍ SE DEFINE caption: función auxiliar del módulo == */
function caption(text) {
  $("#caption").textContent = text;
}

/* == AQUÍ SE DEFINE feedback: función auxiliar del módulo == */
function feedback(text, warn = false) {
  $("#feedback").innerHTML = text
    ? '<div class="feedback ' +
      (warn ? "warn" : "") +
      '">' +
      esc(text) +
      "</div>"
    : "";
}

/* == AQUÍ SE MARCA UNA ETAPA COMO COMPLETADA == */
function complete(message) {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: !done() == */
  if (!done()) state.done.push(state.step);
  state.unlocked = Math.max(state.unlocked, Math.min(11, state.step + 1));
  renderGuide();
  renderTimeline();
  renderTray();
  feedback(
    message || "Paso completado. Puedes repetir la animación o continuar.",
  );
  $("#stage-state").textContent = "✓ Paso completado";
}

/* == AQUÍ SE DEFINE check: función auxiliar del módulo == */
function check(label, id, checked = false) {
  return (
    '<label class="check-row"><input type="checkbox" data-check="' +
    id +
    '" ' +
    (checked ? "checked " : "") +
    (done() || busy ? "disabled" : "") +
    "><span>" +
    label +
    "</span></label>"
  );
}

/* == AQUÍ SE DEFINE action: función auxiliar del módulo == */
function action(label) {
  return (
    '<button class="action-button" id="action" ' +
    (busy ? "disabled" : "") +
    ">" +
    label +
    "</button>"
  );
}

/* == AQUÍ SE DEFINE activeMaterials: función auxiliar del módulo == */
function activeMaterials() {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: done()||state.scenario==='trauma' == */
  if (done() || state.scenario === "trauma") return [];
  return (
    {
      0: state.initialHygiene ? [] : ["rub"],
      1: [],
      2: ["rub"],
      3: MATERIALS.filter(
        (m) => m.id !== "rub" && !state.prepared.includes(m.id),
      ).map((m) => m.id),
      4: [["rub", "gloves", "drape"][state.field]].filter(Boolean),
      5: ["swab"],
      6: [!state.lubricated ? "gel" : "catheter"],
      7: ["catheter"],
      8: [],
      9: ["syringe"],
      10: state.fixed ? [] : ["fix"],
      11: state.finalHygiene ? [] : ["rub"],
    }[state.step] || []
  );
}

/* == AQUÍ SE PRESENTAN LOS MATERIALES DISPONIBLES == */
function renderTray() {
  /* == AQUÍ SE PREPARAN LOS VALORES active == */
  const active = activeMaterials();
  $("#tray").innerHTML = MATERIALS.map(
    (m) =>
      '<button class="material ' +
      (active.includes(m.id) ? "active " : "") +
      (state.prepared.includes(m.id) ? "used" : "") +
      '" data-material="' +
      m.id +
      '" draggable="' +
      active.includes(m.id) +
      '" aria-label="' +
      m.name +
      '" title="' +
      m.name +
      '" ' +
      (busy ? "disabled" : "") +
      ">" +
      asset(m.id) +
      "<span>" +
      m.name +
      "</span></button>",
  ).join("");
}

/* == AQUÍ SE ACTUALIZA LA SECUENCIA DE ETAPAS == */
function renderTimeline() {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.scenario==='trauma' == */
  if (state.scenario === "trauma") {
    $("#timeline").innerHTML = TRAUMA.map(
      (t, i) =>
        '<div class="step-link ' +
        (i === state.traumaStep ? "current " : "") +
        (i < state.traumaStep ? "done" : "") +
        '"><b>' +
        (i < state.traumaStep ? "✓" : i + 1) +
        "</b>" +
        t.short +
        "</div>",
    ).join("");
    $("#overall").textContent =
      Math.min(state.traumaStep, 3) + " / 3 acciones de seguridad";
    return;
  }
  $("#timeline").innerHTML = STEPS.map(
    (s, i) =>
      '<button class="step-link ' +
      (state.step === i ? "current " : "") +
      (state.done.includes(i) ? "done" : "") +
      '" data-step="' +
      i +
      '" ' +
      (i > state.unlocked || busy || state.scenario === "trauma"
        ? "disabled "
        : "") +
      (i === state.step ? 'aria-current="step"' : "") +
      "><b>" +
      (state.done.includes(i) ? "✓" : String(i + 1).padStart(2, "0")) +
      "</b>" +
      s.short +
      "</button>",
  ).join("");
  $("#overall").textContent =
    state.scenario === "trauma"
      ? "Ruta de seguridad"
      : state.done.length + " / 12 etapas completadas";
}

/* == AQUÍ SE ACTUALIZA LA GUÍA VISIBLE DE LA ETAPA == */
function renderGuide() {
  /* == AQUÍ SE PREPARAN LOS VALORES s == */
  const s = STEPS[state.step];
  $("#step-number").textContent =
    "PASO " + String(state.step + 1).padStart(2, "0") + " / 12";
  $("#step-title").textContent = s.title;
  $("#instruction").textContent = s.instruction;
  $("#explanation").textContent = s.why;
  $("#replay").disabled = busy;
  /* == AQUÍ SE PREPARAN LOS VALORES content == */
  let content = "";

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.scenario==='trauma' == */
  if (state.scenario === "trauma") {
    renderTraumaGuide();
    return;
  }

  /* == AQUÍ SE ELIGE EL COMPORTAMIENTO SEGÚN state.step == */
  switch (state.step) {
    case 0:
      content =
        check(
          "Dos identificadores y retención confirmada",
          "identity",
          state.checks.includes("identity"),
        ) +
        check(
          "Explicación, consentimiento y privacidad",
          "consent",
          state.checks.includes("consent"),
        ) +
        check(
          "Alergias y antecedentes revisados; sin sospecha de lesión uretral",
          "risk",
          state.checks.includes("risk"),
        ) +
        action(done() ? "Ver comprobaciones" : "Confirmar valoración");
      break;
    case 1:
      content =
        '<p class="control-hint">' +
        (female()
          ? "Decúbito supino; caderas y rodillas flexionadas, con separación cómoda."
          : "Decúbito supino; caderas en abducción cómoda.") +
        "</p>" +
        action("Preparar posición");
      break;
    case 2:
      content =
        '<p class="control-hint">Toca el frasco iluminado o arrástralo hacia las manos.</p>';
      break;
    case 3:
      content =
        '<p class="control-hint">' +
        state.prepared.length +
        " de 7 materiales preparados. No se asigna un calibre universal.</p>";
      break;
    case 4:
      content =
        '<p class="control-hint">' +
        [
          "1. Higiene antes de guantes.",
          "2. Guantes estériles.",
          "3. Despliegue del campo.",
          "Campo preparado.",
        ][state.field] +
        "</p>";
      break;
    case 5:
      content =
        '<p class="control-hint">' +
        (female()
          ? "Pasadas de anterior a posterior: un lado, otro lado y el centro."
          : "Movimiento desde el meato hacia afuera. Cada aplicación usa material nuevo.") +
        "<br>Aplicaciones representadas: " +
        state.clean +
        "/3. Tiempos y repeticiones según protocolo local.</p>";
      break;
    case 6:
      content =
        '<p class="control-hint">' +
        (state.lubricated
          ? "✓ Lubricante aplicado."
          : "1. Lubricante estéril.") +
        "<br>" +
        (state.system
          ? "✓ Sistema cerrado preparado."
          : "2. Sistema Foley y colector.") +
        "</p>";
      break;
    case 7:
      content =
        '<label class="record-label" for="advance">Destino del avance lento · sin escala</label><input id="advance" type="range" min="0" max="100" value="' +
        state.insertion +
        '" ' +
        (done() || busy ? "disabled" : "") +
        '><div class="range-label"><span>Meato</span><span>Vejiga</span></div><p class="control-hint">Sin escala. ' +
        (female()
          ? "Tras ver orina, el avance adicional sigue la técnica y el dispositivo."
          : "En el hombre se avanza hasta la bifurcación según la técnica, antes de inflar.") +
        "</p>";
      break;
    case 8:
      content =
        check(
          "Retorno de orina observado",
          "urine",
          state.checks.includes("urine"),
        ) +
        check(
          "Zona del balón completamente intravesical",
          "position",
          state.checks.includes("position"),
        ) +
        action("Confirmar posición");
      break;
    case 9:
      content =
        '<p class="control-hint">El tamaño animado es ilustrativo; no representa un volumen.</p>';
      break;
    case 10:
      content =
        '<label class="record-label" for="bag-position">Altura de la bolsa</label><input id="bag-position" type="range" min="0" max="100" value="' +
        state.bag +
        '" ' +
        (busy || done() ? "disabled" : "") +
        '><div class="range-label"><span>Alta</span><span>Soporte bajo</span></div>' +
        (!female()
          ? check(
              "Prepucio recolocado si se retrajo",
              "foreskin",
              state.foreskin,
            )
          : "") +
        '<p class="control-hint">' +
        (state.fixed
          ? "✓ Fijación realizada."
          : "Selecciona el fijador de la bandeja.") +
        " La bolsa no debe tocar el suelo.</p>";
      break;
    case 11:
      content =
        '<label class="record-label" for="record">Nota de práctica (opcional)</label><textarea class="text-field" id="record" rows="2" placeholder="Lo que observaste en la simulación" ' +
        (state.recorded ? "readonly" : "") +
        ">" +
        esc(state.record) +
        '</textarea><p class="control-hint">Solo en este intento; no introduzcas datos de pacientes.</p>' +
        action(state.recorded ? "Ver cierre" : "Registrar práctica");
      break;
  }

  /* == AQUÍ SE PREPARAN LOS VALORES active == */
  const active = activeMaterials();
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: active.length===1 == */
  if (active.length === 1)
    content =
      '<button class="action-button material-action" data-material="' +
      active[0] +
      '" ' +
      (busy ? "disabled" : "") +
      ">" +
      {
        rub: "Iniciar higiene de manos · 30 s",
        gloves: "Colocar guantes · observar",
        drape: "Desplegar campo · observar",
        swab: "Aplicar una nueva gasa",
        gel: "Aplicar lubricante",
        catheter:
          state.step === 7 ? "Ver control de avance" : "Preparar sistema Foley",
        syringe: "Observar inflado del balón",
        fix: "Colocar fijación",
      }[active[0]] +
      "</button>" +
      content;
  $("#controls").innerHTML = content;
  $("#next").disabled = !done() || busy || state.step === 11;
  $("#next").textContent =
    state.step === 11
      ? state.recorded
        ? "Práctica completada"
        : "Completa el cierre"
      : "Siguiente paso →";
}

/* == AQUÍ SE PREPARAN LOS VALORES CAPTIONS == */
const CAPTIONS = [
  "Toca la ficha o completa las comprobaciones de la guía.",
  "Observa la posición y protege la privacidad.",
  "Selecciona higiene de manos en la bandeja.",
  "Toca cada material para llevarlo a la bandeja de trabajo.",
  "Higiene → guantes estériles → campo.",
  "Cada pasada utiliza una gasa nueva.",
  "Lubricante estéril y sistema de drenaje cerrado.",
  "Desliza para ver el avance: no representa profundidad real.",
  "Retorno de orina y balón completamente en la vejiga.",
  "El balón se infla después de confirmar la posición.",
  "Fija la sonda y coloca la bolsa en el soporte bajo.",
  "Retirada de guantes, higiene y registro.",
];

/* == AQUÍ SE REFRESCA LA INTERFAZ DEL SIMULADOR == */
function render() {
  /* == AQUÍ SE PREPARAN LOS VALORES s == */
  const s = STEPS[state.step];
  $("#stage").classList.toggle(
    "focus",
    s.view !== "room" && s.view !== "finish" && state.scenario !== "trauma",
  );
  $("#view-badge").textContent =
    state.scenario === "trauma"
      ? "ALERTA CLÍNICA"
      : {
          room: "VISTA GENERAL",
          position: "POSICIÓN · ESQUEMA",
          hands: "HIGIENE DE MANOS",
          materials: "PREPARACIÓN",
          field: "ÁREA ESTÉRIL",
          clean: "ANTISEPSIA · ESQUEMA",
          lubricate: "SISTEMA FOLEY",
          anatomy: "RECORRIDO FUNCIONAL · SIN ESCALA",
          drain: "DRENAJE · ESQUEMA",
          finish: "CIERRE DE LA PRÁCTICA",
        }[s.view];
  $("#camera-name").textContent =
    s.view === "room" ? "Sala de simulación" : s.short;
  $("#stage-state").textContent = done()
    ? "✓ Paso completado"
    : "Realiza la acción indicada";
  renderGuide();
  renderTray();
  renderTimeline();
  renderScene();
  caption(
    state.scenario === "trauma"
      ? state.traumaStopped
        ? "Maniobra suspendida. Evaluación solicitada."
        : "No introducir una sonda ante sospecha de lesión uretral."
      : CAPTIONS[state.step],
  );
}

/* == AQUÍ SE DEFINE diagram: función auxiliar del módulo == */
function diagram(inner) {
  return (
    '<svg class="diagram" viewBox="0 0 800 480" role="img" aria-label="' +
    esc(STEPS[state.step].title) +
    ': esquema educativo">' +
    inner +
    "</svg>"
  );
}

/* == AQUÍ SE DIBUJA LA ESCENA DEL PROCEDIMIENTO según su etapa y progreso == */
function renderScene(p = progress, k = kind) {
  /* == AQUÍ SE PREPARAN LOS VALORES step == */
  const step = state.step;
  /* == AQUÍ SE PREPARAN LOS VALORES html == */
  let html = "";

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.scenario==='trauma' == */
  if (state.scenario === "trauma") {
    /* == AQUÍ SE PREPARAN LOS VALORES t == */
    const t = TRAUMA[Math.min(state.traumaStep, 3)];
    html =
      '<div class="alert-band"><p class="eyebrow">CASO 03 · RUTA DE SEGURIDAD</p><h3>' +
      t.title +
      "</h3><p>" +
      t.detail +
      '</p><button class="secondary" data-trauma>' +
      t.button +
      "</button></div>";
  } else if (step === 0 && k !== "hands") {
    html =
      '<div class="clinic-card"><small>FICHA DEL PACIENTE</small><h3>' +
      (female() ? "Mujer · 54 años" : "Hombre · 68 años") +
      "</h3><p>" +
      (female()
        ? "Retención posoperatoria confirmada."
        : "Retención aguda confirmada por ecografía.") +
      '</p><p>Sin trauma uretral conocido.<br>El equipo indica drenaje.</p></div><button class="hotspot patient-hotspot" data-scene-action="patient">Revisar paciente</button>' +
      (done() || (k === "assess" && p > 0.5)
        ? '<div class="stamp">✓ Valoración completada</div>'
        : "");
  } else if (step === 1 && k !== "hands") {
    /* == AQUÍ SE PREPARAN LOS VALORES t, spread == */
    const t = k === "position" ? p : done() ? 1 : 0,
      spread = 22 + 38 * t;
    html = diagram(
      '<rect x="235" y="83" width="330" height="310" rx="35" fill="#fff" stroke="#c3d5db" stroke-width="3"/><rect x="288" y="91" width="224" height="62" rx="18" fill="#edf5f7"/><circle cx="400" cy="131" r="26" fill="#e5c7b7" stroke="#bda394" stroke-width="2"/><path d="M371 176h58l13 100h-84z" fill="#99c5cd" stroke="#7097a2" stroke-width="2"/><path d="M365 186l-23 64M435 186l23 64" stroke="#e0beac" stroke-width="15" stroke-linecap="round"/><path d="M380 280L' +
        (380 - spread) +
        " " +
        (female() ? 310 : 335) +
        "L" +
        (373 - spread) +
        " 363M420 280L" +
        (420 + spread) +
        " " +
        (female() ? 310 : 335) +
        "L" +
        (427 + spread) +
        ' 363" fill="none" stroke="#dbbba9" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/><path d="M344 219h112v63H344z" fill="#5aabb5" opacity="' +
        (0.35 + 0.6 * t) +
        '"/><path class="label-line" d="M448 224H608"/><text x="614" y="230">Privacidad</text><path class="label-line" d="M340 324H175"/><text x="50" y="312">' +
        (female() ? "Rodillas flexionadas" : "Posición supina") +
        '</text><text x="50" y="335">Separación cómoda</text><text x="310" y="416" class="small-text">Vista superior simplificada</text>',
    );
  } else if (step === 2 || k === "hands") {
    /* == AQUÍ SE PREPARAN LOS VALORES t == */
    const t = k === "hands" ? p : 0;
    html =
      '<div class="asset sprite-0 action-sprite" style="left:' +
      (23 + Math.min(t * 4, 1) * 8) +
      "%;transform:translate(-50%,-50%) rotate(" +
      -Math.sin(t * Math.PI) * 18 +
      'deg)"></div><div class="asset hygiene-sprite sprite-' +
      Math.min(5, Math.floor(t * 6)) +
      ' hands-center" style="transform:translate(-50%,-50%) rotate(' +
      (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        ? 0
        : Math.sin(t * Math.PI * 16) * 9) +
      "deg) scale(" +
      (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        ? 1
        : 1 + Math.sin(t * Math.PI * 8) * 0.035) +
      ')"></div><div class="scene-tag right">' +
      (k === "hands"
        ? [
            "Palmas",
            "Dorso · ambas manos",
            "Dedos entrelazados",
            "Dorso de los dedos",
            "Pulgares · ambos",
            "Yemas · ambas manos",
          ][Math.min(5, Math.floor(t * 6))]
        : "Fricción de todas las superficies") +
      "</div>";
  } else if (step === 3) {
    html =
      '<div class="tray-preview">' +
      MATERIALS.filter((m) => m.id !== "rub")
        .map(
          (m) =>
            '<div class="tray-slot ' +
            (state.prepared.includes(m.id) ? "filled" : "") +
            '">' +
            (state.prepared.includes(m.id) ? asset(m.id) : "<span>＋</span>") +
            "<span>" +
            m.name +
            "</span></div>",
        )
        .join("") +
      '<div class="tray-slot filled"><span>✓</span><span>Envases íntegros</span></div></div>';
  } else if (step === 4) {
    /* == AQUÍ SE PREPARAN LOS VALORES gloves, drape == */
    const gloves = state.field >= 2 || k === "gloves",
      drape = state.field >= 3 || k === "drape";
    html =
      '<div class="sterile-zone" style="opacity:' +
      (drape ? 1 : 0.5) +
      '">' +
      (gloves ? asset("gloves") : "") +
      (drape ? asset("drape") : "") +
      '</div><span class="zone-title">' +
      (drape
        ? "Campo desplegado · límites protegidos"
        : "Área de trabajo preparada") +
      "</span>" +
      (["gloves", "drape"].includes(k)
        ? '<div class="asset sprite-' +
          (k === "gloves" ? 2 : 3) +
          ' action-sprite" style="left:' +
          (15 + p * 40) +
          "%;top:" +
          (65 - p * 22) +
          "%;opacity:" +
          (p > 0.8 ? (1 - p) * 5 : 1) +
          ";transform:translate(-50%,-50%) scale(" +
          (1 + p * 0.5) +
          ')"></div>'
        : "") +
      '<div class="scene-tag right">' +
      (gloves ? "Guantes estériles colocados" : "Renovar higiene de manos") +
      "</div>";
  } else if (step === 5) {
    /* == AQUÍ SE PREPARAN LOS VALORES x, y == */
    let x, y;
    /* == AQUÍ SE PREPARAN LOS VALORES pass == */
    const pass = Math.min(state.clean, 2);
    /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: female() == */
    if (female()) {
      x = [344, 456, 400][pass];
      y = 172 + p * 115;
    } else {
      /* == AQUÍ SE PREPARAN LOS VALORES a == */
      const a = p * Math.PI * 2;
      x = 400 + Math.sin(a) * (12 + p * 55);
      y = 228 - Math.cos(a) * (12 + p * 55);
    }
    html =
      diagram(
        '<rect x="238" y="92" width="324" height="287" rx="35" fill="#a7d5d6" stroke="#64a6ad" stroke-width="2"/>' +
          (female()
            ? '<ellipse cx="400" cy="235" rx="71" ry="113" fill="#f6e4dc" stroke="#c9a59b" stroke-width="2"/><path d="M372 160Q341 240 379 318M428 160Q459 240 421 318" fill="none" stroke="#d49f94" stroke-width="5"/><circle cx="400" cy="164" r="6" fill="#d2a392"/><ellipse cx="400" cy="215" rx="5" ry="10" fill="#8d625d"/><ellipse cx="400" cy="274" rx="14" ry="23" fill="#dfb7aa" stroke="#ae8177"/><path class="label-line" d="M409 215H610M418 274H610"/><text x="616" y="220">Meato uretral</text><text x="616" y="280">Orificio vaginal</text>'
            : '<ellipse cx="400" cy="225" rx="83" ry="95" fill="#f2d8cd" stroke="#c99889" stroke-width="2"/><path d="M400 202v42" stroke="#9d6d64" stroke-width="6" stroke-linecap="round"/><path class="label-line" d="M409 224H605"/><text x="611" y="230">Meato uretral</text>') +
          (k === "clean"
            ? '<circle cx="' +
              x +
              '" cy="' +
              y +
              '" r="24" fill="#c4ad6050"/><svg x="' +
              (x - 15) +
              '" y="' +
              (y - 15) +
              '" width="110" height="110" viewBox="512 512 512 512"><image href="assets/materials.png" width="1536" height="1024"/></svg>'
            : "") +
          '<text x="270" y="405" class="small-text">Esquema topográfico · no está a escala</text>',
      ) +
      '<div class="key-callout"><strong>Mano no dominante</strong><br>' +
      (female()
        ? "Mantiene los labios separados."
        : "Sujeta el pene; retrae el prepucio si existe.") +
      "<br>No toca el material estéril.</div>";
  } else if (step === 6) {
    /* == AQUÍ SE PREPARAN LOS VALORES gel == */
    const gel = state.lubricated ? 1 : k === "gel" ? p : 0;
    html =
      diagram(
        '<path d="M220 256H530Q575 256 575 302V342" fill="none" stroke="#d1a756" stroke-width="15" stroke-linecap="round"/><path d="M220 256H' +
          (220 + 145 * gel) +
          '" fill="none" stroke="#8bc8d9" stroke-width="22" opacity=".65" stroke-linecap="round"/><circle cx="230" cy="254" r="3" fill="#8a682f"/><path class="label-line" d="M284 241V194H180"/><text x="71" y="185">Lubricante</text><text x="71" y="205">hidrosoluble</text><text x="334" y="302">Sonda Foley</text>' +
          (state.system || k === "system"
            ? '<path d="M575 342h62v-67" fill="none" stroke="#aac7ce" stroke-width="9"/><rect x="602" y="203" width="72" height="72" rx="10" fill="#e5f2f3" stroke="#9bbbc4" stroke-width="3"/><text x="554" y="180" class="small-text">Sistema cerrado</text>'
            : ""),
      ) +
      '<div class="asset sprite-5 action-sprite" style="left:' +
      (35 + (k === "gel" ? p * 12 : 0)) +
      '%;top:31%;width:110px"></div>';
  } else if (step >= 7 && step <= 10) html = anatomy(p, k);
  else if (step === 11) {
    html =
      '<div class="result-panel"><p class="eyebrow">' +
      (state.recorded ? "PRÁCTICA COMPLETADA" : "CIERRE DEL PROCEDIMIENTO") +
      "</p><h3>" +
      (state.recorded
        ? "Recorriste toda la secuencia."
        : "Confort, higiene y registro.") +
      "</h3><p>" +
      (state.recorded
        ? "Puedes volver a una etapa para observarla de nuevo. No hay nota ni examen."
        : "Representa la retirada de guantes y la higiene final. Después registra tu observación.") +
      '</p><div class="mini-log">' +
      state.done.map((n) => "<span>✓ " + STEPS[n].short + "</span>").join("") +
      "</div></div>";
  }
  $("#scene").innerHTML = html;
}

/* == AQUÍ SE DEFINE anatomy: función auxiliar del módulo == */
function anatomy(p, k) {
  /* == AQUÍ SE PREPARAN LOS VALORES step == */
  const step = state.step;
  /* == AQUÍ SE PREPARAN LOS VALORES t == */
  const t = (step > 7 ? 100 : state.insertion) / 100;
  /* == AQUÍ SE PREPARAN LOS VALORES balloon == */
  const balloon =
    step > 9 ? 1 : step === 9 ? (k === "balloon" ? p : state.balloon) : 0;
  /* == AQUÍ SE PREPARAN LOS VALORES returned == */
  const returned = t >= 0.82;
  /* == AQUÍ SE PREPARAN LOS VALORES by == */
  const by = 175 + state.bag * 1.8;
  /* == AQUÍ SE PREPARAN LOS VALORES path == */
  const path = female()
    ? "M290 361 Q380 361 400 293 L400 166"
    : "M244 341 C278 348 300 353 323 334 C345 313 372 344 388 304 C400 278 400 226 400 166";

  /* == AQUÍ SE PREPARAN LOS VALORES inner == */
  let inner =
    '<path d="M400 248C392 228 301 237 304 159C307 88 496 88 499 159C502 237 408 228 400 248Z" fill="#f3dfae" stroke="#c09177" stroke-width="5"/><path d="M317 120Q294 92 287 77M485 120Q506 92 513 77" fill="none" stroke="#cfad94" stroke-width="8"/>';
  // The urethral channel ends at the bladder neck; the catheter continues inside the cavity.

  /* == AQUÍ SE PREPARAN LOS VALORES tract == */
  const tract = female()
    ? "M290 361Q380 361 400 293V242"
    : "M244 341C278 348 300 353 323 334C345 313 372 344 388 304C400 278 400 256 400 242";
  inner +=
    '<path d="' +
    tract +
    '" fill="none" stroke="#cca697" stroke-width="30" stroke-linecap="round"/><path d="' +
    tract +
    '" fill="none" stroke="#f8ebe4" stroke-width="23" stroke-linecap="round"/><path d="' +
    path +
    '" fill="none" stroke="#d1a647" stroke-width="10" stroke-linecap="round" pathLength="100" stroke-dasharray="' +
    t * 100 +
    ' 100"/><path d="' +
    path +
    '" fill="none" stroke="#f7d681" stroke-width="3" stroke-linecap="round" pathLength="100" stroke-dasharray="' +
    t * 100 +
    ' 100"/>';
  // Fluid is shown only on the segment already traversed, never ahead of the catheter tip.

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: returned == */
  if (returned)
    inner +=
      '<path d="' +
      path +
      '" fill="none" stroke="#ac882d" stroke-width="3" pathLength="100" stroke-dasharray="' +
      t * 100 +
      ' 100" opacity=".65"/>';

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: t===1 == */
  if (t === 1)
    inner +=
      '<ellipse cx="400" cy="190" rx="' +
      (6 + balloon * 24) +
      '" ry="' +
      (6 + balloon * 11) +
      '" fill="' +
      (balloon ? "#9ecad9" : "#f9d27d") +
      '" fill-opacity=".92" stroke="' +
      (balloon ? "#5e9aa9" : "#bd9143") +
      '" stroke-width="2"/><circle cx="400" cy="169" r="3" fill="#8c6e2a"/>';
  inner +=
    '<path class="label-line" d="M494 154H587"/><text x="593" y="160">Vejiga</text><path class="label-line" d="M415 269H486"/><text x="492" y="275">Uretra</text><text x="' +
    (female() ? 223 : 186) +
    '" y="389">Meato</text>';

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: t===1 == */
  if (t === 1)
    inner +=
      '<path class="label-line" d="M375 191H210"/><text x="80" y="184" class="strong-text">' +
      (balloon ? "Balón intravesical" : "Zona del balón") +
      '</text><text x="80" y="205" class="small-text">' +
      (balloon ? "Representación sin volumen" : "Todavía sin inflar") +
      "</text>";

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: step===8&&state.confirmed == */
  if (step === 8 && state.confirmed)
    inner +=
      '<circle cx="400" cy="190" r="45" fill="none" stroke="#35987b" stroke-width="2" opacity="' +
      (k === "confirm" ? p : 1) +
      '"/><text x="80" y="240">✓ Posición confirmada</text>';

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: step===10 == */
  if (step === 10) {
    /* == AQUÍ SE PREPARAN LOS VALORES drain == */
    const drain =
      "M" +
      (female() ? 290 : 244) +
      " " +
      (female() ? 361 : 341) +
      " Q193 350 193 282H547Q590 282 590 " +
      (by + 16) +
      "H643";
    inner +=
      '<path d="' +
      drain +
      '" fill="none" stroke="#95b7c5" stroke-width="9"/><path d="' +
      drain +
      '" fill="none" stroke="#d9b549" stroke-width="3" stroke-dasharray="6 12" class="flow-dash"/><line x1="540" y1="238" x2="764" y2="238" stroke="#a4b9bf" stroke-dasharray="4 6"/><text x="582" y="225" class="small-text">Nivel de vejiga</text><rect x="611" y="' +
      by +
      '" width="85" height="86" rx="12" fill="#e4f3f8" stroke="' +
      (state.bag >= 65 ? "#408f79" : "#b49364") +
      '" stroke-width="3"/><rect x="617" y="' +
      (by + 47) +
      '" width="73" height="31" rx="6" fill="#e3c369" opacity=".65"/><path d="M653 ' +
      (by + 86) +
      'v10" stroke="#9ab8c4" stroke-width="5"/><text x="621" y="' +
      (by + 32) +
      '" class="small-text">Colector</text>';
    /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.fixed||k==='fix' == */
    if (state.fixed || k === "fix")
      inner +=
        '<rect x="173" y="268" width="46" height="31" rx="6" fill="#eff6ee" stroke="#61907a" stroke-width="2" opacity="' +
        (k === "fix" ? p : 1) +
        '"/><path d="M194 268v31" stroke="#456858" stroke-width="3" opacity="' +
        (k === "fix" ? p : 1) +
        '"/>';
  }

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: returned&&step<10 == */
  if (returned && step < 10) {
    /* == AQUÍ SE PREPARAN LOS VALORES output == */
    const output =
      "M" +
      (female() ? 290 : 244) +
      " " +
      (female() ? 361 : 341) +
      "Q184 373 126 331";
    inner +=
      '<path d="' +
      output +
      '" fill="none" stroke="#94b8c2" stroke-width="10"/><path d="' +
      output +
      '" fill="none" stroke="#d6ad35" stroke-width="4" stroke-dasharray="5 9" class="flow-dash"/><rect x="87" y="325" width="66" height="70" rx="9" fill="#e0f0f1" stroke="#94b8c2" stroke-width="2"/><rect x="93" y="361" width="54" height="26" rx="5" fill="#ecd174"/><text x="60" y="418" class="small-text">Sistema cerrado</text>';
  }

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: step===9 == */
  if (step === 9) {
    inner +=
      '<g transform="translate(556 310)"><rect x="0" y="0" width="90" height="26" rx="3" fill="#f9ffff" stroke="#82a7b7" stroke-width="2"/><path d="M90 13h25" stroke="#82a7b7" stroke-width="3"/><path d="M' +
      (-30 + (k === "balloon" ? p : state.balloon) * 60) +
      " 13h45M" +
      (-30 + (k === "balloon" ? p : state.balloon) * 60) +
      ' 2v22" stroke="#428195" stroke-width="4"/><text x="-10" y="55" class="small-text">Vía del balón · sin aguja</text></g>';
  }
  inner +=
    '<text x="288" y="454" class="small-text">' +
    (female() ? "Vía femenina" : "Vía masculina") +
    " · recorrido simplificado</text>";
  return (
    diagram(inner) +
    (returned && step < 10
      ? '<div class="scene-tag right" style="top:68%">Retorno de orina observado</div>'
      : "")
  );
}

/* == AQUÍ SE PREPARAN LOS VALORES hygieneImage == */
const hygieneImage = new Image();
hygieneImage.src = "assets/hygiene.png";

/* == AQUÍ SE PREPARAN LOS VALORES hygieneReady == */
const hygieneReady = hygieneImage
  .decode()
  .then(() => true)
  .catch(() => false);

/* == AQUÍ SE NOMBRAN LOS MOVIMIENTOS DE HIGIENE == */
const HANDS = [
  "Palma contra palma",
  "Palma sobre el dorso: repetir en ambas manos",
  "Palmas con los dedos entrelazados",
  "Dorso de los dedos contra la palma opuesta",
  "Rodear y frotar cada pulgar",
  "Frotar las yemas en la palma opuesta",
];

/* == AQUÍ SE REPRODUCE LA ANIMACIÓN: duración, pausa y avance de cuadros == */
async function animate(animation, duration = 2400, frameCallback = null) {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: busy == */
  if (busy) return false;
  duration = animation === "hands" ? 10000 : Math.max(duration, 8000);
  /* == AQUÍ SE PREPARAN LOS VALORES mine == */
  const mine = ++ticket;
  busy = true;
  paused = false;
  kind = animation;
  progress = 0;
  $("#stage").classList.remove("paused");
  $("#pause").disabled = false;
  $("#pause").textContent = "Pausar";
  $("#pause").setAttribute("aria-label", "Pausar animación");
  renderGuide();
  renderTray();
  renderTimeline();
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: animation==='hands' == */
  if (animation === "hands") {
    caption("Preparando demostración de higiene…");
    /* == AQUÍ SE PREPARAN LOS VALORES ready == */
    const ready = await hygieneReady;
    /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: mine!==ticket == */
    if (mine !== ticket) return false;
    /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: !ready == */
    if (!ready) {
      busy = false;
      $("#pause").disabled = true;
      feedback(
        "No se pudo cargar la imagen. Recarga la página para volver a intentarlo.",
        true,
      );
      renderGuide();
      renderTray();
      renderTimeline();
      return false;
    }
    $("#stage").classList.add("focus");
    $("#view-badge").textContent = "HIGIENE DE MANOS · 6 MOVIMIENTOS";
  }
  renderScene(0, animation);
  return new Promise((resolve) => {
    /* == AQUÍ SE PREPARAN LOS VALORES last, elapsed == */
    let last = null,
      elapsed = 0;
    /* == AQUÍ SE ACTUALIZA UN CUADRO DE LA ANIMACIÓN == */
    function frame(now) {
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: mine!==ticket == */
      if (mine !== ticket) {
        resolve(false);
        return;
      }
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: last!==null&&!paused == */
      if (last !== null && !paused)
        elapsed +=
          Math.min(now - last, 100) * (animation === "hands" ? 1 : speed);
      last = now;
      progress = Math.min(elapsed / duration, 1);
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: frameCallback == */
      if (frameCallback) frameCallback(progress);
      renderScene(progress, animation);
      $("#animation-progress").style.width = progress * 100 + "%";
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: animation==='hands' == */
      if (animation === "hands")
        caption(
          "Movimiento " +
            (Math.min(5, Math.floor(progress * 6)) + 1) +
            "/6 · " +
            HANDS[Math.min(5, Math.floor(progress * 6))] +
            " · " +
            Math.min(30, Math.floor(progress * 30)) +
            "/30 s de técnica · reproducción de 10 s",
        );
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: progress<1 == */
      if (progress < 1) requestAnimationFrame(frame);
      else {
        busy = false;
        $("#pause").disabled = true;
        renderGuide();
        renderTray();
        renderTimeline();
        resolve(true);
      }
    }
    /* == AQUÍ SE PROGRAMA EL SIGUIENTE CUADRO DE ANIMACIÓN == */
    requestAnimationFrame(frame);
  });
}

/* == AQUÍ SE CAMBIA A UNA ETAPA DESBLOQUEADA == */
function navigate(n) {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: busy||!Number.isInteger(n)||n<0||n>state.unlocked||n>11||state.scenario==='trauma' == */
  if (
    busy ||
    !Number.isInteger(n) ||
    n < 0 ||
    n > state.unlocked ||
    n > 11 ||
    state.scenario === "trauma"
  )
    return false;
  state.step = n;
  kind = "";
  progress = 0;
  $("#animation-progress").style.width = "0%";
  feedback("");
  render();
  return true;
}

/* == AQUÍ SE REINICIA EL INTENTO y se limpian sus respuestas y progreso == */
function reset(scenario = state.scenario) {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: !['male','female','trauma'].includes(scenario) == */
  if (!["male", "female", "trauma"].includes(scenario))
    throw Error("Escenario no válido");
  ticket++;
  busy = false;
  paused = false;
  kind = "";
  progress = 0;
  state = fresh(scenario);
  $("#scenario").value = scenario;
  $("#pause").disabled = true;
  $("#pause").textContent = "Ⅱ";
  $("#stage").classList.remove("paused");
  $("#animation-progress").style.width = "0%";
  feedback("");
  render();
}

/* == AQUÍ SE UTILIZA UN MATERIAL y se comprueba que corresponde a la etapa == */
async function useMaterial(id) {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: busy||state.scenario==='trauma' == */
  if (busy || state.scenario === "trauma") return false;
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: done() == */
  if (done()) {
    feedback(
      "Este paso ya está completo. Usa “Repetir animación” para observarlo de nuevo.",
    );
    return false;
  }
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: !activeMaterials().includes(id) == */
  if (!activeMaterials().includes(id)) {
    feedback(
      "Ese material no corresponde todavía. Sigue la acción indicada en la guía.",
      true,
    );
    return false;
  }
  feedback("");

  /* == AQUÍ SE ELIGE EL COMPORTAMIENTO SEGÚN state.step == */
  switch (state.step) {
    case 0:
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: await animate('hands',4200) == */
      if (await animate("hands", 4200)) {
        state.initialHygiene = true;
        renderScene(1, "hands");
        renderGuide();
        renderTray();
        caption(
          "Higiene inicial representada. Ahora revisa la ficha del paciente.",
        );
      }
      break;
    case 2:
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: await animate('hands',4200) == */
      if (await animate("hands", 4200))
        complete(
          "Higiene representada. Respeta técnica, tiempo y secado del producto en la práctica.",
        );
      break;
    case 3:
      state.prepared.push(id);
      renderScene();
      renderGuide();
      renderTray();
      caption("Preparado: " + MATERIALS.find((m) => m.id === id).name);
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.prepared.length===7 == */
      if (state.prepared.length === 7)
        complete("Bandeja preparada. Continúa con la asepsia.");
      break;
    case 4:
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: await animate(id==='rub'?'hands':id==='gloves'?'gloves':'drape',id==='rub'?3300:2200) == */
      if (
        await animate(
          id === "rub" ? "hands" : id === "gloves" ? "gloves" : "drape",
          id === "rub" ? 3300 : 2200,
        )
      ) {
        state.field++;
        kind = "";
        renderScene();
        renderGuide();
        renderTray();
        caption(
          [
            "",
            "Higiene realizada. Selecciona guantes.",
            "Guantes colocados. Selecciona el campo.",
            "Campo estéril preparado.",
          ][state.field],
        );
        /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.field===3 == */
        if (state.field === 3) complete();
      }
      break;
    case 5:
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: await animate('clean',2400) == */
      if (await animate("clean", 2400)) {
        state.clean++;
        kind = "";
        renderScene();
        renderGuide();
        caption(
          "Gasa usada descartada. " +
            (state.clean < 3
              ? "Selecciona una nueva."
              : "Antisepsia representada."),
        );
        /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.clean===3 == */
        if (state.clean === 3)
          complete(
            "Mantén la exposición y respeta el secado antes de continuar.",
          );
      }
      break;
    case 6:
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: await animate(id==='gel'?'gel':'system',2200) == */
      if (await animate(id === "gel" ? "gel" : "system", 2200)) {
        /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: id==='gel' == */
        if (id === "gel") state.lubricated = true;
        else state.system = true;
        renderGuide();
        renderTray();
        renderScene();
        caption(
          id === "gel"
            ? "Lubricación representada. Prepara el sistema Foley."
            : "Sistema cerrado preparado.",
        );
        /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.system == */
        if (state.system) complete();
      }
      break;
    case 7:
      feedback("Usa el control de la guía para avanzar la sonda.");
      $("#advance")?.focus();
      break;
    case 9:
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: !state.confirmed == */
      if (!state.confirmed) {
        feedback("No se puede inflar sin confirmar la posición.", true);
        return false;
      }
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: await animate('balloon',3400) == */
      if (await animate("balloon", 3400)) {
        state.balloon = 1;
        complete(
          "Balón representado dentro de la vejiga. Nunca se infla para comprobar la posición.",
        );
        caption("Balón intravesical. Volumen real según fabricante.");
      }
      break;
    case 10:
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: await animate('fix',1600) == */
      if (await animate("fix", 1600)) {
        state.fixed = true;
        renderScene();
        renderGuide();
        finishDrain();
      }
      break;
    case 11:
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: await animate('hands',3500) == */
      if (await animate("hands", 3500)) {
        state.finalHygiene = true;
        kind = "";
        renderScene();
        renderGuide();
        renderTray();
        caption("Higiene final representada. Ya puedes registrar la práctica.");
      }
      break;
  }
  return true;
}

/* == AQUÍ SE CONTROLA EL AVANCE SIMULADO DE LA SONDA == */
function advance(value) {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.step!==7||busy||done()||state.scenario==='trauma' == */
  if (state.step !== 7 || busy || done() || state.scenario === "trauma")
    return false;
  /* == AQUÍ SE PREPARAN LOS VALORES n == */
  const n = Number(value);
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: !Number.isFinite(n)||n<0||n>100 == */
  if (!Number.isFinite(n) || n < 0 || n > 100) return false;
  state.insertion = n;
  renderScene();
  caption(
    n >= 100
      ? "Punta y zona del balón intravesicales. Todavía no inflar."
      : n >= 82
        ? "Aparece orina. La zona del balón debe quedar totalmente intravesical."
        : "Avance representado. Ante resistencia o dolor intenso, detenerse.",
  );
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: n===100 == */
  if (n === 100) complete("Verifica las dos condiciones antes de inflar.");
  return true;
}

/* == AQUÍ SE DEFINE finishDrain: función auxiliar del módulo == */
function finishDrain() {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.fixed&&state.bag>=65&&(female()||state.foreskin) == */
  if (state.fixed && state.bag >= 65 && (female() || state.foreskin)) {
    complete("Sonda fijada, bolsa baja y medidas de cuidado verificadas.");
    caption("Drenaje libre y sin tracción; bolsa separada del suelo.");
  } else
    feedback(
      !state.fixed
        ? "Falta fijar la sonda."
        : state.bag < 65
          ? "Baja la bolsa hasta su soporte."
          : "Verifica la recolocación del prepucio si se retrajo.",
      true,
    );
}

/* == AQUÍ SE EJECUTA LA ACCIÓN PRINCIPAL DE LA ETAPA == */
async function mainAction() {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: busy == */
  if (busy) return;
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: done() == */
  if (done()) {
    await replay();
    return;
  }
  /* == AQUÍ SE ELIGE EL COMPORTAMIENTO SEGÚN state.step == */
  switch (state.step) {
    case 0:
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: !state.initialHygiene == */
      if (!state.initialHygiene) {
        feedback(
          "Realiza primero la higiene de manos con el frasco de la bandeja.",
          true,
        );
        return;
      }
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: !['identity','consent','risk'].every(c=>state.checks.includes(c)) == */
      if (
        !["identity", "consent", "risk"].every((c) => state.checks.includes(c))
      ) {
        feedback(
          "Completa las tres comprobaciones del paciente simulado.",
          true,
        );
        return;
      }
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: await animate('assess',1800) == */
      if (await animate("assess", 1800)) complete();
      break;
    case 1:
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: await animate('position',2600) == */
      if (await animate("position", 2600)) complete();
      break;
    case 8:
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: !['urine','position'].every(c=>state.checks.includes(c))||state.insertion!==100 == */
      if (
        !["urine", "position"].every((c) => state.checks.includes(c)) ||
        state.insertion !== 100
      ) {
        feedback("Comprueba retorno de orina y posición completa.", true);
        return;
      }
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: await animate('confirm',1700) == */
      if (await animate("confirm", 1700)) {
        state.confirmed = true;
        complete();
        renderScene();
      }
      break;
    case 11:
      /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: !state.finalHygiene == */
      if (!state.finalHygiene) {
        feedback(
          "Primero representa la retirada de guantes y la higiene final con el frasco.",
          true,
        );
        return;
      }
      state.recorded = true;
      complete(
        "Registro conservado durante este intento. No se almacena fuera de la página.",
      );
      renderScene();
      caption("Práctica finalizada. Puedes repasar las etapas.");
      break;
  }
}

/* == AQUÍ SE REPITE LA ANIMACIÓN sin borrar el progreso del intento == */
async function replay() {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: busy||state.scenario==='trauma' == */
  if (busy || state.scenario === "trauma") return;
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.step===0 == */
  if (state.step === 0) {
    await animate("hands", 30000);
    caption("Higiene inicial: revisa ahora las comprobaciones de la guía.");
    return;
  }
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: !done() == */
  if (!done()) {
    feedback("Completa primero la acción para repetir su animación.");
    return;
  }
  /* == AQUÍ SE PREPARAN LOS VALORES replayKind == */
  const replayKind = [
    "assess",
    "position",
    "hands",
    "materials",
    "drape",
    "clean",
    "gel",
    "insertion",
    "confirm",
    "balloon",
    "fix",
    "hands",
  ][state.step];
  /* == AQUÍ SE PREPARAN LOS VALORES previous == */
  const previous = state.insertion;
  /* == AQUÍ SE PREPARAN LOS VALORES replayState == */
  const replayState = state;
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.step===7 == */
  if (state.step === 7) {
    /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: await animate('insertion',3500,p=>{state.insertion=p*100;}) == */
    if (
      await animate("insertion", 3500, (p) => {
        state.insertion = p * 100;
      })
    ) {
      state.insertion = previous;
      renderScene();
    }
  } else await animate(replayKind, 2800);
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state!==replayState == */
  if (state !== replayState) return;
  kind = "";
  renderScene();
  caption("Repetición terminada. El progreso del intento se conserva.");
}

/* == AQUÍ SE CONECTA UN EVENTO DEL NAVEGADOR CON SU ACCIÓN == */
document.addEventListener("click", (event) => {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: event.target.closest('[data-trauma]') == */
  if (event.target.closest("[data-trauma]")) {
    advanceTrauma();
    return;
  }
  /* == AQUÍ SE PREPARAN LOS VALORES material == */
  const material = event.target.closest("[data-material]");
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: material == */
  if (material) {
    void useMaterial(material.dataset.material);
    return;
  }
  /* == AQUÍ SE PREPARAN LOS VALORES step == */
  const step = event.target.closest("[data-step]");
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: step == */
  if (step) {
    navigate(Number(step.dataset.step));
    return;
  }
  /* == AQUÍ SE PREPARAN LOS VALORES target == */
  const target = event.target.closest("[data-scene-action]");
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: target == */
  if (target) {
    /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: target.dataset.sceneAction==='patient' == */
    if (target.dataset.sceneAction === "patient") {
      $("#controls input")?.focus();
      caption("Revisa la ficha y marca las comprobaciones en la guía.");
    } else {
      state.traumaStopped = true;
      render();
    }
    return;
  }
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: event.target.closest('#action') == */
  if (event.target.closest("#action")) void mainAction();
});

/* == AQUÍ SE CONECTA UN EVENTO DEL NAVEGADOR CON SU ACCIÓN == */
document.addEventListener("change", (event) => {
  /* == AQUÍ SE PREPARA EL CAMPO QUE VIAJA AL SERVIDOR == */
  const input = event.target;
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: input.matches('[data-check]') == */
  if (input.matches("[data-check]")) {
    /* == AQUÍ SE PREPARAN LOS VALORES key == */
    const key = input.dataset.check;
    /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: key==='foreskin' == */
    if (key === "foreskin") {
      state.foreskin = input.checked;
      finishDrain();
      return;
    }
    state.checks = state.checks.filter((c) => c !== key);
    /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: input.checked == */
    if (input.checked) state.checks.push(key);
  }
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: input.id==='scenario' == */
  if (input.id === "scenario") {
    /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.done.length||state.prepared.length||state.insertion||state.traumaStep||busy == */
    if (
      state.done.length ||
      state.prepared.length ||
      state.insertion ||
      state.traumaStep ||
      busy
    ) {
      pendingScenario = input.value;
      input.value = state.scenario;
      $("#reset-dialog").showModal();
    } else reset(input.value);
  }
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: input.id==='speed' == */
  if (input.id === "speed") speed = Number(input.value);
});

/* == AQUÍ SE CONECTA UN EVENTO DEL NAVEGADOR CON SU ACCIÓN == */
document.addEventListener("input", (event) => {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: event.target.id==='advance' == */
  if (event.target.id === "advance") advance(event.target.value);
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: event.target.id==='bag-position'&&!done()&&!busy == */
  if (event.target.id === "bag-position" && !done() && !busy) {
    state.bag = Number(event.target.value);
    renderScene();
    finishDrain();
  }
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: event.target.id==='record' == */
  if (event.target.id === "record") state.record = event.target.value;
});

/* == AQUÍ SE CONECTA UN EVENTO DEL NAVEGADOR CON SU ACCIÓN == */
$("#tray").addEventListener("dragstart", (event) => {
  /* == AQUÍ SE PREPARAN LOS VALORES item == */
  const item = event.target.closest("[data-material]");
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: item&&!busy == */
  if (item && !busy) {
    event.dataTransfer.setData("text/plain", item.dataset.material);
    event.dataTransfer.effectAllowed = "copy";
  }
});

/* == AQUÍ SE CONECTA UN EVENTO DEL NAVEGADOR CON SU ACCIÓN == */
$("#stage").addEventListener("dragover", (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
});

/* == AQUÍ SE CONECTA UN EVENTO DEL NAVEGADOR CON SU ACCIÓN == */
$("#stage").addEventListener("drop", (event) => {
  event.preventDefault();
  void useMaterial(event.dataTransfer.getData("text/plain"));
});
$("#next").onclick = () =>
  state.scenario === "trauma" ? advanceTrauma() : navigate(state.step + 1);
$("#replay").onclick = () => void replay();
$("#reset").onclick = () => {
  pendingScenario = state.scenario;
  $("#reset-dialog").showModal();
};
$("#cancel-reset").onclick = () => {
  $("#reset-dialog").close();
  pendingScenario = null;
};
$("#confirm-reset").onclick = () => {
  $("#reset-dialog").close();
  reset(pendingScenario || state.scenario);
  pendingScenario = null;
};
$("#pause").onclick = () => {
  paused = !paused;
  $("#stage").classList.toggle("paused", paused);
  $("#pause").textContent = paused ? "Continuar" : "Pausar";
  $("#pause").setAttribute(
    "aria-label",
    paused ? "Reanudar animación" : "Pausar animación",
  );
};
$("#stop").onclick = () => {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: busy&&!paused == */
  if (busy && !paused) $("#pause").click();
  $("#help-dialog").showModal();
};
$("#close-help").onclick = () => $("#help-dialog").close();
$("#fullscreen").onclick = async () => {
  /* == AQUÍ SE EJECUTA LA OPERACIÓN CON MANEJO DE ERRORES == */
  try {
    /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: document.fullscreenElement == */
    if (document.fullscreenElement) await document.exitFullscreen();
    else await $(".lab").requestFullscreen();
  } catch {
    feedback(
      "Tu navegador no permite ampliar esta escena. Usa el zoom del dispositivo.",
    );
  }
};

/* == AQUÍ SE COMPRUEBA LA CONDICIÓN: document.modelContext?.registerTool == */
if (document.modelContext?.registerTool) {
  /* == AQUÍ SE PREPARAN LOS VALORES lifecycle == */
  const lifecycle = new AbortController();
  /* == AQUÍ SE CONECTA UN EVENTO DEL NAVEGADOR CON SU ACCIÓN == */
  window.addEventListener("pagehide", () => lifecycle.abort(), { once: true });
  /* == AQUÍ SE RECORREN LOS ELEMENTOS O SE REPITE EL BLOQUE == */
  for (const tool of [
    {
      name: "read_simulation",
      description: "Lee el estado de la práctica visual.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: () => ({
        scenario: state.scenario,
        step: state.step + 1,
        completedSteps: state.done.length,
        recorded: state.recorded,
      }),
    },
    {
      name: "start_simulation_case",
      description: "Reinicia la práctica visual con un escenario de adulto.",
      inputSchema: {
        type: "object",
        properties: { caseIndex: { type: "integer", minimum: 0, maximum: 2 } },
        required: ["caseIndex"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: (input) => {
        /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: !Number.isInteger(input?.caseIndex)||input.caseIndex<0||input.caseIndex>2 == */
        if (
          !Number.isInteger(input?.caseIndex) ||
          input.caseIndex < 0 ||
          input.caseIndex > 2
        )
          throw Error("Caso no válido");
        reset(["male", "female", "trauma"][input.caseIndex]);
        return { scenario: state.scenario, step: 1 };
      },
    },
  ]) {
    /* == AQUÍ SE EJECUTA LA OPERACIÓN CON MANEJO DE ERRORES == */
    try {
      Promise.resolve(
        document.modelContext.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {});
    } catch {}
  }
}
render();
