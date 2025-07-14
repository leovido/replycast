import { NextApiRequest, NextApiResponse } from 'next'
import satori from 'satori'
import { join } from 'path'
import { readFileSync } from 'fs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const fontPath = join(process.cwd(), 'public', 'InstrumentSans-Regular.otf')
    const fontData = readFileSync(fontPath)

    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '1200',
            height: '630',
            background: 'linear-gradient(135deg, #6C2BD7 0%, #1CB5E0 100%)',
            color: 'white',
            fontFamily: 'Instrument Sans',
            padding: '60px',
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '48px',
                  fontWeight: '600',
                  marginBottom: '20px',
                  textAlign: 'center',
                },
                children: '📝 ReplyCast',
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '32px',
                  fontWeight: '400',
                  textAlign: 'center',
                  marginBottom: '40px',
                },
                children: 'Never miss a reply again',
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '24px',
                  fontWeight: '400',
                  textAlign: 'center',
                  opacity: 0.8,
                },
                children: 'Track and reply to your unreplied Farcaster conversations',
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
            name: 'Instrument Sans',
            data: fontData,
            style: 'normal',
          },
        ],
      }
    )

    res.setHeader('Content-Type', 'image/svg+xml')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.status(200).send(svg)
  } catch (error) {
    console.error('Error generating OG image:', error)
    res.status(500).json({ error: 'Failed to generate image' })
  }
} 