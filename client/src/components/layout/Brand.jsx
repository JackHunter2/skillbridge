import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { APP_NAME } from '../../config';

export default function Brand({ to = '/', dark = false }) {
    return (
        <Link to={to} className="inline-flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/30">
        <Sparkles className="h-5 w-5" />
      </span>
            <span className={`text-lg font-extrabold tracking-tight ${dark ? 'text-white' : 'text-navy'}`}>
        {APP_NAME}
      </span>
        </Link>
    );
}