type Props = {
  children: React.ReactNode;
};

export default function Container({ children }: Props) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {children}
    </div>
  );
}
