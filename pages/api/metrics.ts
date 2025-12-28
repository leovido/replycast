import { NextApiRequest, NextApiResponse } from 'next';
import { register } from '../../utils/metrics';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  } catch (err) {
    res.status(500).send(err);
  }
}
