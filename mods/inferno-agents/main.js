// Inferno party cards: agents() as a dark-gothic hero roster. Life = context left,
// Mana = 5-hour quota left, read from the statusLine cache (data/traveler/sessions,
// shared with the traveler layout). Reads cache files only: no commands, no network.
import { View, div, image, svg } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { agents, appHome, readTextFile, run, setAgentOrder, spaces, theme, watchFolder, window } from "herdr";
import { CLASS_TITLE, animPath, appLabel, assignJobs, cachePath, gauge, jobIn, modelText, orbPath, parseCache, portraitPath, remoteCachePath, tabNames } from "./lib.js";

const HOME = appHome();
const SESSIONS_DIR = `${HOME}/data/traveler/sessions`;
const JOBS_FILE = `${HOME}/mods/inferno-agents/jobs.json`;
const STAGE_W = 72;
const STAGE_H = 96;
const ORB = 30;
const DISPLAY = "Cinzel";
const STATUS = { working: "In battle", blocked: "Needs you", done: "Victorious", idle: "Resting" };

// The hero in their niche: one strip of frames per class and state (rest, working = an attack
// with the class's effect, blocked = calling for you, done = gold aura), slid one frame at a
// time by the card clock. Herdr's image() shows only an animated file's first frame, so the
// stepping is ours. Unknown classes fall back to the program icon.
function stage(a, job, t, now) {
  const state = a.status === "working" || a.status === "blocked" || a.status === "done" ? a.status : "rest";
  const anim = animPath(job, state);
  const shell = div().relative().w(STAGE_W).h(STAGE_H).flex_none().overflow_hidden().bg("#0b0806").border(1).border_color("#2a1d13");
  if (anim) {
    const frame = Math.floor(now / anim.ms) % anim.frames;
    return shell.child(image(anim.path).absolute().top(0).left(-frame * STAGE_W).w(STAGE_W * anim.frames).h(STAGE_H));
  }
  const p = a.program;
  if (!p?.icon) return shell;
  return shell.child((p.tint ? svg(p.icon).text_color(t.foreground) : image(p.icon)).absolute().left(18).top(30).size(36));
}

// One orb: the glass globe filled to its level, then its word and number.
function orb(kind, g, t) {
  const word = kind === "mana" ? "Mana" : "Life";
  const color = g.pct === null ? t.dim : g.stale ? t.muted : kind === "mana" ? "#9fb2ff" : "#ff8a70";
  return h_flex()
    .flex_1()
    .min_w(0)
    .gap(5)
    .items_center()
    .child(image(orbPath(kind, g.pct)).size(ORB).flex_none())
    .child(
      v_flex()
        .min_w(0)
        .child(div().font_family(DISPLAY).text_size(8.5).text_color(t.dim).child(word.toUpperCase()))
        .child(div().text_size(12).font_weight(700).text_color(color).child(g.stale ? `${g.text} old` : g.text)),
    );
}

// Tag row: a small framed label, then "model · effort" when known.
function tag(label, model, t) {
  const color = label.builder ? t.unknown : t.accent;
  return h_flex()
    .w_full()
    .min_w(0)
    .h(16)
    .gap(6)
    .items_center()
    .child(
      div()
        .flex_none()
        .px(5)
        .border(1)
        .border_color(`${color}99`)
        .bg(`${color}14`)
        .font_family(DISPLAY)
        .text_size(9)
        .text_color(color)
        .child(label.text.toUpperCase()),
    )
    .when(model !== null, (el) => el.child(modelLine(model, t)));
}

function modelLine(model, t) {
  return div().flex_1().min_w(0).truncate().text_size(11).text_color(t.dim).child(model);
}

// A rivet on each corner of a card's iron frame.
function rivets(color) {
  const r = () => div().absolute().size(4).bg(color);
  return [r().top(-2).left(-2), r().top(-2).right(-2), r().bottom(-2).left(-2), r().bottom(-2).right(-2)];
}

