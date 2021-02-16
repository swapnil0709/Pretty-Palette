class PrettyPalette {
  constructor() {
    this.color = document.querySelectorAll(".color");
    this.generateBtn = document.querySelector(".generate");
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
    this.color.forEach((div, index) => {
      const hexText = div.children[0];
      const randomColor = colorPalette.generateColors();

      hexText.innerText = randomColor;
      div.style.background = randomColor;

      //contrast check
      colorPalette.checkTextContrast(randomColor, hexText);
    });
  }
  generateButton() {
    this.generateBtn.addEventListener("click", () => {
      colorPalette.applyColors();
    });
  }
  checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    console.log(luminance);
    text.style.color = luminance > 0.5 ? "black" : "white";
  }
}

const colorPalette = new PrettyPalette();
colorPalette.applyColors();
colorPalette.generateButton();
