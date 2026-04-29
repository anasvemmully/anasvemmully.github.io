const Tweet = ({ id }: { id: string }) => {
  return (
    <div className="flex justify-center my-8">
      <div className="w-full max-w-[550px] p-4 border border-border rounded-2xl bg-white shadow-sm text-center italic">
        <p className="text-text-secondary">Twitter embed placeholder for ID: {id}</p>
        <p className="text-xs text-text-secondary mt-2">(Use react-tweet for live embeds)</p>
      </div>
    </div>
  );
};

export default Tweet;