export default class Inferno extends View {
  init(_props, cx) {
    this.jobs = {};
    this.cache = {};
    this.remote = {};
    this.tick = 0;
    this.seen = new Set();
    this.watching = false;
    this.clock = 0;
    cx.timer.every(80, (cx) => {
      this.clock++;
      if (agents().length === 0) return;
      if (window()?.active || this.clock % 3 === 0) cx.notify();
    });
    this.loadJobs(cx);
    this.load(cx);
    this.loadRemote(cx);
    this.watch(cx);
    // 資料是數字，最多 30 秒看一次就夠；也讓「舊」標記自己出現，順便重試監看。
    cx.timer.every(30000, (cx) => {
      this.load(cx);
      this.watch(cx);
      // 遠端每 60 秒讀一次，跟 statusLine 的更新間隔一樣；遠端資料夾不能監看。
      if (++this.tick % 2 === 0) this.loadRemote(cx);
    });
  }

  // 監看快取資料夾：有變更就重讀。資料夾不存在或不被允許時結束迴圈，
  // 交給上面的計時器每 30 秒重試，不會變成緊迴圈。
  watch(cx) {
    if (this.watching) return;
    this.watching = true;
    cx.spawn(async (cx) => {
      let quick = 0;
      for (;;) {
        let changed;
        const started = Date.now();
        try {
          changed = await watchFolder(SESSIONS_DIR);
        } catch {
          break;
        }
        // 立刻回來又沒有任何變更，代表監看沒真的生效，也別讓它空轉。
        quick = Date.now() - started < 500 && (changed ?? []).length === 0 ? quick + 1 : 0;
        if (quick >= 3) break;
        this.load(cx);
      }
      this.watching = false;
    });
  }

