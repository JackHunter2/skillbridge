import { Link } from 'react-router-dom';
import { APP_NAME } from '../../config';
import logomrk from '../../assets/logo-mark.svg';

export default function Brand({ to = '/', dark = false }) {
    return (
        <Link to={to} className="inline-flex items-center gap-2.5">
            <img src={logomrk} alt="" width="36" height="36" className="h-9 w-9 shrink-0" />
            <span className={`text-lg font-extrabold tracking-tight ${dark ? 'text-white' : 'text-navy'}`}>
        {APP_NAME}
      </span>
        </Link>
    );
}