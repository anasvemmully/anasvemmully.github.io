const AdBanner = () => {
  return (
    <div className="my-12 p-8 border-2 border-dashed border-border rounded-3xl bg-bg-alt/30 flex flex-col items-center justify-center text-center gap-2 overflow-hidden">
      <p className="text-xs font-bold uppercase tracking-widest text-text-secondary/50">Advertisement</p>
      <div className="w-full max-w-md h-32 flex items-center justify-center">
        <p className="text-text-secondary italic">Your AdSense Banner Will Appear Here</p>
      </div>
    </div>
  );
};

export default AdBanner;
