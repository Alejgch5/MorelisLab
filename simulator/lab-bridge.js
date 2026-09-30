"use strict";

/* == AQUÍ SE PREPARAN LOS VALORES params == */
const params = new URLSearchParams(location.search);

/* == AQUÍ SE PREPARAN LOS VALORES requestedCase == */
const requestedCase = params.get("case");

/* == AQUÍ SE COMPRUEBA LA CONDICIÓN: ['male','female','trauma'].includes(requestedCase) == */
if (["male", "female", "trauma"].includes(requestedCase)) reset(requestedCase);
document.body.classList.add("embedded-lab");

/* == AQUÍ SE COMPRUEBA LA CONDICIÓN: params.get('mode')==='evaluation' == */
if (params.get("mode") === "evaluation")
  document.body.classList.add("assessment-mode");

/* == AQUÍ SE PREPARAN LOS VALORES labStyle == */
const labStyle = document.createElement("style");
labStyle.textContent = `
 body.embedded-lab{background:#f4f7fa!important;margin:0}body>header,.title-row,.embedded-lab footer,.embedded-lab .teacher-panel,.embedded-lab #reset{display:none!important}main{max-width:1400px!important;padding:18px!important}.assessment-mode #explanation,.assessment-mode #instruction{visibility:hidden}.assessment-mode.show-help #explanation,.assessment-mode.show-help #instruction{visibility:visible}.embedded-lab .brand-sub{display:none}button,select,textarea{font-size:14px!important} .embedded-lab .clinical-monitor{border-radius:12px} .embedded-lab .event-log{margin-bottom:10px}body.embedded-lab .incident-buttons{display:none!important}
`;
document.head.append(labStyle);
// Incidence controls are exposed through the laboratory facilitator panel.
document
  .querySelector(".incident-buttons")
  ?.closest("details")
  ?.setAttribute("hidden", "");

/* == AQUÍ SE PREPARAN LOS VALORES originalAdvanceTrauma == */
const originalAdvanceTrauma = advanceTrauma;
advanceTrauma = function () {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.traumaStep===3 == */
  if (state.traumaStep === 3) return;
  originalAdvanceTrauma();
};

/* == AQUÍ SE PREPARAN LOS VALORES labLast, labSteps, labStarted == */
let labLast = "",
  labSteps = [],
  labStarted = Date.now();

/* == AQUÍ SE DEFINE sendSnapshot: función auxiliar del módulo == */
function sendSnapshot() {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: state.scenario==='trauma'&&state.traumaStep===3 == */
  if (state.scenario === "trauma" && state.traumaStep === 3) {
    document.querySelector("#next").disabled = true;
    /* == AQUÍ SE PREPARAN LOS VALORES endButton == */
    const endButton = document.querySelector("[data-trauma]");
    /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: endButton == */
    if (endButton) {
      endButton.disabled = true;
      endButton.textContent = "Caso completado · continúa con la reflexión";
    }
  }

  /* == AQUÍ SE PREPARAN LOS VALORES completed == */
  const completed =
    state.scenario === "trauma" ? state.traumaStep === 3 : state.recorded;

  /* == AQUÍ SE PREPARAN LOS VALORES step == */
  const step = state.scenario === "trauma" ? state.traumaStep : state.step;

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: !labSteps.some(x=>x.step===step) == */
  if (!labSteps.some((x) => x.step === step))
    labSteps.push({
      step,
      label:
        state.scenario === "trauma"
          ? TRAUMA[Math.min(step, 3)].short
          : STEPS[step].short,
      at: Math.round((Date.now() - labStarted) / 1000),
    });

  /* == AQUÍ SE PREPARAN LOS DATOS DEL BLOQUE == */
  const data = {
    type: "lab-snapshot",
    height: Math.ceil(document.querySelector("main").scrollHeight + 40),
    scenario: state.scenario,
    step,
    completed,
    done: state.done.length,
    traumaStep: state.traumaStep,
    drainage: Math.round(clinical.drainage),
    pain: Math.round(clinical.pain),
    hr: Math.round(clinical.hr),
    rr: Math.round(clinical.rr),
    bp: Math.round(clinical.sys) + "/" + Math.round(clinical.dia),
    incident: clinical.event,
    paused: clinical.paused,
    insertion: state.insertion,
    assessed: clinical.assessed,
    called: clinical.called,
    stopped: clinical.stopped,
    checks: [...state.checks],
    timeline: labSteps,
    events: clinical.log.slice(-100),
  };

  /* == AQUÍ SE PREPARAN LOS VALORES key == */
  const key = JSON.stringify(data);
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: key!==labLast == */
  if (key !== labLast) {
    parent.postMessage(data, location.origin);
    labLast = key;
  }
}

/* == AQUÍ SE CONECTA UN EVENTO DEL NAVEGADOR CON SU ACCIÓN == */
window.addEventListener("message", (e) => {
  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: e.origin!==location.origin||e.source!==parent||e.data?.type!=='lab-command' == */
  if (
    e.origin !== location.origin ||
    e.source !== parent ||
    e.data?.type !== "lab-command"
  )
    return;

  /* == AQUÍ SE PREPARAN LOS VALORES ok == */
  let ok = true;
  /* == AQUÍ SE PREPARAN LOS VALORES {action,value} == */
  const { action, value } = e.data;

  /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: action==='incident' == */
  if (action === "incident") ok = setIncident(value);
  else if (action === "resolve") {
    /* == AQUÍ SE PREPARAN LOS VALORES old == */
    const old = clinical.event;
    handleClinical("resume");
    ok = !!old && !clinical.event;
  } else if (action === "pause") {
    /* == AQUÍ SE COMPRUEBA LA CONDICIÓN: clinical.paused!==!!value == */
    if (clinical.paused !== !!value)
      document.querySelector("#clinical-pause").click();
  } else if (action === "help")
    document.body.classList.toggle("show-help", !!value);
  else ok = false;
  parent.postMessage(
    { type: "lab-command-result", action, ok },
    location.origin,
  );
  sendSnapshot();
});
setInterval(sendSnapshot, 800);
sendSnapshot();
