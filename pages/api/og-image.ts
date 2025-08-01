import type { NextApiRequest, NextApiResponse } from "next";
import satori from "satori";
import { join } from "path";
import { readFileSync } from "fs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const fontPath = join(
      process.cwd(),
      "public",
      "InstrumentSans-Regular.otf"
    );
    const fontData = readFileSync(fontPath);

    const svg = await satori(
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "1200",
            height: "630",
            background: "linear-gradient(135deg, #6C2BD7 0%, #1CB5E0 100%)",
            color: "white",
            fontFamily: "Instrument Sans",
            padding: "60px",
            position: "relative",
          },
          children: [
            // Background pattern
            {
              type: "div",
              props: {
                style: {
                  position: "absolute",
                  top: "0",
                  left: "0",
                  right: "0",
                  bottom: "0",
                  opacity: "0.1",
                  background:
                    "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                },
              },
            },
            // Main content
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: "1",
                },
                children: [
                  {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "64px",
                        fontWeight: "700",
                        marginBottom: "30px",
                        textAlign: "center",
                        textShadow: "0 4px 8px rgba(0,0,0,0.3)",
                      },
                      children: "📝 ReplyCast",
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "36px",
                        fontWeight: "600",
                        textAlign: "center",
                        marginBottom: "30px",
                        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      },
                      children: "Never miss a reply again",
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "28px",
                        fontWeight: "400",
                        textAlign: "center",
                        opacity: 0.9,
                        maxWidth: "800px",
                        lineHeight: "1.4",
                      },
                      children:
                        "Track and reply to your unreplied Farcaster conversations",
                    },
                  },
                  // Feature highlights
                  {
                    type: "div",
                    props: {
                      style: {
                        display: "flex",
                        justifyContent: "center",
                        gap: "40px",
                        marginTop: "40px",
                      },
                      children: [
                        {
                          type: "div",
                          props: {
                            style: {
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              fontSize: "20px",
                              opacity: 0.8,
                            },
                            children: [
                              {
                                type: "div",
                                props: {
                                  style: {
                                    fontSize: "32px",
                                    marginBottom: "8px",
                                  },
                                  children: "🔍",
                                },
                              },
                              {
                                type: "div",
                                props: { children: "Find Unreplied" },
                              },
                            ],
                          },
                        },
                        {
                          type: "div",
                          props: {
                            style: {
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              fontSize: "20px",
                              opacity: 0.8,
                            },
                            children: [
                              {
                                type: "div",
                                props: {
                                  style: {
                                    fontSize: "32px",
                                    marginBottom: "8px",
                                  },
                                  children: "⚡",
                                },
                              },
                              {
                                type: "div",
                                props: { children: "Quick Reply" },
                              },
                            ],
                          },
                        },
                        {
                          type: "div",
                          props: {
                            style: {
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              fontSize: "20px",
                              opacity: 0.8,
                            },
                            children: [
                              {
                                type: "div",
                                props: {
                                  style: {
                                    fontSize: "32px",
                                    marginBottom: "8px",
                                  },
                                  children: "📊",
                                },
                              },
                              {
                                type: "div",
                                props: { children: "Track Progress" },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      } as any,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Instrument Sans",
            data: fontData,
            style: "normal",
          },
        ],
      }
    );

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).send(svg);
  } catch (error) {
    console.error("Error generating OG image:", error);
    res.status(500).json({ error: "Failed to generate image" });
  }
}
