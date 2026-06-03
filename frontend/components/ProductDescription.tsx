interface ProductDescriptionProps {
  description: string;
}

export default function ProductDescription({ description }: ProductDescriptionProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Описание</h2>
      <p className="text-gray-600 leading-relaxed whitespace-pre-line">{description}</p>
    </div>
  );
}
