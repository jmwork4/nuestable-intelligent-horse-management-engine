import { useState } from 'react';
import { Card, EmptyState, Button, Modal } from '@/components/ui';
import { PhotoIcon, PlusIcon } from '@heroicons/react/24/outline';

interface MediaTabProps {
  horseId: string;
}

interface MediaItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
  caption: string;
  uploadedAt: string;
}

export function MediaTab({ horseId }: MediaTabProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // In a real app this would come from an API hook
  const media: MediaItem[] = [];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button icon={<PlusIcon className="h-4 w-4" />} size="sm">
          Upload Media
        </Button>
      </div>

      {media.length === 0 ? (
        <EmptyState
          icon={<PhotoIcon className="mx-auto h-12 w-12" />}
          title="No media yet"
          message="Upload photos and videos to build a gallery for this horse"
          action={{ label: 'Upload Media', onClick: () => {} }}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
              onClick={() => setSelectedMedia(item)}
            >
              {item.type === 'photo' ? (
                <img
                  src={item.url}
                  alt={item.caption}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <video src={item.url} className="h-full w-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-xs text-white">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Modal open={!!selectedMedia} onClose={() => setSelectedMedia(null)} size="xl">
        {selectedMedia && (
          <div>
            {selectedMedia.type === 'photo' ? (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.caption}
                className="w-full rounded-lg"
              />
            ) : (
              <video src={selectedMedia.url} controls className="w-full rounded-lg" />
            )}
            {selectedMedia.caption && (
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{selectedMedia.caption}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
