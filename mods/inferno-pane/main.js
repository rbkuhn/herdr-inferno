// A pane's header, for layouts that frame their panes:
//   { "tab": "active", "pane": { "header": { "content": { "mod": "inferno-pane" } } } }
// Shows the program's icon (the app's program table), the agent's name or
// the terminal's title, the folder, and the agent's status; buttons split, zoom and close
// this pane. Props from the app: { pane, terminal }. Click: focus the pane.

import { View, div, svg, image } from "gpui-kit";
import { h_flex } from "gpui-base";
import { panes, props, run, theme, home } from "herdr";

function icon(p, size, color) {
  if (!p?.icon) return null;
  return p.tint ? svg(p.icon).size(size).flex_none().text_color(color) : image(p.icon).w(size).h(size).flex_none();
}

function folder(cwd) {
  if (!cwd) return "";
  const h = home();
  return cwd === h ? "HOME" : cwd.startsWith(h + "/") ? "~" + cwd.slice(h.length) : cwd;
}

export default class Pane extends View {
  init() { this.hovered = false; }

  me() {
    return panes().find((p) => p.pane === props()?.pane);
  }

  button(t, id, icon, command, args) {
    return div()
      .id(id)
      .p(3)
      .rounded(4)
      .text_color(t.dim)
      .hover((s) => s.bg(t.hover).text_color(t.foreground))
      .on_click((_e, cx) => {
        cx.stop_propagation();
        run(command, args);
      })
      .child(svg(`mods/inferno-pane/${icon}.svg`).size(14));
  }

  render(cx) {
    const t = theme();
    const p = this.me();
    if (!p) return div();
    const name = ((p.program?.agent || p.program?.shell) && p.program.name) || p.title || p.program?.name || "shell";
    const pic = icon(p.program, 14, t.accent);
    const st = p.status;
    const pane = p.pane;
    const node = String(p.terminal ?? pane).replace(/^.*\//, "").toUpperCase();
    const hud = (text, color) => div().flex_none().font_family("Cinzel").font_weight(700).text_size(9.5).text_color(color).child(text);
    return h_flex()
      .id(`pane-head-${pane}`)
      .size_full()
      .px(10)
      .gap(8)
      .items_center()
      .bg(p.focused ? "#1c120b" : "#0e0907")
      .border_b(1)
      .border_color(p.focused ? t.accent : "#5a4026")
      .text_size(12)
      .on_hover((hovered, cx) => { this.hovered = hovered; cx.notify(); })
      .on_click(() => run("pane.focus", { pane }))
      .child(div().flex_none().px(4).border(1).border_color("#5a4026").font_family("Cinzel").text_size(9).text_color("#8a6a3a").child(node))
      .when(Boolean(pic), (el) => el.child(pic))
      .child(div().flex_none().truncate().max_w(260).font_weight(700).font_family("Cinzel").text_color(p.focused ? "#e8cf8a" : t.foreground).child(name))
      .child(div().flex_1().truncate().text_color(t.dim).child(folder(p.cwd)))
      .when(st === "working", el => el.child(h_flex().gap(5).items_center().child(hud("IN BATTLE", "#a9b8ff")).child(svg("mods/workspace-chrome/spinner.svg").size(11).flex_none().text_color(t.working).spin(900))))
      .when(st === "blocked", el => el.child(div().flex_none().px(5).border(1).border_color(t.blocked).loop("opacity", { from: 0.25, to: 1, period: 700 }).child(hud("NEEDS YOU", t.blocked))))
      .when(st === "done", el => el.child(hud("VICTORIOUS", t.done)))
      .when(this.hovered, el => el
        .child(this.button(t, `ph-r-${pane}`, "split-right", "pane.split", { direction: "right", pane }))
        .child(this.button(t, `ph-d-${pane}`, "split-down", "pane.split", { direction: "down", pane }))
        .child(this.button(t, `ph-z-${pane}`, p.zoomed ? "unzoom" : "zoom", "pane.zoom", { pane }))
        .child(this.button(t, `ph-x-${pane}`, "close", "pane.close", { pane })));
  }
}
