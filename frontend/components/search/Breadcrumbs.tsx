import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Breadcrumb } from '../../services/category.service';

interface BreadcrumbsProps {
  items: Breadcrumb[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-sm mb-4">
      <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
        Главная
      </Link>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.id} className="flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            {isLast ? (
              <span className="font-bold text-xl text-gray-900">{item.title}</span>
            ) : (
              <Link
                href={`/category/${item.id}`}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.title}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
