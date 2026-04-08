export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-gray-300 text-[#20A4AC] shadow-sm focus:ring-[#20A4AC] ' +
                className
            }
        />
    );
}
