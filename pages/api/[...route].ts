import { Hono } from "hono";
import { handle } from "@hono/node-server/vercel";
import type { PageConfig } from "next";
import { allowedFIDS } from "./allowlist";

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
  // runtime: "edge",
};

const app = new Hono().basePath("/api");

app.get("/fartherTips", async (c) => {
  const fid = c.req.query().fid;

  const isUserSubscribedRequest = await fetch(
    `https://alfafrens.com/api/v0/isUserByFidSubscribedToChannel?channelAddress=0xd92766c4e3e02d18fd46a8a510b91d65d9fc51de&fid=${fid}`,
    {
      headers: {
        ContentType: "application/json",
      },
    }
  );

  const isUserSubscribed: boolean = await isUserSubscribedRequest.json();
  const isInAllowlist = allowedFIDS.includes(parseInt(fid));

  if (isInAllowlist || isUserSubscribed) {
    const encodedRequest = encodeURIComponent(JSON.stringify({ fid }));
    const requestTips = await fetch(
      `https://farther.social/api/v1/public.user.byFid?input=${encodedRequest}`,
      {
        headers: {
          ContentType: "application/json",
        },
      }
    );

    const tips = await requestTips.json();

    return c.json(tips.result.data.tips, 200);
  } else {
    return c.json(false, 200);
  }
});

app.get("/farther-widget-script", async (c) => {
  let script;
  const fid = c.req.query().fid;

  const requestIsAllowlisted = await fetch(
    `https://ham-api.leovido.xyz/api/fartherTips?fid=${fid}`,
    {
      headers: {
        ContentType: "application/json",
      },
    }
  );

  const isUserAllowlisted: boolean =
    requestIsAllowlisted.ok && (await requestIsAllowlisted.json());

  if (isUserAllowlisted) {
    script = `
    (async () => {
      const response = await new Request('https://ham-api.leovido.xyz/api/fartherTips?fid=${fid}').loadJSON();

      if (response.error) {
        const w = new ListWidget();
        w.addText("Error: " + response.error);
        Script.setWidget(w);
        Script.complete();
        w.presentMedium();
        return;
      }

      const { totals, currentCycle } = response;
      const totalTippedToday = totals.givenAmount
      const todaysAllocation = currentCycle.allowance
      const balance = numberWithCommas((currentCycle.userBalance / 1000000000000000000).toFixed(2))

      const titleFont = new Font("Avenir-Black", 12); // Reduced font size for the title
      const bodyFont = Font.boldRoundedSystemFont(16); // Reduced font size for the body
      const largeBodyFont = Font.boldRoundedSystemFont(20); // Increased font size for the daily tips

      const w = new ListWidget();
      w.backgroundColor = new Color("#1E3A8A");
      w.font = titleFont;

      const hStack = w.addStack();
      hStack.layoutHorizontally();

      const scoreStack = hStack.addStack();
      scoreStack.layoutVertically();
      scoreStack.centerAlignContent();
      scoreStack.font = titleFont;

      const communityScoreHeader = scoreStack.addText("✨ Balance");
      communityScoreHeader.textColor = new Color("#FFD700");
      communityScoreHeader.font = titleFont;
      communityScoreHeader.centerAlignText();

      const score = scoreStack.addText(numberWithCommas(balance));
      score.textColor = Color.white();
      score.font = bodyFont;
      score.centerAlignText();
      score.minimumScaleFactor = 0.5;

      // Add another spacer for space-around effect
      hStack.addSpacer();

      const tipMinimumStack = hStack.addStack();
      tipMinimumStack.layoutVertically();
      tipMinimumStack.font = titleFont;
      tipMinimumStack.centerAlignContent();

      const tipMinHeader = tipMinimumStack.addText("Min✨");
      tipMinHeader.textColor = new Color("#FFD700");
      tipMinHeader.font = titleFont;
      tipMinHeader.centerAlignText();
      tipMinHeader.minimumScaleFactor = 0.5;

      const percentage = tipMinimumStack.addText(\`\${numberWithCommas(currentCycle.tipMinimum)}\`);
      percentage.textColor = Color.white();
      percentage.font = bodyFont;
      percentage.centerAlignText();

      w.addSpacer(8);

      const allowanceHeader = w.addText("Daily ✨");
      allowanceHeader.textColor = new Color("#FFD700");
      allowanceHeader.font = titleFont;

      const dailyRemaining = currentCycle.remainingAllowance || currentCycle.allowance;
      const dailyRemainingFormatted = numberWithCommas(dailyRemaining.toFixed(0));
      const remainingFormatted = numberWithCommas(currentCycle.allowance);

      const a = w.addText(\`\${dailyRemainingFormatted}/\${remainingFormatted}\`);
      a.textColor = Color.white();
      a.font = largeBodyFont; // Use the larger font size for the daily tips
      a.minimumScaleFactor = 0.5;

      w.addSpacer(8);

      const receivedStack = w.addStack();
      receivedStack.layoutVertically();
      receivedStack.font = titleFont;

      const receivedText = receivedStack.addText("Received ✨");
      receivedText.font = titleFont;
      receivedText.textColor = new Color("#FFD700");

      const receivedFormatted = numberWithCommas(totals.receivedAmount);

      const r = receivedStack.addText(receivedFormatted);
      r.textColor = Color.white();
      r.font = bodyFont;

      w.url = "https://farcaster.xyz/~/channel/farther";
      Script.setWidget(w);
      Script.complete();

      w.presentMedium();

      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }

      function formatInt(x) {
        return x / 1000000000000000000;
      }

    })();
  `;
  } else {
    script = `
    (async () => {
      const w = new ListWidget();

      const bodyFont = Font.boldRoundedSystemFont(14);

      w.backgroundColor = new Color("#01153B");
      w.textColor = new Color("#F4D35E");
      w.font = bodyFont;

      const hStack = w.addStack();
      hStack.layoutHorizontally();

      const header = hStack.addText("Subscribe to @leovido.eth's Alfafrens channel to get access to this widget. Tap here");
      header.textColor = new Color("#F4D35E");
      header.font = bodyFont;

      w.url = "https://www.alfafrens.com/channel/0xd92766c4e3e02d18fd46a8a510b91d65d9fc51de";
      Script.setWidget(w);
      Script.complete();

      w.presentMedium();

    })();
  `;
  }

  return c.body(script, 200, {
    "Content-Type": "text/javascript",
  });
});

