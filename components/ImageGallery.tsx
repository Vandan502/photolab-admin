"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Download, Copy, Trash2, Search, X, Maximize2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

type ImageFile = {
  id: string;
  name: string;
  url: string;
  size: string;
  date: string;
};

export default function ImageGallery() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/images");
      const data = await res.json();
      if (data.success) {
        setImages(data.images);
      } else {
        toast.error(data.error || "Failed to fetch images");
      }
    } catch (error) {
      toast.error("An error occurred while fetching images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
    // Listen for custom event from UploadCard
    window.addEventListener("imagesUploaded", fetchImages);
    return () => window.removeEventListener("imagesUploaded", fetchImages);
  }, []);

  const filteredImages = images.filter((img) =>
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Image URL copied to clipboard!");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image from Google Drive?")) return;
    
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/images/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setImages(images.filter((img) => img.id !== id));
        toast.success("Image deleted successfully");
        if (selectedImage?.id === id) setSelectedImage(null);
      } else {
        toast.error(data.error || "Failed to delete image");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the image");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDownload = async (url: string, name: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="glass-card p-4 rounded-xl flex items-center gap-3 w-full max-w-md">
        <Search className="text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search images by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-none focus:outline-none text-gray-700"
        />
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-gray-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
          <p>Loading your images...</p>
        </div>
      ) : filteredImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <div key={image.id} className="group glass-card rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-square cursor-pointer" onClick={() => setSelectedImage(image)}>
                <Image
                  src={image.url}
                  alt={image.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Maximize2 className="text-white w-8 h-8" />
                </div>
              </div>
              <div className="p-4 bg-white/50 backdrop-blur-sm">
                <p className="font-medium text-gray-900 truncate" title={image.name}>{image.name}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{image.size}</span>
                  <span>{image.date}</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200/60">
                  <button onClick={() => handleCopyUrl(image.url)} className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Copy URL">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDownload(image.url, image.name)} className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(image.id)} 
                    disabled={isDeleting === image.id}
                    className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" 
                    title="Delete"
                  >
                    {isDeleting === image.id ? (
                      <span className="block w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center rounded-xl flex flex-col items-center justify-center text-gray-500">
          <Image src="/logo.png" alt="No images" width={64} height={64} className="opacity-20 mb-4" />
          <p className="text-lg font-medium text-gray-700">No images found</p>
          <p className="text-sm mt-1">Try adjusting your search or upload new images.</p>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col glass-card rounded-2xl overflow-hidden bg-white/10 border-white/20">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/50">
              <h3 className="text-lg font-medium text-white truncate">{selectedImage.name}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => handleCopyUrl(selectedImage.url)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Copy className="w-5 h-5" />
                </button>
                <button onClick={() => handleDownload(selectedImage.url, selectedImage.name)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Download className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-white/20 mx-1" />
                <button onClick={() => setSelectedImage(null)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="relative flex-1 min-h-[50vh] p-4 flex items-center justify-center bg-black/30">
              <div className="relative w-full h-full max-h-[70vh]">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
