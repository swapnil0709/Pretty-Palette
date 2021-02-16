class PrettyPalette {
  constructor() {
    this.color = document.querySelectorAll(".color");
    this.generateBtn = document.querySelector(".generate");
    this.sliders = document.querySelectorAll("input[type='range']");
    let initialColors;
  }

  generateColors() {
    /* Generating colors manually
    const letters = "0123456789abcdef";
    let hash = "#";
    for (let i = 0; i < 6; i++) {
      hash += letters[Math.floor(Math.random() * 16)];
    }
    return hash;
    */
    return chroma.random(); //using chroma library
  }
  applyColors() {
    this.initialColors = [];

    this.color.forEach((div, index) => {
      const hexText = div.children[0];
      const randomColor = this.generateColors();

      hexText.innerText = randomColor;
      div.style.background = randomColor;

      // Add generated color to array
      this.initialColors.push(randomColor.hex());

      //contrast check
      this.checkTextContrast(randomColor, hexText);

      //   Initialize slider color
      const color = chroma(randomColor);
      const sliders = div.querySelectorAll(".sliders input");
      const [hue, brightness, saturation] = sliders; //destructuring

      this.colorizeSliders(color, hue, brightness, saturation);
    });
  }
  generateButton() {
    this.generateBtn.addEventListener("click", () => {
      this.applyColors();
    });
  }
  checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();

    text.style.color = luminance > 0.5 ? "black" : "white";
  }
  colorizeSliders(color, hue, brightness, saturation) {
    //   Scale Saturation

    const noSat = color.set("hsl.s", 0);
    const fullSat = color.set("hsl.s", 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);

    // Brightness
    const midBright = color.set("hsl.l", 0.5);
    const scaleBright = chroma.scale(["black", midBright, "white"]);

    // Update Input colors
    saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
      0
    )},${scaleSat(1)})`;

    brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
      0.5
    )},${scaleBright(1)})`;

    hue.style.backgroundImage = `linear-gradient(to right,rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
  }

  hslControls(e) {
    const index =
      e.target.getAttribute("data-hue") ||
      e.target.getAttribute("data-bright") ||
      e.target.getAttribute("data-sat");

    //Getting each value in a single color div
    let slider = e.target.parentElement.querySelectorAll("input[type='range']");

    const [hue, brightness, saturation] = slider; //Extracting individual values
    const bgColor = this.initialColors[index];

    let color = chroma(bgColor)
      .set("hsl.s", saturation.value)
      .set("hsl.l", brightness.value)
      .set("hsl.h", hue.value);

    this.color[index].style.backgroundColor = color;
  }
  updateTextUi(index) {
    const currentDiv = this.color[index];
    const color = chroma(currentDiv.style.backgroundColor);

    const currentText = currentDiv.querySelector("h2");
    const icons = currentDiv.querySelectorAll(".controls button");

    currentText.innerText = color.hex();

    this.checkTextContrast(color, currentText);
    for (let icon of icons) {
      console.log(icon);
      this.checkTextContrast(color, icon);
    }
  }
}

const colorPalette = new PrettyPalette();
colorPalette.applyColors();
colorPalette.generateButton();

colorPalette.sliders.forEach((slider) => {
  slider.addEventListener("input", (e) => {
    colorPalette.hslControls(e);
  });
});

colorPalette.color.forEach((div, index) => {
  div.addEventListener("change", () => {
    colorPalette.updateTextUi(index);
  });
});
