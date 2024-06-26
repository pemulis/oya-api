import { Request, Response } from 'express';
import { pool } from './index';

export const saveBundle = async (req: Request, res: Response) => {
  const { bundle, nonce } = req.body;

  console.log("Received bundle:", JSON.stringify(bundle, null, 2));
  console.log("Received nonce:", nonce);

  if (!bundle || typeof nonce !== 'number') {
    return res.status(400).json({ error: 'Invalid bundle data' });
  }

  try {
    // Stringify the bundle before insertion
    const bundleString = JSON.stringify(bundle);

    console.log("Stringified bundle for DB:", bundleString);

    const result = await pool.query(
      'INSERT INTO bundles (bundle, nonce) VALUES ($1::jsonb, $2) RETURNING *',
      [bundleString, nonce]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database insertion error:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getBundle = async (req: Request, res: Response) => {
  const { nonce } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM bundles WHERE nonce = $1 ORDER BY timestamp DESC',
      [parseInt(nonce)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bundle not found' });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllBundles = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM bundles ORDER BY timestamp DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const saveCID = async (req: Request, res: Response) => {
  const { cid, nonce } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO cids (cid, nonce) VALUES ($1, $2) RETURNING *',
      [cid, nonce]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getCIDsByNonce = async (req: Request, res: Response) => {
  const { nonce } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM cids WHERE nonce = $1 ORDER BY timestamp DESC',
      [parseInt(nonce)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No CIDs found for the given nonce' });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};