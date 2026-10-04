'use client';

import { useEffect, useRef, useState } from 'react';

type ExplodedProductProps = {
  imageUrl: string;
  title: string;
};

const PARTS = [
  { className: 'exploded-product__part--waistband', label: 'WAISTBAND', detail: 'Soft self-fabric waistband' },
  { className: 'exploded-product__part--body', label: 'MAIN FABRIC', detail: '95% bamboo viscose · 5% spandex' },
  { className: 'exploded-product__part--gusset', label: 'GUSSET', detail: 'Breathable bamboo panel' },
  { className: 'exploded-product__part--legs', label: 'FLAT LEG FINISH', detail: 'Bound edge · lies flat' },
];

/**
 * A contained, image-based construction study. Product photography is the
 * source of truth until a garment model with separately exported meshes is
 * available. No global scroll or background state is changed here.
 */
export function ExplodedProduct({ imageUrl, title }: ExplodedProductProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const nextPhase = entry.intersectionRatio > 0.72 ? 3 : entry.intersectionRatio > 0.48 ? 2 : entry.intersectionRatio > 0.22 ? 1 : 0;
        setPhase((current) => (current === nextPhase ? current : nextPhase));
      },
      { threshold: [0.22, 0.48, 0.72] }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="exploded-product"
      data-phase={phase}
      aria-label={`${title} construction view`}
    >
      <div className="exploded-product__intro">
        <span className="exploded-product__eyebrow">Construction study</span>
        <h2>The bamboo<br /><em>hipster</em></h2>
        <p>Scroll through the essential construction details.</p>
      </div>

      <div className="exploded-product__stage" aria-hidden="true">
        {PARTS.map((part) => (
          <img
            key={part.className}
            className={`exploded-product__part ${part.className}`}
            src={imageUrl}
            alt=""
          />
        ))}
      </div>

      <div className="exploded-product__notes">
        {PARTS.map((part, index) => (
          <div className="exploded-product__note" data-note={index} key={part.label}>
            <span className="exploded-product__line" />
            <div>
              <strong>{part.label}</strong>
              <span>{part.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
