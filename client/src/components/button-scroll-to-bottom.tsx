import { cn } from "@/lib/utils";
import { useAtBottom } from "@/lib/hooks/use-at-bottom";
import { Button, type ButtonProps } from "@/components/ui/button";
import { IconArrowDown } from "@/components/ui/icons";

export function ButtonScrollToBottom({ className, ...props }: ButtonProps) {
  const isAtBottom = useAtBottom();

  const handleOnClick = (): void => {
    window.scrollTo({
      top: document.body.offsetHeight,
      behavior: "smooth",
    });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "absolute right-4 top-1 z-10 bg-background transition-opacity duration-300 sm:right-8 md:top-2",
        isAtBottom ? "opacity-0" : "opacity-100",
        className
      )}
      onClick={handleOnClick}
      {...props}
    >
      <IconArrowDown />
      <span className="sr-only">Scroll to bottom</span>
    </Button>
  );
}
