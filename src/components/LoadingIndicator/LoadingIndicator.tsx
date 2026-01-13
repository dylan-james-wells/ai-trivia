"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import "./LoadingIndicator.css";

interface LoadingIndicatorProps {
  className?: string;
}

// Trivia category icons from SVG Repo
const icons = [
  // 1. Film/Movies - film reel
  <svg key="film" viewBox="0 0 96 96" fill="currentColor">
    <path d="M38 9.54C18.147 15.081 5.205 34.868 8.798 54.187c5.939 31.938 43.74 44.578 66.67 22.293L80 72.075V88h8.156l-.359-24.25c-.397-26.808-.864-29.173-7.724-39.144C71.435 12.051 52.849 5.395 38 9.54m-1.965 8.662c-21.065 8.087-26.757 36.207-10.6 52.363C45.55 90.68 80 76.434 80 48c0-22.531-22.743-37.945-43.965-29.798m8.286 2.987c-5.523 2.67-5.039 11.443.765 13.847 8.905 3.688 15.066-9.912 6.299-13.906-2.957-1.348-4.175-1.338-7.064.059m-20 20c-5.523 2.67-5.039 11.443.765 13.847 8.905 3.688 15.066-9.912 6.299-13.906-2.957-1.348-4.175-1.338-7.064.059m40 0c-5.523 2.67-5.039 11.443.765 13.847 8.905 3.688 15.066-9.912 6.299-13.906-2.957-1.348-4.175-1.338-7.064.059m-18.75 4.382C44.707 46.436 44 47.529 44 48c0 1.111 2.889 4 4 4 1.111 0 4-2.889 4-4 0-1.111-2.889-4-4-4-.471 0-1.564.707-2.429 1.571m-1.25 15.618c-5.523 2.67-5.039 11.443.765 13.847 8.905 3.688 15.066-9.912 6.299-13.906-2.957-1.348-4.175-1.338-7.064.059" fillRule="evenodd"/>
  </svg>,
  // 2. Video Games - gamepad
  <svg key="game" viewBox="0 0 32 32" fill="currentColor">
    <path d="M17 10V6h-2v4H2v16h28V10H17zM28 24H4V12h24V24z"/>
    <polygon points="9,22 11,22 11,19 14,19 14,17 11,17 11,14 9,14 9,17 6,17 6,19 9,19"/>
    <rect x="18" y="17" width="2" height="2"/>
    <rect x="24" y="17" width="2" height="2"/>
    <rect x="21" y="14" width="2" height="2"/>
    <rect x="21" y="20" width="2" height="2"/>
  </svg>,
  // 3. Books/Literature - book
  <svg key="book" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19V6.2C4 5.0799 4 4.51984 4.21799 4.09202C4.40973 3.71569 4.71569 3.40973 5.09202 3.21799C5.51984 3 6.0799 3 7.2 3H16.8C17.9201 3 18.4802 3 18.908 3.21799C19.2843 3.40973 19.5903 3.71569 19.782 4.09202C20 4.51984 20 5.0799 20 6.2V17H6C4.89543 17 4 17.8954 4 19ZM4 19C4 20.1046 4.89543 21 6 21H20M9 7H15M9 11H15M19 17V21"/>
  </svg>,
  // 4. Music - musical notes
  <svg key="music" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19C9 20.1046 7.65685 21 6 21C4.34315 21 3 20.1046 3 19C3 17.8954 4.34315 17 6 17C7.65685 17 9 17.8954 9 19ZM9 19V5L21 3V17M21 17C21 18.1046 19.6569 19 18 19C16.3431 19 15 18.1046 15 17C15 15.8954 16.3431 15 18 15C19.6569 15 21 15.8954 21 17ZM9 9L21 7"/>
  </svg>,
  // 5. Science - atom
  <svg key="science" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <ellipse cx="31.95" cy="32" rx="8.99" ry="24.73"/>
    <ellipse cx="31.95" cy="32" rx="8.99" ry="24.73" transform="translate(-11.74 43.67) rotate(-60)"/>
    <ellipse cx="32.05" cy="32.15" rx="24.73" ry="8.99" transform="translate(-11.78 20.33) rotate(-30)"/>
    <circle cx="32.2" cy="32.15" r="2.88"/>
  </svg>,
  // 6. Geography/World - globe
  <svg key="globe" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M6.15407 7.30116C7.52877 5.59304 9.63674 4.5 12 4.5C12.365 4.5 12.7238 4.52607 13.0748 4.57644L13.7126 5.85192L11.2716 8.2929L8.6466 8.6679L7.36009 9.95441L6.15407 7.30116ZM5.2011 8.82954C4.75126 9.79256 4.5 10.8669 4.5 12C4.5 15.6945 7.17133 18.7651 10.6878 19.3856L11.0989 18.7195L8.8147 15.547L10.3741 13.5256L9.63268 13.1549L6.94027 13.6036L6.41366 11.4972L5.2011 8.82954ZM7.95559 11.4802L8.05962 11.8964L9.86722 11.5951L11.3726 12.3478L14.0824 11.9714L18.9544 14.8135C19.3063 13.9447 19.5 12.995 19.5 12C19.5 8.93729 17.6642 6.30336 15.033 5.13856L15.5377 6.1481L11.9787 9.70711L9.35371 10.0821L7.95559 11.4802ZM18.2539 16.1414C16.9774 18.0652 14.8369 19.366 12.3859 19.4902L12.9011 18.6555L10.6853 15.578L12.0853 13.7632L13.7748 13.5286L18.2539 16.1414ZM12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z"/>
  </svg>,
  // 7. History - scroll
  <svg key="history" viewBox="0 0 32 32" fill="currentColor">
    <path d="M24,19V7c0-1.657-1.343-3-3-3H7C5.343,4,4,5.343,4,7v5h4v12c0,1.657,1.343,3,3,3h14c1.657,0,3-1.343,3-3v-5H24z M8,10H6V7c0-0.551,0.449-1,1-1c0.552,0,1,0.448,1,1V10z M10,24V7c0-0.35-0.06-0.687-0.171-1H21c0.551,0,1,0.449,1,1v12H12v5c0,0.552-0.448,1-1,1C10.449,25,10,24.551,10,24z M26,24c0,0.551-0.449,1-1,1H13.829C13.94,24.687,14,24.35,14,24v-3h12V24z M20,12h-8v-2h8V12z M20,16h-8v-2h8V16z"/>
  </svg>,
  // 8. Tech/Computer - laptop
  <svg key="tech" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V7.2C21 6.0799 21 5.51984 20.782 5.09202C20.5903 4.71569 20.2843 4.40973 19.908 4.21799C19.4802 4 18.9201 4 17.8 4H6.2C5.07989 4 4.51984 4 4.09202 4.21799C3.71569 4.40973 3.40973 4.71569 3.21799 5.09202C3 5.51984 3 6.0799 3 7.2V16M4.66667 20H19.3333C19.9533 20 20.2633 20 20.5176 19.9319C21.2078 19.7469 21.7469 19.2078 21.9319 18.5176C22 18.2633 22 17.9533 22 17.3333C22 17.0233 22 16.8683 21.9659 16.7412C21.8735 16.3961 21.6039 16.1265 21.2588 16.0341C21.1317 16 20.9767 16 20.6667 16H3.33333C3.02334 16 2.86835 16 2.74118 16.0341C2.39609 16.1265 2.12654 16.3961 2.03407 16.7412C2 16.8683 2 17.0233 2 17.3333C2 17.9533 2 18.2633 2.06815 18.5176C2.25308 19.2078 2.79218 19.7469 3.48236 19.9319C3.73669 20 4.04669 20 4.66667 20Z"/>
  </svg>,
  // 9. Sports - trophy
  <svg key="sports" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 14V17M12 14C9.58104 14 7.56329 12.2822 7.10002 10M12 14C14.419 14 16.4367 12.2822 16.9 10M17 5H19.75C19.9823 5 20.0985 5 20.1951 5.01921C20.5918 5.09812 20.9019 5.40822 20.9808 5.80491C21 5.90151 21 6.01767 21 6.25C21 6.94698 21 7.29547 20.9424 7.58527C20.7056 8.77534 19.7753 9.70564 18.5853 9.94236C18.2955 10 17.947 10 17.25 10H17H16.9M7 5H4.25C4.01767 5 3.90151 5 3.80491 5.01921C3.40822 5.09812 3.09812 5.40822 3.01921 5.80491C3 5.90151 3 6.01767 3 6.25C3 6.94698 3 7.29547 3.05764 7.58527C3.29436 8.77534 4.22466 9.70564 5.41473 9.94236C5.70453 10 6.05302 10 6.75 10H7H7.10002M12 17C12.93 17 13.395 17 13.7765 17.1022C14.8117 17.3796 15.6204 18.1883 15.8978 19.2235C16 19.605 16 20.07 16 21H8C8 20.07 8 19.605 8.10222 19.2235C8.37962 18.1883 9.18827 17.3796 10.2235 17.1022C10.605 17 11.07 17 12 17ZM7.10002 10C7.03443 9.67689 7 9.34247 7 9V4.57143C7 4.03831 7 3.77176 7.09903 3.56612C7.19732 3.36201 7.36201 3.19732 7.56612 3.09903C7.77176 3 8.03831 3 8.57143 3H15.4286C15.9617 3 16.2282 3 16.4339 3.09903C16.638 3.19732 16.8027 3.36201 16.901 3.56612C17 3.77176 17 4.03831 17 4.57143V9C17 9.34247 16.9656 9.67689 16.9 10"/>
  </svg>,
];