  loadJobs(cx) {
    cx.spawn(async (cx) => {
      const text = await readTextFile(JOBS_FILE).catch(() => null);
      let jobs = {};
      try {
        const parsed = JSON.parse(text);
        if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) jobs = parsed;
      } catch {
        jobs = {};
      }
      this.jobs = jobs;
      cx.notify();
    });
  }

  // 每個本機 agent 讀自己那份快取；遠端的由 loadRemote 讀。
  load(cx) {
    const wanted = [];
    for (const a of agents()) {
      const path = cachePath(HOME, a.address);
      if (path === null) continue;
      this.seen.add(a.address);
      wanted.push({ address: a.address, path });
    }
    cx.spawn(async (cx) => {
      const next = {};
      for (const w of wanted) {
        const text = await readTextFile(w.path).catch(() => null);
        next[w.address] = parseCache(text);
      }
      this.cache = next;
      cx.notify();
    });
  }

  // 遠端 agent 讀它那台的快取檔（透過 Herdr 原有的連線，不執行指令）；連不上就是 null，畫面顯示「—」。
  loadRemote(cx) {
    const wanted = [];
    for (const a of agents()) {
      const r = remoteCachePath(a.address);
      if (r === null) continue;
      this.seen.add(a.address);
      wanted.push({ address: a.address, ...r });
    }
    if (wanted.length === 0) return;
    cx.spawn(async (cx) => {
      const next = {};
      for (const w of wanted) {
        const text = await readTextFile(w.path, { on: w.on }).catch(() => null);
        next[w.address] = parseCache(text);
      }
      this.remote = next;
      cx.notify();
    });
  }

  card(a, now, t) {
    const cache = this.cache[a.address] ?? this.remote[a.address] ?? null;
    const life = gauge(cache ? cache.hp : null, cache ? cache.updatedAt : null, now);
    const mana = gauge(cache ? cache.sp : null, cache ? cache.updatedAt : null, now);
    const job = jobIn(a.tab_name, this.assigned);
    // Blocked wins the frame (blood), then focus (gold), else dark bronze.
    const frame = a.status === "blocked" ? t.blocked : a.focused ? t.accent : "#5a4026";
    const statusColor = a.status === "blocked" ? t.blocked : t[a.status] ?? t.dim;
    // Name colored like loot: blue while working, green once done, gold when focused.
    const nameColor = a.status === "working" ? "#a9b8ff" : a.status === "done" ? "#a8d070" : a.status === "blocked" ? "#ff7a62" : a.focused ? "#e8cf8a" : t.foreground;
    const label = appLabel(a.app);
    const model = modelText(cache?.model, cache?.effort);
    return h_flex()
      .id(`inferno-${a.address}`)
      .relative()
      .w_full()
      .flex_none()
      .p(6)
      .gap(9)
      .items_center()
      .bg(a.focused ? "#1c120bea" : "#0e0907e0")
      .border(1)
      .border_color(frame)
      .cursor_pointer()
      .hover((s) => s.bg("#2a1a10ee"))
      .on_click(() => run("agent.focus", { terminal: a.address }))
      .children(rivets(frame))
      .child(stage(a, job, t, this.ms))
      .child(
        v_flex()
          .flex_1()
          .min_w(0)
          .gap(3)
          .child(
            h_flex()
              .w_full()
              .min_w(0)
              .gap(6)
              .items_center()
              .child(div().flex_1().min_w(0).truncate().font_family(DISPLAY).font_weight(700).text_size(13).text_color(nameColor).child(a.tab_name || a.address))
              .child(div().flex_none().text_size(10.5).italic().text_color(statusColor).child(STATUS[a.status] ?? a.status)),
          )
          .when(Boolean(job), (el) => el.child(div().font_family(DISPLAY).text_size(10).text_color(`${t.accent}cc`).child(CLASS_TITLE[job] ?? "")))
          // Session name (set with /rename) under the class; takes no row when unset.
          .when(Boolean(cache?.name), (el) =>
            el.child(div().w_full().min_w(0).truncate().text_size(11).text_color(t.dim).child(cache.name)),
          )
          .when(Boolean(label), (el) => el.child(tag(label, label.builder ? null : model, t)))
          .when(Boolean(label?.builder) && model !== null, (el) => el.child(h_flex().w_full().min_w(0).child(modelLine(model, t))))
          // Builders have no life/mana source, so no empty orbs.
          .when(!label?.builder, (el) => el.child(h_flex().w_full().min_w(0).pt(2).gap(6).child(orb("life", life, t)).child(orb("mana", mana, t)))),
      );
  }

  render(cx) {
    const t = theme();
    const list = agents();
    this.assigned = assignJobs(tabNames(spaces(), list), this.jobs);
    setAgentOrder(list.map((a) => a.address));
    // A newly seen agent reads its cache now instead of at the next tick.
    const fresh = list.filter((a) => !this.seen.has(a.address));
    if (fresh.some((a) => cachePath(HOME, a.address) !== null)) this.load(cx);
    if (fresh.some((a) => remoteCachePath(a.address) !== null)) this.loadRemote(cx);
    this.ms = Date.now();
    const now = Math.floor(this.ms / 1000);
    return v_flex()
      .id("inferno")
      .size_full()
      .min_h(0)
      .text_color(t.foreground)
      .text_size(13)
      .child(
        h_flex().h(28).flex_none().px(14).gap(8).items_center()
          .child(div().font_family(DISPLAY).font_weight(700).text_size(11).text_color(t.accent).child("THE PARTY"))
          .child(div().flex_1().h(1).bg("#5a402680"))
          .child(div().text_size(11).text_color(t.dim).child(String(list.length))),
      )
      .child(
        v_flex()
          .flex_1()
          .min_h(0)
          .gap(8)
          .px(8)
          .pt(2)
          .pb(8)
          .overflow_y_scrollbar()
          .children(list.map((a) => this.card(a, now, t)))
          .when(list.length === 0, (el) =>
            el.child(div().p(8).text_size(12).italic().text_color(t.dim).child("No heroes have answered the call.")),
          ),
      );
  }
}
