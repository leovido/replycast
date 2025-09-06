import React from "react";

export type BadgeVariant = "engagement" | "following" | "quotient";
export type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant: BadgeVariant;
  size?: BadgeSize;
  showLabel?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  engagement:
    "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
  following:
    "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
  quotient: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
};

const sizeClasses = {
  sm: "text-xs px-1.5 py-0.5",
  md: "text-xs px-2 py-1",
};

const labelMap = {
  engagement: "E: ",
  following: "F: ",
  quotient: "",
};

export function Badge({
  variant,
  size = "sm",
  showLabel = true,
  children,
  className = "",
}: BadgeProps) {
  const baseClasses = "rounded-full";
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  const label = showLabel ? labelMap[variant] : "";

  return (
    <span
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
    >
      {label}
      {children}
    </span>
  );
}