app.get("/hamTips", async (c) => {
  const fid = c.req.query().fid;

  const isUserSubscribedRequest = await fetch(
    `https://alfafrens.com/api/v0/isUserByFidSubscribedToChannel?channelAddress=0xd92766c4e3e02d18fd46a8a510b91d65d9fc51de&fid=${fid}`,
    {
      headers: {
        ContentType: "application/json",
      },
    }
  );

  const isUserSubscribed: boolean = await isUserSubscribedRequest.json();
  const isInAllowlist = allowedFIDS.includes(parseInt(fid));

  if (isInAllowlist || isUserSubscribed) {
    const requestTips = await fetch(
      `https://farcaster.dep.dev/ham/user/${fid}`,
      {
        headers: {
          ContentType: "application/json",
        },
      }
    );

    const tips = await requestTips.json();

    return c.json(tips, 200);
  } else {
    return c.json(false, 200);
  }
});

app.get("/widget-script", async (c) => {
  let script;
  const fid = c.req.query().fid;

  const requestIsAllowlisted = await fetch(
    `https://ham-api.leovido.xyz/api/hamTips?fid=${fid}`,
    {
      next: {
        revalidate: 3600, // 1 hour
      },
      headers: {
        ContentType: "application/json",
      },
    }
  );

  const isUserAllowlisted: boolean =
    requestIsAllowlisted.ok && (await requestIsAllowlisted.json());

  if (isUserAllowlisted) {
    script = `
    (async () => {
      const response = await new Request('https://ham-api.leovido.xyz/api/hamTips?fid=${fid}').loadJSON();

      if (response.error) {
        const w = new ListWidget();
        w.addText("Error: " + response.error);
        Script.setWidget(w);
        Script.complete();
        w.presentMedium();
        return;
      }

      const { totalTippedToday, todaysAllocation, balance, hamScore, rank, percentTipped } = response;

      const titleFont = new Font("Avenir-Black", 12); // Reduced font size for the title
      const bodyFont = Font.boldRoundedSystemFont(16); // Reduced font size for the body
      const largeBodyFont = Font.boldRoundedSystemFont(20); // Increased font size for the daily tips

      const w = new ListWidget();
      w.backgroundColor = new Color("#01153B");
      w.font = titleFont;

      const hStack = w.addStack();
      hStack.layoutHorizontally();

      const scoreStack = hStack.addStack();
      scoreStack.layoutVertically();
      scoreStack.centerAlignContent();
      scoreStack.font = titleFont;

      const communityScoreHeader = scoreStack.addText("🍖 Score");
      communityScoreHeader.textColor = new Color("#F4D35E");
      communityScoreHeader.font = titleFont;
      communityScoreHeader.centerAlignText();

      const score = scoreStack.addText(numberWithCommas(hamScore.toFixed(2)));
      score.textColor = Color.white();
      score.font = bodyFont;
      score.centerAlignText();

      // Add another spacer for space-around effect
      hStack.addSpacer();

      const percentageStack = hStack.addStack();
      percentageStack.layoutVertically();
      percentageStack.font = titleFont;
      percentageStack.centerAlignContent();

      const percentageHeader = percentageStack.addText("Tipped");
      percentageHeader.textColor = new Color("#F4D35E");
      percentageHeader.font = titleFont;
      percentageHeader.centerAlignText();

      const percentage = percentageStack.addText(\`\${numberWithCommas((percentTipped * 100).toFixed(2))}%\`);
      percentage.textColor = Color.white();
      percentage.font = bodyFont;
      percentage.centerAlignText();
      percentage.minimumScaleFactor = 0.8;

      w.addSpacer(8);

      const allowanceHeader = w.addText("Daily 🍖");
      allowanceHeader.textColor = new Color("#F4D35E");
      allowanceHeader.font = titleFont;

      const dailyRemaining = formatInt(todaysAllocation) - formatInt(totalTippedToday);
      const dailyRemainingFormatted = numberWithCommas(dailyRemaining.toFixed(0));
      const remainingFormatted = numberWithCommas(formatInt(todaysAllocation).toFixed(0));

      const a = w.addText(\`\${dailyRemainingFormatted}/\${remainingFormatted}\`);
      a.textColor = Color.white();
      a.font = largeBodyFont; // Use the larger font size for the daily tips
      a.minimumScaleFactor = 0.5;

      w.addSpacer(8);

      const receivedStack = w.addStack();
      receivedStack.layoutVertically();
      receivedStack.font = titleFont;

      const receivedText = receivedStack.addText("Received 🍖");
      receivedText.font = titleFont;
      receivedText.textColor = new Color("#F4D35E");

      const receivedFormatted = numberWithCommas(formatInt(balance.ham).toFixed(2));

      const r = receivedStack.addText(receivedFormatted);
      r.textColor = Color.white();
      r.font = bodyFont;

      w.url = "https://farcaster.xyz/~/channel/lp";
      Script.setWidget(w);
      Script.complete();

      w.presentMedium();

      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }

      function formatInt(x) {
        return x / 1000000000000000000;
      }

    })();
  `;
  } else {
    script = `
    (async () => {
      const w = new ListWidget();

      const bodyFont = Font.boldRoundedSystemFont(14);

      w.backgroundColor = new Color("#01153B");
      w.textColor = new Color("#F4D35E");
      w.font = bodyFont;

      const hStack = w.addStack();
      hStack.layoutHorizontally();

      const header = hStack.addText("Subscribe to @leovido.eth's Alfafrens channel to get access to this widget. Tap here");
      header.textColor = new Color("#F4D35E");
      header.font = bodyFont;

      w.url = "https://www.alfafrens.com/channel/0xd92766c4e3e02d18fd46a8a510b91d65d9fc51de";
      Script.setWidget(w);
      Script.complete();

      w.presentMedium();

    })();
  `;
  }

  return c.body(script, 200, {
    "Content-Type": "text/javascript",
  });
});

export default handle(app);
