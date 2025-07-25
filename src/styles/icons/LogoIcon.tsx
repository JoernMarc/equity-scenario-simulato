
function LogoIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M50 100C22.3858 100 0 77.6142 0 50C0 22.3858 22.3858 0 50 0V100Z" fill="rgb(var(--color-interactive) / 0.7)" />
      <path d="M50 0C77.6142 0 100 22.3858 100 50C100 77.6142 77.6142 100 50 100V0Z" fill="rgb(var(--color-interactive) / 1)" />
    </svg>
  );
}

export default LogoIcon;
