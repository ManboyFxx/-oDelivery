import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent bg-[#ff3d03] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-[#e63700] focus:bg-[#e63700] focus:outline-none focus:ring-2 focus:ring-[#ff3d03] focus:ring-offset-2 active:bg-[#cc3102] dark:bg-[#ff3d03] dark:text-white dark:hover:bg-[#e63700] dark:focus:bg-[#e63700] dark:focus:ring-offset-gray-800 dark:active:bg-[#cc3102] ${disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
