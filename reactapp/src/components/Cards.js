export default function Card({ title, children, actions }) {
return (
<div className="rounded-xl border bg-white p-4 shadow-sm">
{title && <h3 className="mb-2 text-lg font-semibold">{title}</h3>}
<div className="text-sm text-gray-800">{children}</div>
{actions && <div className="mt-3 flex gap-2">{actions}</div>}
</div>
);
}