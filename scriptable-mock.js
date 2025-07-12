global.ListWidget = class {
  constructor() {
    this.backgroundColor = null;
    this.widgets = [];
  }
  addText(text) {
    const textWidget = new TextWidget(text);
    this.widgets.push(textWidget);
    return textWidget;
  }
  addImage(image) {
    const imageWidget = new ImageWidget(image);
    this.widgets.push(imageWidget);
  }
  addStack() {
    const stackWidget = new StackWidget();
    this.widgets.push(stackWidget);
    return stackWidget;
  }
  addSpacer() {}
  setWidget() {
    Script.widget = this;
  }
  presentMedium() {}
};

global.TextWidget = class {
  constructor(text) {
    this.text = text;
    this.font = null;
    this.textColor = null;
  }
};

global.ImageWidget = class {
  constructor(image) {
    this.image = image;
  }
};

global.Rect = class {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
};

global.StackWidget = class {
  constructor() {
    this.layout = "horizontal";
    this.font = null;
    this.widgets = [];
  }
  layoutHorizontally() {
    this.layout = "horizontal";
  }
  layoutVertically() {
    this.layout = "vertical";
  }
  addText(text) {
    const textWidget = new TextWidget(text);
    this.widgets.push(textWidget);
    return textWidget;
  }
};

global.Color = class {
  constructor(hex) {
    this.hex = hex;
  }
  static white() {
    return new Color("#FFFFFF");
  }
};

global.Font = class {
  constructor(name, size) {
    this.name = name;
    this.size = size;
  }
  static boldRoundedSystemFont(size) {
    return new Font("boldRoundedSystemFont", size);
  }
};

global.Request = class {
  constructor(url) {
    this.url = url;
  }
  async loadJSON() {
    if (this.url.includes("hamTips")) {
      return {
        used: 10,
        allowance: 20,
        error: null,
      };
    }
    return { error: "User is not subscribed to the channel" };
  }
};

global.DrawContext = class {
  constructor() {
    this.size = { width: 0, height: 0 };
    this.opaque = false;
  }
  setFillColor() {}
  fillEllipse() {}
  getImage() {
    return {};
  }
  addPath() {}
  fillPath() {}
  move() {}
  addLine() {}
  closeSubpath() {}
  setTextAlignedCenter() {}
  drawText() {}
};

global.Point = class {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
};

global.Size = class {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
};

global.Path = class {
  constructor() {
    this.path = [];
  }
  move(point) {
    this.path.push(point);
  }
  addLine(point) {
    this.path.push(point);
  }
  closeSubpath() {}
};

global.Script = {
  setWidget(widget) {
    Script.widget = widget;
  },
  complete() {},
};

global.config = {
  widgetFamily: "medium",
};
