class PrettyPalette {
  constructor() {
    this.color = document.querySelectorAll(".color");
    this.currentHexes = document.querySelectorAll(".color h2");
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

      const icon = div.querySelector(".controls button");

      this.checkTextContrast(randomColor, icon);

      //   Initialize slider color
      const color = chroma(randomColor);
      const sliders = div.querySelectorAll(".sliders input");
      const [hue, brightness, saturation] = sliders; //destructuring

      this.colorizeSliders(color, hue, brightness, saturation);
    });
    //Reset Inputs
    this.resetInputs();
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

    //colorize input/sliders with movement if we change brightness saturation should be auto updated
    this.colorizeSliders(color, hue, brightness, saturation);
  }
  updateTextUi(index) {
    const currentDiv = this.color[index];
    const color = chroma(currentDiv.style.backgroundColor);

    const currentText = currentDiv.querySelector("h2");
    const icons = currentDiv.querySelectorAll(".controls button");

    currentText.innerText = color.hex();

    this.checkTextContrast(color, currentText);
    for (let icon of icons) {
      this.checkTextContrast(color, icon);
    }
  }
  resetInputs() {
    const sliderInputs = document.querySelectorAll(".sliders input");
    sliderInputs.forEach((slider) => {
      if (slider.name === "hue") {
        const hueColor = this.initialColors[slider.getAttribute("data-hue")];
        const hueValue = chroma(hueColor).hsl()[0]; // h=hue index 0
        slider.value = Math.floor(hueValue);
      }

      if (slider.name === "brightness") {
        const brightColor = this.initialColors[
          slider.getAttribute("data-bright")
        ];
        const brightValue = chroma(brightColor).hsl()[2]; //l=brightness index 2
        slider.value = Math.floor(brightValue * 100) / 100;
      }

      if (slider.name === "saturation") {
        const satColor = this.initialColors[slider.getAttribute("data-sat")];
        const satValue = chroma(satColor).hsl()[1]; //s = saturation index 1

        slider.value = Math.floor(satValue * 100) / 100;
      }
    });
  }
  copyToClipboard(hex) {
    const element = document.createElement("textarea");
    element.value = hex.innerText;
    document.body.appendChild(element);
    element.select();
    document.execCommand("copy");
    document.body.removeChild(element);

    //popup Animation
    const popup = document.querySelector(".copy-container");
    const popupBox = popup.children[0];
    popup.classList.add("active");
    popupBox.classList.add("active");

    popup.addEventListener("transitionend", () => {
      popup.classList.remove("active");
      popupBox.classList.remove("active");
    });
    //can also remove the class by setTimeout
    // setTimeout(() => {
    //   popup.classList.remove("active");
    //   popupBox.classList.remove("active");
    // }, 1000);
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

colorPalette.currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    colorPalette.copyToClipboard(hex);
  });
});
