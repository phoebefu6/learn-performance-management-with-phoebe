/* pip-live.js - the PIP Lab (learn-performance-management-with-phoebe).
   Two meters, one plan. Toggle the six things that make a performance improvement plan a genuine
   chance to recover, and watch BOTH the recovery chance and the procedural defensibility climb.
   Then meet the two anti-levers - rushing the timeline, and writing the plan after the decision is
   already made - which visibly wreck both. The third preset case is the honest one: when the cause
   was the role, the manager, or a reorg, no combination of levers rescues it, because you cannot
   improvement-plan your way out of a problem that was never the person.
   Deterministic teaching model on a fictional company. Not a prediction engine. Not legal advice. */
(function () {
  var host = document.getElementById("pip-lab");
  if (!host) return;

  /* Three real-shaped cases. `ceiling` is the highest recovery this cause can reach even with a
     perfect plan - that is the whole lesson of case 3. */
  var CASES = [
    { id: "skill", name: "Skill gap", who: "Priya, merchandising analyst",
      story: "Solid attitude, genuinely trying, but has never been taught the forecasting work the role now needs. Output is late and needs rework.",
      cause: "The person can do this job, but has not been taught part of it.",
      ceiling: 0.88, base: 0.22,
      verdict: "A skill gap is the case a plan is actually built for. Teach, practise, review.",
      wrong: "Do not lead with a warning. Lead with instruction, then measure." },
    { id: "will", name: "Motivation gap", who: "Tomas, senior buyer",
      story: "Capable and experienced, delivered well for two years, has visibly disengaged since the reorg. Misses commitments without flagging them.",
      cause: "The person can do this job and has stopped choosing to.",
      ceiling: 0.62, base: 0.14,
      verdict: "Motivation cases can recover, but only if the real cause surfaces in the conversation first.",
      wrong: "A plan with no honest conversation about why just formalises the disengagement." },
    { id: "context", name: "Role or context mismatch", who: "Dana, ops coordinator",
      story: "Strong performer for three years. The role was rewritten around a new system after a reorg, the team lost two people, and the job is now a different job.",
      cause: "The cause is the role, the resourcing, or the manager - not the person.",
      ceiling: 0.31, base: 0.10,
      verdict: "You cannot improvement-plan your way out of a problem that was never the person. Fix the role, or find them the right one.",
      wrong: "Running a PIP here is the most common and most expensive mistake in this whole course." }
  ];

  /* Six levers. `rec` = weight toward recovery, `def` = weight toward defensibility. */
  var LEVERS = [
    { id: "criteria", label: "Written criteria the person can actually meet",
      note: "specific, measurable, achievable in the time given", rec: 0.20, def: 0.20 },
    { id: "evidence", label: "Documented evidence from before the plan started",
      note: "dated examples, not a summary written last week", rec: 0.06, def: 0.24 },
    { id: "coaching", label: "Weekly coaching with named support",
      note: "someone teaching, not just someone checking", rec: 0.26, def: 0.10 },
    { id: "warning", label: "The honest early warning, months earlier",
      note: "no plan should ever be the first time they hear it", rec: 0.18, def: 0.16 },
    { id: "timeline", label: "A realistic timeline",
      note: "long enough for the work to show a change", rec: 0.16, def: 0.14 },
    { id: "consistency", label: "Applied the same way to similar cases",
      note: "the same bar for everyone at that level", rec: 0.02, def: 0.22 }
  ];

  /* Two anti-levers. Both LOOK like management efficiency. Both wreck the plan. */
  var ANTI = [
    { id: "rush", label: "Shorten it to two weeks to save management time",
      recMul: 0.42, defMul: 0.45, cancels: "timeline",
      say: "A two-week plan cannot show a change in the work. It reads as a countdown, the person spends it job-hunting, and the first question anyone reviewing it later asks is whether the target was achievable at all." },
    { id: "predecided", label: "Write the plan after deciding to terminate",
      recMul: 0.06, defMul: 0.14, cancels: null,
      say: "This is the one that ends up in front of a tribunal or a lawyer. A plan written as paperwork for a decision already made is a pretext, and it is exactly what gets examined: was it genuine, was it achievable, was it applied consistently? You also lose the recovery you might have had." }
  ];

  var current = "skill";
  var on = {};
  LEVERS.forEach(function (l) { on[l.id] = false; });
  ANTI.forEach(function (a) { on[a.id] = false; });

  function theCase() {
    for (var i = 0; i < CASES.length; i++) { if (CASES[i].id === current) return CASES[i]; }
    return CASES[0];
  }

  var TOT_REC = 0, TOT_DEF = 0;
  LEVERS.forEach(function (l) { TOT_REC += l.rec; TOT_DEF += l.def; });
  var DEF_FLOOR = 0.08, DEF_SPAN = 0.84;

  function compute() {
    var c = theCase();
    /* Recovery is a share of what THIS cause can achieve at best: base plus a fraction of the
       span up to its ceiling. A context mismatch has a low ceiling, so a perfect plan still
       barely moves it - which is the point of case 3. Defensibility is about process, so it is
       the same span for every case. */
    var recW = 0, defW = 0;
    LEVERS.forEach(function (l) {
      if (!on[l.id]) return;
      var cancelled = false;
      ANTI.forEach(function (a) { if (on[a.id] && a.cancels === l.id) cancelled = true; });
      if (cancelled) return;
      recW += l.rec;
      defW += l.def;
    });
    var rec = c.base + (c.ceiling - c.base) * (recW / TOT_REC);
    var def = DEF_FLOOR + DEF_SPAN * (defW / TOT_DEF);
    ANTI.forEach(function (a) { if (on[a.id]) { rec *= a.recMul; def *= a.defMul; } });
    rec = Math.max(0, Math.min(c.ceiling, rec));
    def = Math.max(0, Math.min(DEF_FLOOR + DEF_SPAN, def));
    return { rec: Math.round(rec * 100), def: Math.round(def * 100), c: c };
  }

  host.innerHTML =
    '<div class="pl-shell">' +
      '<div class="pl-cases"><span class="pl-clabel">Pick the case in front of you</span><div class="pl-casebtns"></div></div>' +
      '<div class="pl-story" id="pl-story"></div>' +
      '<div class="pl-meters">' +
        '<div class="pl-meter"><div class="pl-mhead"><span class="pl-mname">Genuine recovery chance</span><span class="pl-mval" id="pl-rec">-</span></div>' +
          '<div class="pl-track"><i class="pl-fill pl-fill-rec" id="pl-recbar"></i></div>' +
          '<span class="pl-mnote">Will this person actually be doing the job well in three months?</span></div>' +
        '<div class="pl-meter"><div class="pl-mhead"><span class="pl-mname">Procedural defensibility</span><span class="pl-mval" id="pl-def">-</span></div>' +
          '<div class="pl-track"><i class="pl-fill pl-fill-def" id="pl-defbar"></i></div>' +
          '<span class="pl-mnote">Could you show a third party this was fair, evidenced, and consistent?</span></div>' +
      '</div>' +
      '<div class="pl-cols">' +
        '<div class="pl-col"><span class="pl-clabel">Build the plan properly</span><div class="pl-levers" id="pl-levers"></div></div>' +
        '<div class="pl-col"><span class="pl-clabel pl-warn">Shortcuts that look efficient</span><div class="pl-levers" id="pl-anti"></div></div>' +
      '</div>' +
      '<div class="pl-say" id="pl-say"></div>' +
      '<div class="pl-actions"><button type="button" class="pl-btn" id="pl-all">Turn on all six</button>' +
        '<button type="button" class="pl-btn" id="pl-reset">Reset</button></div>' +
      '<p class="pl-rail">A deterministic teaching model on a fictional company (Cartwheel), driven by the plan you build - not a prediction engine, and not legal advice. The lesson it encodes is the one the case law keeps testing: a plan has to be genuine, achievable, evidenced, and applied consistently. Jurisdictions differ; check yours.</p>' +
    '</div>';

  var caseWrap = host.querySelector(".pl-casebtns");
  CASES.forEach(function (c) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "pl-case"; b.setAttribute("data-c", c.id);
    b.innerHTML = c.name + '<span class="pl-who">' + c.who + '</span>';
    b.addEventListener("click", function () { current = c.id; render(); });
    caseWrap.appendChild(b);
  });

  function mkToggle(item, wrap, isAnti) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "pl-lev" + (isAnti ? " pl-lev-anti" : "");
    b.setAttribute("data-l", item.id);
    b.innerHTML = '<span class="pl-box"></span><span class="pl-ltext"><b>' + item.label + '</b>' +
      (item.note ? '<span>' + item.note + '</span>' : '') + '</span>';
    b.addEventListener("click", function () { on[item.id] = !on[item.id]; render(); });
    wrap.appendChild(b);
  }
  var leverWrap = host.querySelector("#pl-levers");
  var antiWrap = host.querySelector("#pl-anti");
  LEVERS.forEach(function (l) { mkToggle(l, leverWrap, false); });
  ANTI.forEach(function (a) { mkToggle(a, antiWrap, true); });

  host.querySelector("#pl-all").addEventListener("click", function () {
    LEVERS.forEach(function (l) { on[l.id] = true; });
    ANTI.forEach(function (a) { on[a.id] = false; });
    render();
  });
  host.querySelector("#pl-reset").addEventListener("click", function () {
    LEVERS.forEach(function (l) { on[l.id] = false; });
    ANTI.forEach(function (a) { on[a.id] = false; });
    render();
  });

  function render() {
    var r = compute(), c = r.c;

    host.querySelectorAll(".pl-case").forEach(function (b) {
      b.classList.toggle("pl-on", b.getAttribute("data-c") === current);
    });
    host.querySelectorAll(".pl-lev").forEach(function (b) {
      b.classList.toggle("pl-on", !!on[b.getAttribute("data-l")]);
    });

    host.querySelector("#pl-story").innerHTML =
      '<b>' + c.who + '</b> ' + c.story + ' <em>' + c.cause + '</em>';

    document.getElementById("pl-rec").textContent = r.rec + "%";
    document.getElementById("pl-def").textContent = r.def + "%";
    document.getElementById("pl-recbar").style.width = r.rec + "%";
    document.getElementById("pl-defbar").style.width = r.def + "%";
    document.getElementById("pl-rec").className = "pl-mval " + band(r.rec);
    document.getElementById("pl-def").className = "pl-mval " + band(r.def);

    var say = document.getElementById("pl-say"), msg = "", cls = "pl-say";
    var antiOn = ANTI.filter(function (a) { return on[a.id]; });
    var levOn = LEVERS.filter(function (l) { return on[l.id]; }).length;

    if (antiOn.length) {
      cls = "pl-say pl-alarm";
      msg = "<b>" + (antiOn.length > 1 ? "Two shortcuts taken." : "Shortcut taken.") + "</b> " +
            antiOn.map(function (a) { return a.say; }).join(" ");
    } else if (current === "context" && levOn === LEVERS.length) {
      cls = "pl-say pl-ceiling";
      msg = "<b>A perfect plan, and it still tops out at " + r.rec + "%.</b> " + c.verdict +
            " The defensibility is high because the process is clean - but a defensible plan aimed at the wrong cause is still the wrong intervention. " + c.wrong;
    } else if (levOn === 0) {
      cls = "pl-say";
      msg = "<b>Nothing in place yet.</b> This is a plan in name only: no criteria, no evidence, no support, no warning given. " + c.wrong;
    } else if (levOn === LEVERS.length) {
      cls = "pl-say pl-good";
      msg = "<b>This is a real chance, not paperwork.</b> " + c.verdict +
            " Recovery at " + r.rec + "% and defensibility at " + r.def + "% - and note the order that produced it: the support and the honest warning moved recovery, the evidence and the consistency check moved defensibility.";
    } else {
      msg = "<b>" + levOn + " of 6 in place.</b> Keep going - watch which levers move which meter. Coaching and the early warning buy recovery; evidence and consistency buy defensibility. " + c.cause;
    }
    say.className = cls;
    say.innerHTML = msg;
  }

  function band(v) { return v >= 70 ? "pl-hi" : (v < 40 ? "pl-lo" : "pl-mid"); }

  render();
})();
