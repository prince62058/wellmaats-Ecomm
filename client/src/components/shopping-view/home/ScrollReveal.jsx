import { useScrollReveal } from "@/hooks/use-scroll-reveal";

function ScrollReveal({ children, className = "", delay = 0 }) {
  const { ref, visible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${visible ? "scroll-reveal-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default ScrollReveal;
