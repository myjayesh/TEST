import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v2 as cloudinary } from 'cloudinary';

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { category } = req.query;
  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid category' });
  }
  try {
    const folder = category;
    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      .sort_by('public_id','desc')
      .max_results(100)
      .execute();
    const images = result.resources.map((img: any) => ({
      public_id: img.public_id,
      secure_url: img.secure_url,
      context: img.context || {},
      tags: img.tags || [],
    }));
    res.status(200).json({ images });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch images', details: err.message });
  }
} 