import { tv } from "tailwind-variants";

export const breadcrumbEllipsis = tv({
  base: "flex size-6 items-center justify-center [&>svg]:size-4",
});

export const breadcrumbItem = tv({
  base: "inline-flex min-w-0 max-w-full items-center gap-1.5",
});

export const breadcrumbLink = tv({
  base: "hover:text-foreground min-w-0 max-w-full wrap-break-word transition-colors",
});

export const breadcrumbList = tv({
  base: "text-muted-foreground flex flex-wrap items-center gap-1.5 wrap-break-word sm:gap-2",
});

export const breadcrumbPage = tv({
  base: "text-foreground min-w-0 max-w-full font-normal wrap-break-word",
});

export const breadcrumbSeparator = tv({
  base: "[&>svg]:size-4",
});
