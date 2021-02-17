class PrettyPalette {
  constructor() {
    this.colorDivs = document.querySelectorAll(".color");
    this.allDivsHexes = document.querySelectorAll(".color h2");
    this.generateBtn = document.querySelector(".generate");
    this.allLockAndAdjustIcons = document.querySelectorAll(".controls button");
    this.allSliders = document.querySelectorAll("input[type='range']");
    this.allAdjusts = document.querySelectorAll(".adjust");
    this.allSlidersClose = document.querySelectorAll(".close-adjustment");
    this.allLocks = document.querySelectorAll(".lock");
    this.saveBtn = document.querySelector(".save");
    this.submitSaveBtn = document.querySelector(".submit-save");
    this.saveContainer = document.querySelector(".save-container");
    this.savePopup = document.querySelector(".save-popup");
    this.closeSave = document.querySelector(".close-save");
    this.library = document.querySelector(".library");
    this.libraryContainer = document.querySelector(".library-container");
    this.libraryPopup = document.querySelector(".library-popup");
    this.closeLibrary = document.querySelector(".close-library");
    this.saveInput = document.querySelector(".save-name");
    this.emptyBtn = document.querySelector(".empty");
    this.allHueSliders = document.querySelectorAll(".hue-input");
    this.allBrightnessSliders = document.querySelectorAll(".brightness-input");
    this.allSaturationSliders = document.querySelectorAll(".saturation-input");
    this.initialColors;
    this.savedPalette = [];
  }

  // EVENT LISTENERS-----------------------------------------------------------------------------------------------------

  eventListeners() {
    // Generate Button

    this.generateBtn.addEventListener("click", () => {
      this.applyColors();
    });

    //Save Button
    this.saveBtn.addEventListener("click", (e) => {
      this.saveContainer.classList.add("active");
      this.savePopup.classList.add("active");
    });
    this.closeSave.addEventListener("click", () => {
      this.saveContainer.classList.remove("active");
      this.savePopup.classList.remove("active");
    });
    this.submitSaveBtn.addEventListener("click", (e) => {
      this.savePalette();
    });

    // Library Button
    this.library.addEventListener("click", (e) => {
      this.libraryContainer.classList.add("active");
      this.libraryPopup.classList.add("active");
    });
    this.closeLibrary.addEventListener("click", () => {
      this.libraryContainer.classList.remove("active");
      this.libraryPopup.classList.remove("active");
    });

    this.allSliders.forEach((slider) => {
      slider.addEventListener("input", (e) => {
        this.hslControls(e);
      });
    });

    this.colorDivs.forEach((div, index) => {
      div.addEventListener("change", () => {
        this.updateTextUi(index);
      });
    });

    this.allDivsHexes.forEach((hex) => {
      hex.addEventListener("click", () => {
        this.copyToClipboard(hex);
      });
    });

    this.allAdjusts.forEach((adjustBtn, index) => {
      adjustBtn.addEventListener("click", (e) => {
        this.handleAdjust(e, index);
      });
    });

    this.allLocks.forEach((lock, index) => {
      lock.addEventListener("click", (e) => {
        this.handleLock(e, index);
      });
    });

    this.emptyBtn.addEventListener("click", () => {
      this.emptyLibrary();
    });
  }

  // FUNCTIONS---------------------------------------------------------------------------------------------------------------

  generateColors() {
    /* Generating colors manually
    const letters = "0123456789abcdef";
    let hash = "#";
    for (let i = 0; i < 6; i++) {
      hash += letters[Math.floor(Math.random() * 16)];
    }
    return hash;
    */
    return chroma.random().hex(); //using chroma library
  }

  applyColors() {
    this.initialColors = [];

    this.colorDivs.forEach((div, index) => {
      const hexText = div.children[0];
      const adjust = div.children[1].children[0];
      const lock = div.children[1].children[1];
      const randomColor = this.generateColors();

      // Add generated color to array
      if (div.classList.contains("locked")) {
        this.initialColors.push(hexText.innerText);
        return;
      } else {
        this.initialColors.push(randomColor);
      }
      // Set div background and hex text
      hexText.innerText = randomColor;
      div.style.background = randomColor;

      //contrast check
      this.checkTextIconContrast(randomColor, hexText, adjust, lock);

      //   Initialize slider color

      const eachDivHue = this.allHueSliders[index];
      const eachDivBrightness = this.allBrightnessSliders[index];
      const eachDivSaturation = this.allSaturationSliders[index];

      this.colorizeSliders(
        randomColor,
        eachDivHue,
        eachDivBrightness,
        eachDivSaturation
      );
    });

    //Reset Inputs
    this.resetInputs();
  }

  checkTextIconContrast(color, text, adjust, lock) {
    const luminance = chroma(color).luminance();

    text.style.color = luminance > 0.5 ? "black" : "white";
    adjust.style.color = luminance > 0.5 ? "black" : "white";
    lock.style.color = luminance > 0.5 ? "black" : "white";
  }

  colorizeSliders(color, hue, brightness, saturation) {
    //   Scale Saturation here .s means saturation .l means brightness .h means hue hence hsl(hue,sat,bright)
    const noSat = chroma(color).set("hsl.s", 0);
    const fullSat = chroma(color).set("hsl.s", 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);

    // Brightness
    const midBright = chroma(color).set("hsl.l", 0.5);
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

    this.colorDivs[index].style.backgroundColor = color;

    //colorize input/sliders with movement if we change brightness saturation should be auto updated
    this.colorizeSliders(color, hue, brightness, saturation);
  }
  updateTextUi(index) {
    const currentDiv = this.colorDivs[index];
    const color = chroma(currentDiv.style.backgroundColor);

    const currentText = currentDiv.querySelector("h2");
    const icons = currentDiv.querySelectorAll(".controls button");

    currentText.innerText = color.hex();

    this.checkTextIconContrast(color, currentText);
    for (let icon of icons) {
      this.checkTextIconContrast(color, icon);
    }
  }
  resetInputs() {
    const sliderInputs = document.querySelectorAll(".sliders input");

    sliderInputs.forEach((slider) => {
      if (slider.name === "hue") {
        const divHexColor = this.initialColors[slider.getAttribute("data-hue")];
        const hueValue = chroma(divHexColor).hsl()[0]; // h=hue index 0
        slider.value = Math.floor(hueValue);
      }

      if (slider.name === "brightness") {
        const divHexColor = this.initialColors[
          slider.getAttribute("data-bright")
        ];
        const brightValue = chroma(divHexColor).hsl()[2]; //l=brightness index 2
        slider.value = Math.floor(brightValue * 100) / 100;
      }

      if (slider.name === "saturation") {
        const divHexColor = this.initialColors[slider.getAttribute("data-sat")];
        const satValue = chroma(divHexColor).hsl()[1]; //s = saturation index 1

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
  handleAdjust(e, index) {
    const sliders = document.querySelectorAll(".sliders");
    sliders[index].classList.toggle("active");

    //Add event listener to close
    this.allSlidersClose.forEach((closeBtn, index) => {
      closeBtn.addEventListener("click", (e) => {
        sliders[index].classList.remove("active");
      });
    });
  }
  handleLock(e, index) {
    this.colorDivs[index].classList.toggle("locked");
    if (this.colorDivs[index].classList.contains("locked")) {
      this.allLocks[index].innerHTML = `<i class="fas fa-lock"></i>`;
    }
    if (!this.colorDivs[index].classList.contains("locked")) {
      this.allLocks[index].innerHTML = `<i class="fas fa-lock-open"></i>`;
    }
  }
  savePalette(e) {
    this.saveContainer.classList.remove("active");
    this.savePopup.classList.remove("active");
    const name = this.saveInput.value;
    let colors = [];
    this.allDivsHexes.forEach((hex) => {
      colors.push(hex.innerText);
    });
    //Generate object
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));

    let paletteNum;

    if (paletteObjects) {
      paletteNum = paletteObjects.length;
    } else {
      paletteNum = this.savedPalette.length;
    }

    const paletteObject = { name: name, colors: colors, Num: paletteNum }; //If name and value name is same we can just write name
    this.savedPalette.push(paletteObject);

    //Save to Local storage
    this.saveToLocal(paletteObject);
    this.saveInput.value = "";

    // Generate palette for library
    const palette = document.createElement("div");
    palette.classList.add("custom-palette");
    const title = document.createElement("h4");
    title.innerText = paletteObject.name;
    const preview = document.createElement("div");
    preview.classList.add("small-preview");

    paletteObject.colors.forEach((color) => {
      const smallDiv = document.createElement("div");
      smallDiv.style.backgroundColor = color;
      preview.appendChild(smallDiv);
    });

    const paletteBtn = document.createElement("button");

    paletteBtn.classList.add("pick-palette-btn");

    paletteBtn.classList.add(paletteObject.Num);
    paletteBtn.innerText = "Select";

    paletteBtn.addEventListener("click", (e) => {
      this.libraryContainer.classList.remove("active");
      this.libraryPopup.classList.remove("active");
      const paletteIndex = e.target.classList[1];

      this.initialColors = [];
      this.savedPalette[paletteIndex].colors.forEach((color, index) => {
        this.colorDivs[index].style.background = color;
        const text = this.colorDivs[index].children[0];

        this.checkTextIconContrast(color, text);
        this.updateTextUi(index);
      });
      this.resetInputs();
    });

    //Append to Library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    this.libraryPopup.appendChild(palette);
  }
  saveToLocal(obj) {
    let localPalettes;
    if (localStorage.getItem("palettes") === null) {
      localPalettes = [];
    } else {
      localPalettes = JSON.parse(localStorage.getItem("palettes"));
    }
    localPalettes.push(obj);
    localStorage.setItem("palettes", JSON.stringify(localPalettes));
  }

  getFromLocal() {
    let localPalettes;
    if (localStorage.getItem("palettes") === null) {
      localPalettes = [];
    } else {
      const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
      this.savedPalette = [...paletteObjects];
      paletteObjects.forEach((obj) => {
        const palette = document.createElement("div");
        palette.classList.add("custom-palette");
        const title = document.createElement("h4");
        title.innerText = obj.name;
        const preview = document.createElement("div");
        preview.classList.add("small-preview");
        obj.colors.forEach((color) => {
          const smallDiv = document.createElement("div");
          smallDiv.style.backgroundColor = color;
          preview.appendChild(smallDiv);
        });
        const paletteBtn = document.createElement("button");

        paletteBtn.classList.add("pick-palette-btn");

        paletteBtn.classList.add(obj.Num);
        paletteBtn.innerText = "Select";
        paletteBtn.addEventListener("click", (e) => {
          this.libraryContainer.classList.remove("active");
          this.libraryPopup.classList.remove("active");
          const paletteIndex = e.target.classList[1];

          this.initialColors = [];
          paletteObjects[paletteIndex].colors.forEach((color, index) => {
            this.initialColors.push(color);
            this.colorDivs[index].style.background = color;
            const text = this.colorDivs[index].children[0];

            this.checkTextIconContrast(color, text);
            this.updateTextUi(index);
          });
          this.resetInputs();
        });
        //Append to Library
        palette.appendChild(title);
        palette.appendChild(preview);
        palette.appendChild(paletteBtn);
        this.libraryPopup.appendChild(palette);
      });
    }
  }

  emptyLibrary() {
    localStorage.clear();
  }
}

// OBJECT CREATION ----------------------------------------------------------------------------------------------------------

const colorPalette = new PrettyPalette();

colorPalette.applyColors();

colorPalette.getFromLocal();
colorPalette.eventListeners();
