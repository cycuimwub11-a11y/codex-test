"use client";

import { useEffect, useId, useRef } from "react";
import gsap from "gsap";
import { bambooOutlet, bambooPivot, bambooRestAngle } from "./bamboo-motion.mjs";
import { siteAsset } from "../lib/site-path";

export function BambooFlow({ active }: { active: boolean }) {
  const sceneRef = useRef<SVGSVGElement>(null);
  const angleRef = useRef(bambooRestAngle);
  const assetId = useId().replace(/:/g, "");

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (!active) {
      const resting = { angle: angleRef.current };
      const context = gsap.context(() => {
        gsap.to(resting, {
          angle: bambooRestAngle,
          duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.65,
          ease: "sine.out",
          onUpdate: () => {
            angleRef.current = resting.angle;
            scene.querySelector(".bamboo-scoop")?.setAttribute("transform", `rotate(${resting.angle} ${bambooPivot.x} ${bambooPivot.y})`);
          },
        });
      }, scene);
      return () => context.revert();
    }
    const motionMedia = gsap.matchMedia();
    motionMedia.add("(prefers-reduced-motion: no-preference)", () => {
      const scoop = scene.querySelector<SVGGElement>(".bamboo-scoop")!;
      const stream = scene.querySelector<SVGPathElement>(".bamboo-pour")!;
      const streamHighlight = scene.querySelector<SVGPathElement>(".bamboo-pour-highlight")!;
      const inlet = scene.querySelector<SVGGElement>(".bamboo-inlet")!;
      const inletPaths = inlet.querySelectorAll("path");
      const fill = scene.querySelector<SVGGElement>(".bamboo-fill")!;
      const splash = scene.querySelector<SVGGElement>(".bamboo-splash")!;
      const surface = scene.querySelector<SVGGElement>(".bamboo-surface")!;
      const flow = { angle: bambooRestAngle, fill: 0, pour: 0, inlet: 0, ripple: 0 };
      const paint = () => {
        const outlet = bambooOutlet(flow.angle);
        angleRef.current = flow.angle;
        scoop.setAttribute("transform", `rotate(${flow.angle} ${bambooPivot.x} ${bambooPivot.y})`);
        fill.setAttribute("transform", `translate(0 ${18 * (1 - flow.fill)})`);
        fill.style.opacity = String(flow.fill * 0.85);
        inlet.style.opacity = String(flow.inlet);
        const radians = flow.angle * Math.PI / 180;
        const waterLevel = -10 + 18 * (1 - flow.fill);
        const fillX = bambooPivot.x + 90 * Math.cos(radians) - waterLevel * Math.sin(radians);
        const fillY = bambooPivot.y + 90 * Math.sin(radians) + waterLevel * Math.cos(radians);
        for (const path of inletPaths) path.setAttribute("d", `M234 74 Q236 88 ${fillX},${fillY}`);
        stream.setAttribute("d", `M${outlet.x},${outlet.y} Q${outlet.x + 22},${outlet.y + 15} 380,245`);
        streamHighlight.setAttribute("d", stream.getAttribute("d")!);
        stream.style.opacity = String(flow.pour);
        streamHighlight.style.opacity = String(flow.pour);
        splash.style.opacity = String(flow.pour);
        surface.style.opacity = String(flow.ripple);
      };
      // This is a visual loop, not a processing timer or percentage.
      const cycle = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" }, onUpdate: paint });
      cycle.to(flow, { inlet: 1, duration: 0.3 }, 0)
        .to(flow, { fill: 1, angle: -7, duration: 2 }, 0.2)
        .to(flow, { inlet: 0, duration: 0.2 }, 2.1)
        .to(flow, { angle: 22, duration: 0.85, ease: "power2.inOut" }, 2.25)
        .to(flow, { pour: 1, ripple: 0.85, duration: 0.25 }, 2.65)
        .to(flow, { fill: 0, duration: 0.9 }, 2.85)
        .to(flow, { pour: 0, duration: 0.35 }, 3.65)
        .to(flow, { angle: -15, duration: 0.7, ease: "power2.out" }, 3.95)
        .to(flow, { angle: bambooRestAngle, duration: 0.4 }, 4.65)
        .to(flow, { ripple: 0, duration: 0.7 }, 4.6);
      gsap.to(scene.querySelectorAll(".bamboo-water-streak"), { strokeDashoffset: -100, duration: 0.7, repeat: -1, ease: "none" });
      gsap.to(scene.querySelectorAll(".bamboo-wave"), { strokeDashoffset: -180, duration: 2.4, repeat: -1, ease: "none" });
      gsap.fromTo(scene.querySelectorAll(".bamboo-drop"), { y: 0, opacity: 0.9 }, { y: -17, opacity: 0, duration: 0.6, repeat: -1, stagger: 0.12, ease: "power1.out" });
      gsap.fromTo(scene.querySelectorAll(".bamboo-ring"), { scale: 0.5, opacity: 0.9, transformOrigin: "center" }, { scale: 1.8, opacity: 0, duration: 1.2, repeat: -1, stagger: 0.3, ease: "sine.out" });
      paint();
      return () => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          angleRef.current = bambooRestAngle;
          scoop.setAttribute("transform", `rotate(${bambooRestAngle} ${bambooPivot.x} ${bambooPivot.y})`);
        }
        for (const layer of [stream, streamHighlight, inlet, fill, splash, surface]) layer.style.opacity = "0";
      };
    }, scene);
    return () => motionMedia.revert();
  }, [active]);

  return (
    <div className={`advice-water ${active ? "is-flowing" : ""}`} aria-hidden="true" data-animation-active={active}>
      <svg ref={sceneRef} viewBox="0 20 1200 335" className="bamboo-scene" focusable="false">
        <defs>
          <linearGradient id={`${assetId}-water`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#176d6f" stopOpacity=".4" /><stop offset=".35" stopColor="#e7ffff" stopOpacity=".9" /><stop offset=".7" stopColor="#68cbd0" stopOpacity=".7" /><stop offset="1" stopColor="#fff" stopOpacity=".8" />
          </linearGradient>
          <linearGradient id={`${assetId}-bamboo`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#d4c681" /><stop offset=".4" stopColor="#7a9252" /><stop offset=".8" stopColor="#476739" /><stop offset="1" stopColor="#b1a66a" />
          </linearGradient>
          <clipPath id={`${assetId}-channel`}><path d="M244 249 Q440 280 607 270 T804 228 Q920 257 1114 254 L1114 293 Q931 302 804 273 Q600 346 244 310 Z" /></clipPath>
          <clipPath id={`${assetId}-scoop`}><path d="M183 113 Q220 125 284 121 L335 124 L338 143 L184 133 Z" /></clipPath>
        </defs>
        <image href={siteAsset("/images/bamboo/water-garden-base.png")} x="0" y="0" width="1200" height="400" />
        <g className="bamboo-surface" opacity="0" clipPath={`url(#${assetId}-channel)`}>
          {[252, 270, 287, 305].map((height) => <path key={height} className="bamboo-wave" d={`M225 ${height} Q405 ${height + 30} 603 ${height + 13} T805 ${height - 26} Q958 ${height + 7} 1150 ${height - 4}`} fill="none" stroke="#edffff" strokeWidth="2.5" strokeDasharray="42 16 8 22 25 67" />)}
        </g>
        <path d="M145 68 Q180 66 234 69" fill="none" stroke={`url(#${assetId}-bamboo)`} strokeWidth="13" strokeLinecap="round" />
        <ellipse cx="234" cy="70" rx="5" ry="6" fill="#3d4e2c" stroke="#d1c18b" strokeWidth="2" />
        <g className="bamboo-inlet" opacity="0">
          <path d="M234 74 Q237 92 235 112" fill="none" stroke={`url(#${assetId}-water)`} strokeWidth="5" />
          <path className="bamboo-water-streak" d="M234 74 Q237 92 235 112" fill="none" stroke="#ecffff" strokeWidth="1.5" strokeDasharray="4 10" />
        </g>
        <g className="bamboo-scoop" transform={`rotate(${bambooRestAngle} ${bambooPivot.x} ${bambooPivot.y})`}>
          <image href={siteAsset("/images/bamboo/tipping-bamboo.png")} x="30" y="77" width="330" height="110" />
          <g clipPath={`url(#${assetId}-scoop)`}><g className="bamboo-fill" opacity="0"><path d="M179 120 Q250 111 345 132 L345 153 L179 150 Z" fill={`url(#${assetId}-water)`} /><path d="M182 120 Q260 112 339 132" fill="none" stroke="#dfffff" strokeWidth="2" /></g></g>
        </g>
        <circle cx="145" cy="130" r="8" fill={`url(#${assetId}-bamboo)`} stroke="#d4c681" strokeWidth="2" />
        <path className="bamboo-pour" d="M350 149 Q372 164 380 245" opacity="0" fill="none" stroke={`url(#${assetId}-water)`} strokeWidth="9" strokeLinecap="round" />
        <path className="bamboo-pour-highlight bamboo-water-streak" d="M350 149 Q372 164 380 245" opacity="0" fill="none" stroke="#efffff" strokeWidth="2.5" strokeDasharray="9 12 3 8" strokeLinecap="round" />
        <g className="bamboo-splash" opacity="0" fill="none" stroke="#edffff" strokeWidth="2">
          <ellipse className="bamboo-ring" cx="380" cy="248" rx="18" ry="4" /><ellipse className="bamboo-ring" cx="393" cy="251" rx="24" ry="5" />
          {[[-16, -5], [1, -12], [21, -7], [31, -1]].map(([offsetX, offsetY]) => <ellipse key={offsetX} className="bamboo-drop" cx={380 + offsetX} cy={245 + offsetY} rx="2" ry="3" fill="#cbf9fa" />)}
        </g>
      </svg>
    </div>
  );
}
