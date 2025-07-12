const { expect } = require("@jest/globals");
require("./scriptable-mock");
const runWidgetScript = require("./widget-script");

test("Widget displays used and allowance correctly", async () => {
  global.args = { widgetParameter: "test-fid" };
  await runWidgetScript();
  const widget = Script.widget;
  const usedText = widget.widgets.find(
    (w) => w.text && w.text.includes("Used:")
  ).text;
  const allowanceText = widget.widgets.find(
    (w) => w.text && w.text.includes("Allowance:")
  ).text;
  expect(usedText).toBe("Used: 10");
  expect(allowanceText).toBe("Allowance: 20");
});
