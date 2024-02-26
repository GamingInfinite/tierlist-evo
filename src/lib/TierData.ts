export class Tier {
  name: string;
  elements: string[] = [];
  color: string;

  constructor(name: string, color: Colors) {
    this.name = name;
    this.color = color;
  }
}

export enum Colors {
  RED = "#FF7F7F", // S
  ORANGE = "#FFBF7F", // A
  YELLOWB = "#FFDF7F", // B
  YELLOWC = "#FFFF7F", // C
  GREEN = "#BFFF7F", // D
  BLUE = "#7fd0ff", // E
  BLACK = "#484b4d", // F
  PINK = "#e778eb",
}
