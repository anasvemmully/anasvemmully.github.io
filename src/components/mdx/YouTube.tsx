const YouTube = ({ id }: { id: string }) => {
  return (
    <div className="relative w-full aspect-video my-8 rounded-2xl overflow-hidden shadow-xl border border-border">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
};

export default YouTube;
