/* theme.js — 暗色模式：localStorage 持久化 + 系统偏好兜底 + 切换按钮 + T 快捷键
   在 <head> 内同步加载（无 defer），首帧前写入 data-theme，避免明暗闪烁。
   暴露 window.CVTheme.toggle() 供其他脚本调用。 */
(function () {
  "use strict";

  var KEY = "cv-slides-theme";
  var root = document.documentElement;

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function preferred() {
    var s = stored();
    if (s === "dark" || s === "light") return s;
    return (window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark" : "light";
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      var dark = theme === "dark";
      btn.setAttribute("aria-pressed", dark ? "true" : "false");
      btn.title = dark ? "切换到浅色模式（T）" : "切换到暗色模式（T）";
      btn.setAttribute("aria-label", btn.title);
      btn.querySelector(".tt-icon").textContent = dark ? "☀" : "☾";
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#101116" : "#e9e7e1");
  }

  function toggle() {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    try { localStorage.setItem(KEY, next); } catch (e) {}
    /* 只在用户主动切换时播放过渡，避免首次加载闪烁 */
    root.classList.add("theme-anim");
    apply(next);
    setTimeout(function () { root.classList.remove("theme-anim"); }, 420);
  }

  window.CVTheme = { toggle: toggle, apply: apply };

  /* 首帧前定主题 */
  apply(preferred());

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.createElement("button");
    btn.id = "theme-toggle";
    btn.type = "button";
    btn.innerHTML = '<span class="tt-icon" aria-hidden="true">☾</span>';
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      toggle();
    });
    document.body.appendChild(btn);
    apply(root.getAttribute("data-theme"));
  });

  /* T 切换主题；与 slides.js 的按键约定一致：修饰键按下时不响应 */
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = e.target && e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key === "t" || e.key === "T") toggle();
  });
})();
