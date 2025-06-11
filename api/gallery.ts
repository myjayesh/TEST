import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { category } = req.query;
  
  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid category parameter' });
  }

  // Validate environment variables
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(500).json({ error: 'Cloudinary configuration missing' });
  }

  try {
    console.log(`Fetching images from folder: ${category}`);
    
    const result = await cloudinary.search
      .expression(`folder:${category}`)
      .sort_by('public_id', 'desc')
      .max_results(100)
      .execute();

    console.log(`Found ${result.resources.length} images in folder: ${category}`);

    const images = result.resources.map((img: any) => ({
      public_id: img.public_id,
      secure_url: img.secure_url,
      context: img.context || {},
      tags: img.tags || [],
    }));

    res.status(200).json({ images, count: images.length });
  } catch (err: any) {
    console.error('Cloudinary API Error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch images from Cloudinary', 
      details: err.message 
    });
  }
}
