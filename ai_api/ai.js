import http from "node:http";
import url from "node:url";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

const addMinutes = (time, minutes) => {
  const [h, m] = time.split(":").map(Number);
  const base = new Date(0, 0, 0, h, m, 0, 0);
  const end = new Date(base.getTime() + minutes * 60000);
  const hh = String(end.getHours()).padStart(2, "0");
  const mm = String(end.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

const parseBody = (req) =>
  new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
  });

const json = (res, status, data) => {
  res.writeHead(status, { "Content-Type": "application/json", ...cors });
  res.end(JSON.stringify(data));
};

const suggestExamsLocal = ({ modules = [], professors = [], rooms = [], duration_minutes = 120 }) => {
  console.time("AI_API:suggest_local");
  console.log("AI_API:suggest_local input", { modules: modules.length, professors: professors.length, rooms: rooms.length, duration_minutes });
  const today = new Date();
  const nextWeekdays = [];
  while (nextWeekdays.length < modules.length) {
    const d = new Date(today.getTime() + (nextWeekdays.length + 1) * 24 * 60 * 60 * 1000);
    const day = d.getDay();
    if (day !== 0 && day !== 6) nextWeekdays.push(d.toISOString().split("T")[0]);
  }
  const slots = [];
  for (const date of nextWeekdays) {
    slots.push({ date, start: "08:30" });
    slots.push({ date, start: "14:00" });
  }
  console.log("AI_API:suggest_local slots", { count: slots.length });
  const profPerDay = new Map();
  const roomPerSlot = new Set();
  const exams = [];
  let slotIdx = 0;
  for (const m of modules) {
    if (slotIdx >= slots.length) break;
    const slot = slots[slotIdx];
    const end = addMinutes(slot.start, duration_minutes);
    let profId = m.professor_id;
    if (!profId) {
      const used = profPerDay.get(slot.date) || new Set();
      const freeProf = professors.find((p) => !used.has(p.id));
      profId = freeProf?.id;
    }
    if (!profId) {
      slotIdx++;
      continue;
    }
    const usedSet = profPerDay.get(slot.date) || new Set();
    if (usedSet.has(profId)) {
      slotIdx++;
      continue;
    }
    let roomId = rooms[0]?.id;
    for (const r of rooms) {
      const rk = `${r.id}|${slot.date}|${slot.start}`;
      if (!roomPerSlot.has(rk)) {
        roomId = r.id;
        roomPerSlot.add(rk);
        break;
      }
    }
    if (!roomId) {
      slotIdx++;
      continue;
    }
    usedSet.add(profId);
    profPerDay.set(slot.date, usedSet);
    exams.push({
      module_id: m.id,
      room_id: roomId,
      date: slot.date,
      start_time: slot.start,
      end_time: end,
      duration_minutes,
      professor_ids: [profId],
    });
    slotIdx++;
  }
  console.log("AI_API:suggest_local exams", { count: exams.length });
  console.timeEnd("AI_API:suggest_local");
  return { exams };
};

const callAssemblyAI = async ({ prompt, input }) => {
  const key = process.env.ASSEMBLYAI_KEY;
  if (!key) return { error: "Missing ASSEMBLYAI_KEY" };
  console.time("AI_API:assemblyai_request");
  console.log("AI_API:assemblyai_request start", { prompt_len: prompt?.length || 0, modules: input?.modules?.length || 0, professors: input?.professors?.length || 0, rooms: input?.rooms?.length || 0 });
  const res = await fetch("https://api.assemblyai.com/lemur/v1/generate", {
    method: "POST",
    headers: { Authorization: key, "Content-Type": "application/json" },
    body: JSON.stringify({ input_text: JSON.stringify(input), prompt }),
  });
  console.log("AI_API:assemblyai_response status", { status: res.status, ok: res.ok });
  const jsonRes = await res.json();
  console.timeEnd("AI_API:assemblyai_request");
  return jsonRes;
};

const server = http.createServer(async (req, res) => {
  const { pathname } = url.parse(req.url, true);
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });

  if (pathname === "/suggest-exams" && req.method === "POST") {
    try {
      const body = await parseBody(req);
      const use_ai = !!body.use_ai;
      console.log("AI_API:/suggest-exams request", { use_ai, modules: (body.modules || []).length, professors: (body.professors || []).length, rooms: (body.rooms || []).length, duration_minutes: body.duration_minutes || 120 });
      if (use_ai) {
        const prompt =
          "You are an exam scheduling assistant. Given modules, professors, and rooms, create JSON {exams:[{module_id,date,start_time,end_time,duration_minutes,room_id,professor_ids[]}]} with constraints: weekdays only, <=2 exams/day, each module once, a professor at most once/day, one room per slot, duration_minutes used to compute end_time.";
        const input = {
          modules: (body.modules || []).map((m) => ({ id: m.id, professor_id: m.professor_id })),
          professors: (body.professors || []).map((p) => ({ id: p.id })),
          rooms: (body.rooms || []).map((r) => ({ id: r.id })),
          duration_minutes: body.duration_minutes || 120,
        };
        console.log("AI_API:/suggest-exams calling AI");
        const ai = await callAssemblyAI({ prompt, input });
        const text = ai.response || ai.result || "";
        let parsed;
        try {
          parsed = JSON.parse(text);
          console.log("AI_API:/suggest-exams AI parsed", { exams: (parsed.exams || []).length });
          return json(res, 200, parsed);
        } catch {
          console.warn("AI_API:/suggest-exams AI parse failed, fallback local");
          const fallback = suggestExamsLocal({
            modules: body.modules || [],
            professors: body.professors || [],
            rooms: body.rooms || [],
            duration_minutes: body.duration_minutes || 120,
          });
          return json(res, 200, fallback);
        }
      } else {
        console.log("AI_API:/suggest-exams using local scheduler");
        const out = suggestExamsLocal({
          modules: body.modules || [],
          professors: body.professors || [],
          rooms: body.rooms || [],
          duration_minutes: body.duration_minutes || 120,
        });
        return json(res, 200, out);
      }
    } catch (e) {
      console.error("AI_API:/suggest-exams error", e);
      return json(res, 500, { error: String(e) });
    }
  }

  if (pathname === "/chat" && req.method === "POST") {
    try {
      const body = await parseBody(req);
      console.log("AI_API:/chat request", { hasPrompt: !!body.prompt });
      const ai = await callAssemblyAI({
        prompt: body.prompt || "Respond conversationally.",
        input: body.input || {},
      });
      console.log("AI_API:/chat response keys", Object.keys(ai || {}));
      return json(res, 200, ai);
    } catch (e) {
      console.error("AI_API:/chat error", e);
      return json(res, 500, { error: String(e) });
    }
  }

  json(res, 404, { error: "Not found" });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
server.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});