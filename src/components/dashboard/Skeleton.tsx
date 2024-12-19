export function Skeleton({ className }: { className?: string }) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-md ${className}`}>
        <div className="h-16 bg-gray-300 rounded-t-md"></div>
        <div className="h-16 bg-gray-300 rounded-b-md"></div>
      </div>
    );
  }
  