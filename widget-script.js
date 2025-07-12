async function runWidgetScript() {
  const fid = args.widgetParameter || "default";
  const response = await new Request(
    `https://your-backend-service.com/hamTips?fid=${encodeURIComponent(fid)}`
  ).loadJSON();

  let widget = new ListWidget();

  if (response.error) {
    widget.addText("Error: " + response.error);
  } else {
    const { used, allowance } = response;

    // Widget background and fonts
    widget.backgroundColor = new Color("#01153B");
    const titleFont = new Font("Avenir-Black", 14);
    const bodyFont = Font.boldRoundedSystemFont(18);

    const size = config.widgetFamily;
    let canvasSize;
    let radius;

    if (size === "small") {
      canvasSize = new Size(100, 100);
      radius = 40;
    } else if (size === "medium") {
      canvasSize = new Size(200, 100);
      radius = 80;
    } else {
      canvasSize = new Size(300, 150);
      radius = 120;
    }

    // Add title
    const titleStack = widget.addStack();
    const titleText = titleStack.addText("Daily Allowance");
    titleText.font = titleFont;
    titleText.textColor = new Color("#F4D35E");

    widget.addSpacer(8);

    // Create a canvas to draw the semi-circle
    const canvas = new DrawContext();
    canvas.size = canvasSize;
    canvas.opaque = false;
    canvas.setTextAlignedCenter();

    // Draw background circle
    canvas.setFillColor(new Color("#F4D35E"));
    const center = new Point(canvasSize.width / 2, canvasSize.height / 2);
    canvas.fillEllipse(
      new Rect(center.x - radius, center.y - radius, radius * 2, radius * 2)
    );

    // Draw foreground semi-circle
    const proportion = used / allowance;
    const startAngle = Math.PI;
    const endAngle = Math.PI * (1 + proportion);

    // Create path for semi-circle
    const path = new Path();
    path.move(center);
    for (let angle = startAngle; angle <= endAngle; angle += 0.01) {
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      path.addLine(new Point(x, y));
    }
    path.addLine(center);
    path.closeSubpath();

    // Fill the semi-circle
    canvas.setFillColor(new Color("#FF6347"));
    canvas.addPath(path);
    canvas.fillPath();

    // Add the canvas to the widget
    const image = canvas.getImage();
    widget.addImage(image);

    widget.addSpacer(8);

    // Add text for used and allowance
    const usedText = widget.addText(
      `Used: ${numberWithCommas(used.toFixed(0))}`
    );
    usedText.font = bodyFont;
    usedText.textColor = Color.white();

    const allowanceText = widget.addText(
      `Allowance: ${numberWithCommas(allowance.toFixed(0))}`
    );
    allowanceText.font = bodyFont;
    allowanceText.textColor = Color.white();
  }

  Script.setWidget(widget);
  widget.presentMedium();
  Script.complete();
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = runWidgetScript;
