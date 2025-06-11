// src/pages/api/gallery.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v2 as cloudinary } from 'cloudinary';

// Destructure environment variables for Cloudinary configuration
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

// Ensure the Cloudinary config is set up correctly
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true, // Recommended for https
  });
} else {
  console.error("Cloudinary environment variables are not set.");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { category } = req.query;

  // Check for missing category
  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid category parameter.' });
  }

  // Check if Cloudinary is configured
  if (!CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({ error: 'Cloudinary configuration is missing. Check environment variables.' });
  }

  try {
    const folder = category;
    console.log(`Searching for images in Cloudinary folder: "${folder}"`);

    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      .sort_by('public_id', 'desc')
      .max_results(100) // You can adjust this number
      .execute();

    console.log(`Found ${result.resources.length} images for folder: "${folder}".`);
    
    // Map the results to a cleaner format
    const images = result.resources.map((img: any) => ({
      public_id: img.public_id,
      secure_url: img.secure_url,
    }));

    return res.status(200).json({ images });

  } catch (err: any) {
    console.error('Error fetching from Cloudinary:', err);
    return res.status(500).json({ 
      error: 'Failed to fetch images from Cloudinary.', 
      details: err.message 
    });
  }
}
