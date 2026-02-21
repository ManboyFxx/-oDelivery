import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    CheckCircle2,
    AlertTriangle,
    Info,
    XOctagon,
    X,
} from "lucide-react";

// Define variants for the alert toast using cva
const alertToastVariants = cva(
    "relative w-full max-w-sm overflow-hidden rounded-lg shadow-lg flex items-start p-4 space-x-4",
    {
        variants: {
            variant: {
                success: "",
                warning: "",
                info: "",
                error: "",
            },
            styleVariant: {
                default: "bg-background border",
                filled: "",
            },
        },
        compoundVariants: [
            {
                variant: "success",
                styleVariant: "default",
                className: "text-success-foreground border-green-200 dark:border-green-700",
            },
            {
                variant: "warning",
                styleVariant: "default",
                className: "text-warning-foreground border-yellow-200 dark:border-yellow-700",
            },
            {
                variant: "info",
                styleVariant: "default",
                className: "text-info-foreground border-blue-200 dark:border-blue-700",
            },
            {
                variant: "error",
                styleVariant: "default",
                className: "text-destructive-foreground border-red-200 dark:border-red-700",
            },
            {
                variant: "success",
                styleVariant: "filled",
                className: "bg-green-600 text-white",
            },
            {
                variant: "warning",
                styleVariant: "filled",
                className: "bg-yellow-500 text-white",
            },
            {
                variant: "info",
                styleVariant: "filled",
                className: "bg-blue-600 text-white",
            },
            {
                variant: "error",
                styleVariant: "filled",
                className: "bg-red-600 text-white",
            },
        ],
        defaultVariants: {
            variant: "info",
            styleVariant: "default",
        },
    }
);

// Define icon map for different variants
const iconMap = {
    success: CheckCircle2,
    warning: AlertTriangle,
    info: Info,
    error: XOctagon,
};

// Define icon color classes
const iconColorClasses: Record<string, Record<string, string>> = {
    default: {
        success: "text-green-500",
        warning: "text-yellow-500",
        info: "text-blue-500",
        error: "text-red-500",
    },
    filled: {
        success: "text-white",
        warning: "text-white",
        info: "text-white",
        error: "text-white",
    },
};


export interface AlertToastProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertToastVariants> {
    /** The title of the alert. */
    title: string;
    /** A more detailed description for the alert. */
    description: string;
    /** A function to call when the alert is dismissed. */
    onClose: () => void;
}

const AlertToast = React.forwardRef<HTMLDivElement, AlertToastProps>(
    ({ className, variant = 'info', styleVariant = 'default', title, description, onClose, ...props }, ref) => {
        const Icon = iconMap[variant!];

        // Custom colors for the premium pill design
        const variantStyles = {
            success: "border-green-500/50 bg-green-50/80 dark:bg-green-500/10 text-green-900 dark:text-green-100 shadow-green-500/10",
            warning: "border-yellow-500/50 bg-yellow-50/80 dark:bg-yellow-500/10 text-yellow-900 dark:text-yellow-100 shadow-yellow-500/10",
            info: "border-blue-500/50 bg-blue-50/80 dark:bg-blue-500/10 text-blue-900 dark:text-blue-100 shadow-blue-500/10",
            error: "border-red-500/50 bg-red-50/80 dark:bg-red-500/10 text-red-900 dark:text-red-100 shadow-red-500/10",
        };

        const iconBgStyles = {
            success: "bg-green-500",
            warning: "bg-yellow-500",
            info: "bg-blue-500",
            error: "bg-red-500",
        };

        return (
            <motion.div
                ref={ref}
                role="alert"
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                }}
                className={cn(
                    "relative w-full max-w-[400px] overflow-hidden rounded-[32px] border-2 shadow-2xl backdrop-blur-xl flex items-center p-4 pl-5 gap-4 pointer-events-auto",
                    variantStyles[variant!],
                    className
                )}
                {...props}
            >
                {/* Icon Container */}
                <div className={cn(
                    "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white shadow-lg",
                    iconBgStyles[variant!]
                )}>
                    <Icon className="h-5 w-5 stroke-[2.5px]" aria-hidden="true" />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h3 className="text-[15px] font-black leading-tight truncate">
                        {title}
                    </h3>
                    <p className="text-[13px] font-medium opacity-80 leading-snug line-clamp-2">
                        {description}
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    aria-label="Close"
                    className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current opacity-60 hover:opacity-100"
                >
                    <X className="h-4 w-4 stroke-[3px]" />
                </button>

                {/* Subtle progress bar at bottom for auto-dismiss (optional visual hint) */}
                <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className={cn(
                        "absolute bottom-0 left-0 h-1 opacity-20",
                        iconBgStyles[variant!]
                    )}
                />
            </motion.div>
        );
    }
);

AlertToast.displayName = "AlertToast";

export { AlertToast, alertToastVariants };
