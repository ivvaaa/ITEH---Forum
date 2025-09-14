export function Breadcrumbs() {
const { pathname } = useLocation();
const parts = pathname.split('/').filter(Boolean);
let path = '';
return (
<nav className="text-sm text-gray-600">
<ol className="flex flex-wrap gap-1">
<li><Link className="underline" to="/">Home</Link></li>
{parts.map((seg, i) => {
path += `/${seg}`;
const isLast = i === parts.length - 1;
return (
<li key={i} className="flex items-center gap-1">
<span>/</span>
{isLast ? <span className="font-medium">{decodeURIComponent(seg)}</span> : <Link className="underline" to={path}>{decodeURIComponent(seg)}</Link>}
</li>
);
})}
</ol>
</nav>
);
}