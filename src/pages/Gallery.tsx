import { useState, useEffect } from "react";

// Replace with your actual Cloudinary cloud name
const CLOUD_NAME = "your_cloud_name";

const CATEGORY_TO_FOLDER = {
  "single-ekat": "single-ekat",
  "semi-ekat": "semi-ekat",
  "double-ekat": "double-ekat",
  "more": "more",
};

type Category = "all" | "single-ekat" | "semi-ekat" | "double-ekat" | "more";

type CloudinaryImage = {
  public_id: string;
  secure_url: string;
  context?: any;
  tags?: string[];
};

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState<Category>("all");
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      try {
        let allImages: CloudinaryImage[] = [];
        if (activeFilter === "all") {
          // Fetch from all folders and merge
          const folderKeys = Object.values(CATEGORY_TO_FOLDER);
          const results = await Promise.all(
            folderKeys.map(async (folder) => {
              const res = await fetch(`/api/gallery?category=${folder}`);
              if (!res.ok) return [];
              const data = await res.json();
              return data.images || [];
            })
          );
          allImages = results.flat();
        } else {
          // Fetch from selected folder
          const res = await fetch(`/api/gallery?category=${CATEGORY_TO_FOLDER[activeFilter]}`);
          if (!res.ok) throw new Error("Failed to fetch images");
          const data = await res.json();
          allImages = data.images || [];
        }
        setImages(allImages);
      } catch (err: any) {
        setError("Could not load images. Please try again later.");
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [activeFilter]);

  const filters = [
    { key: "all" as Category, label: "All" },
    { key: "single-ekat" as Category, label: "Single Ekat" },
    { key: "semi-ekat" as Category, label: "Semi Ekat" },
    { key: "double-ekat" as Category, label: "Double Ekat" },
    { key: "more" as Category, label: "More" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <h1 className="text-foreground text-3xl md:text-4xl font-bold leading-tight">Gallery</h1>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-accent"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Loading images...</p>
          </div>
        )}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        )}

        {/* Gallery Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((item, index) => (
              <div
                key={item.public_id}
                className="group aspect-square rounded-xl overflow-hidden relative bg-cover bg-center hover-lift animate-fade-in cursor-pointer"
                style={{
                  backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 60%), url('${item.secure_url}')`,
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* You can add more metadata here if you store it in Cloudinary */}
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <p className="text-white text-lg font-bold leading-tight">
                    {/* No price info unless you store it in Cloudinary metadata */}
                  </p>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white font-medium bg-primary/80 px-4 py-2 rounded-full">
                    View Details
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && images.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No items found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
