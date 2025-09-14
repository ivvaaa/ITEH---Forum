export default function Button({ as: Tag = 'button', variant = 'primary', className = '', ...props }) {
const base = 'inline-flex items-center gap-2 px-4 py-2 rounded-md border transition disabled:opacity-60';
const map = {
primary: 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700',
ghost: 'bg-transparent text-gray-800 border-gray-300 hover:bg-gray-50',
danger: 'bg-red-600 text-white border-red-700 hover:bg-red-700',
};
return <Tag className={`${base} ${map[variant]} ${className}`} {...props} />;
}