// Size of each icon box
const BOX_SIZE = 60;
// Threshold for overlap detection (distance between centers)
const OVERLAP_THRESHOLD = BOX_SIZE * 0.7;

interface LoadingTextProps {
  children: string;
  className?: string;
}

export function LoadingText({ children, className = "" }: LoadingTextProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <p className={`relative inline-block loading-text-bounce ${className}`}>
      {children}
      <span className="absolute left-full bottom-0">{dots}</span>
    </p>
  );
}

export function LoadingIndicator({ className = "" }: LoadingIndicatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationFrameRef = useRef<number>();
  const pulseTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Random pulse effect for SVGs
  useEffect(() => {
    const triggerRandomPulse = () => {
      const boxes = boxRefs.current.filter(Boolean);
      if (boxes.length === 0) return;

      // Pick a random box
      const randomIndex = Math.floor(Math.random() * boxes.length);
      const box = boxes[randomIndex];
      const svg = box?.querySelector('svg');

      if (svg) {
        // Apply pulse scale
        svg.style.transition = 'transform 0.15s ease-out';
        svg.style.transform = 'scale(1.3)';

        // Reset after pulse
        const resetTimeout = setTimeout(() => {
          svg.style.transition = 'transform 0.3s ease-in';
          svg.style.transform = 'scale(1)';
        }, 150);

        pulseTimeoutsRef.current.push(resetTimeout);
      }

      // Schedule next random pulse (between 200ms and 800ms)
      const nextTimeout = setTimeout(triggerRandomPulse, 200 + Math.random() * 600);
      pulseTimeoutsRef.current.push(nextTimeout);
    };

    // Start the random pulse loop
    const initialTimeout = setTimeout(triggerRandomPulse, 500);
    pulseTimeoutsRef.current.push(initialTimeout);

    return () => {
      pulseTimeoutsRef.current.forEach(clearTimeout);
      pulseTimeoutsRef.current = [];
    };
  }, []);

  const checkOverlaps = useCallback(() => {
    const boxes = boxRefs.current;
    if (!boxes.length) return;

    // Get current positions of all SVG elements (they move within the box)
    const positions: { x: number; y: number }[] = [];

    boxes.forEach((box) => {
      if (!box) {
        positions.push({ x: 0, y: 0 });
        return;
      }

      const svg = box.querySelector('svg');
      if (!svg) {
        positions.push({ x: 0, y: 0 });
        return;
      }

      const rect = svg.getBoundingClientRect();
      positions.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    });

    // Check each pair of boxes for overlap
    const overlapping = new Set<number>();

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[i].x - positions[j].x;
        const dy = positions[i].y - positions[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < OVERLAP_THRESHOLD) {
          // The higher-indexed box fades out when overlapping
          overlapping.add(j);
        }
      }
    }

    // Apply opacity to boxes
    boxes.forEach((box, index) => {
      if (!box) return;
      const svg = box.querySelector('svg');
      if (!svg) return;

      if (overlapping.has(index)) {
        svg.style.opacity = '0.2';
        svg.style.filter = 'blur(2px)';
      } else {
        svg.style.opacity = '1';
        svg.style.filter = 'blur(0px)';
      }
    });

    // Continue the animation loop
    animationFrameRef.current = requestAnimationFrame(checkOverlaps);
  }, []);

  useEffect(() => {
    // Start the overlap detection loop
    animationFrameRef.current = requestAnimationFrame(checkOverlaps);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [checkOverlaps]);

  const setBoxRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    boxRefs.current[index] = el;
  }, []);

  return (
    <div ref={containerRef} className={`banter-loader ${className}`}>
      {icons.map((icon, index) => (
        <div key={index} ref={setBoxRef(index)} className="banter-loader__box">
          {icon}
        </div>
      ))}
    </div>
  );
}
