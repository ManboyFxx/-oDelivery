import {
    forwardRef,
    InputHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';

export default forwardRef(function TextInput(
    {
        type = 'text',
        className = '',
        isFocused = false,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean },
    ref,
) {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    // Ensure we don't pass a raw null value, which causes React warnings.
    // We only substitute null with empty string. Undefined is left alone (for uncontrolled).
    const safeProps = { ...props };
    if ('value' in safeProps && safeProps.value === null) {
        safeProps.value = '';
    }

    return (
        <input
            {...safeProps}
            type={type}
            className={
                'rounded-md border-gray-300 shadow-sm focus:border-[#ff3d03] focus:ring-[#ff3d03] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-[#ff3d03] dark:focus:ring-[#ff3d03] ' +
                className
            }
            ref={localRef}
        />
    );
});
