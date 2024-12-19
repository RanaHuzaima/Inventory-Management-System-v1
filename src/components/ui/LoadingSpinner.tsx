interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

export function LoadingSpinner({ fullScreen }: LoadingSpinnerProps) {
  const wrapperClasses = fullScreen ? "min-h-screen flex items-center justify-center" : "min-h-screen flex items-center justify-center";
  
  return (
    <div className={wrapperClasses}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}