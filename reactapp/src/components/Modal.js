import { useEffect } from 'react';


export default function Modal({ open, onClose, title, children, footer }) {
useEffect(() => {
const onEsc = (e) => e.key === 'Escape' && onClose?.();
document.addEventListener('keydown', onEsc);
return () => document.removeEventListener('keydown', onEsc);
}, [onClose]);


if (!open) return null;
return (
<div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
<div className="w-full max-w-lg rounded-xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
{title && <h3 className="mb-4 text-xl font-semibold">{title}</h3>}
<div>{children}</div>
{footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
</div>
</div>
);
}