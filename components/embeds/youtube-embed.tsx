type Props = {
  videoId: string;
  title?: string;
};

export default function YoutubeEmbed({ videoId, title = "Video de YouTube" }: Props) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-slate-800 bg-black">
      <div className="aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}
