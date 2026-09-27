import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "./style.css";

const lenis = new Lenis({ autoRaf: true });

const letters = [...document.querySelectorAll(".o")];

// The gradient's default centre is the middle of the span box (font ascent + descent), which sits
// above the middle of a lowercase "o". Measure the glyph and centre the sweep on it, in em so it
// survives any font-size change.
function centreSweep() {
  const style = getComputedStyle(letters[0]);
  const size = Number.parseFloat(style.fontSize);
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const glyph = ctx.measureText("o");

  const cx = (glyph.actualBoundingBoxRight - glyph.actualBoundingBoxLeft) / 2 / size;
  const cy =
    (glyph.fontBoundingBoxAscent - (glyph.actualBoundingBoxAscent - glyph.actualBoundingBoxDescent) / 2) / size;

  for (const letter of letters) {
    letter.style.setProperty("--ox", `${cx}em`);
    letter.style.setProperty("--oy", `${cy}em`);
  }
}

function renderProgress(progress) {
  for (const letter of letters) {
    letter.style.setProperty("--p", `${progress * 360}deg`);
  }
}

if (letters.length) {
  document.fonts.ready.then(centreSweep);
  renderProgress(lenis.progress);
  lenis.on("scroll", ({ progress }) => renderProgress(progress));
}
