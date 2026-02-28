import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface ProductCardSkeletonProps {
    viewMode?: 'grid' | 'list';
}

export default function ProductCardSkeleton({ viewMode = 'grid' }: ProductCardSkeletonProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={clsx(
                "bg-gray-100 dark:bg-white/5 rounded-[20px] border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden",
                viewMode === 'grid' 
                    ? "flex flex-col h-full p-2.5 md:p-3 gap-3" 
                    : "flex flex-row items-center p-2.5 gap-3 h-28 md:h-32"
            )}
        >
            {/* Image Skeleton */}
            <div className={clsx(
                "shrink-0 bg-gray-200 dark:bg-white/10 animate-pulse",
                viewMode === 'grid' 
                    ? "w-full aspect-square md:mb-2 rounded-[14px]" 
                    : "h-full aspect-square rounded-[12px]"
            )} />

            {/* Content Skeleton */}
            <div className="flex flex-col flex-1 justify-between h-full py-1">
                <div className="space-y-2">
                    {/* Title */}
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    {/* Description */}
                    <div className={clsx(
                        "space-y-2",
                        viewMode === 'list' && "hidden md:block"
                    )}>
                        <div className="h-3 w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                        <div className="h-3 w-5/6 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    {/* Price */}
                    <div className="h-5 w-1/3 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />

                    {/* Button */}
                    <div className={clsx(
                        "h-7 w-7 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse",
                        viewMode === 'grid' && "md:hidden"
                    )} />
                </div>
            </div>
        </motion.div>
    );
}
