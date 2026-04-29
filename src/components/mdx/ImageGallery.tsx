import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
}

const ImageGallery = ({ images = [] }: ImageGalleryProps) => {
  return (
    <div className="relative w-full overflow-hidden my-12 py-8 bg-bg-alt/30 border-y border-border">
      <div className="flex gap-4 animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused] whitespace-nowrap">
        {[...images, ...images].map((src, i) => (
          <div
            key={i}
            className="relative h-[250px] aspect-[4/3] flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border border-border"
          >
            <Image
              src={src}
              alt={`Gallery image ${i}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
