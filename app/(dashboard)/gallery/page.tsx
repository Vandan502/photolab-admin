import ImageGallery from "@/components/ImageGallery";

export default function GalleryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Image Gallery</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all your Google Drive images</p>
        </div>
      </div>
      
      <ImageGallery />
    </div>
  );
}
