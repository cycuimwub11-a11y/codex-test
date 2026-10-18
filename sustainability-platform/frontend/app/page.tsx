"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SiteNav } from "./components/SiteNav";
import { siteAsset, siteHref } from "./lib/site-path";

export default function Home() {
  const pageRootReference = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const pageElement = pageRootReference.current;
    if (!pageElement) return;
    const animationMediaQueries = gsap.matchMedia();

    animationMediaQueries.add(
      { desktop: "(min-width: 800px)", reduceMotion: "(prefers-reduced-motion: reduce)" },
      (breakpointContext) => {
        const { desktop, reduceMotion } = breakpointContext.conditions as { desktop: boolean; reduceMotion: boolean };
        if (reduceMotion) return;

        gsap.timeline({ defaults: { ease: "power3.out" } })
          .from(".site-nav", { y: -24, autoAlpha: 0, duration: 0.7 })
          .from(".title-line", { yPercent: 108, duration: 1.05, stagger: 0.12 }, "-=0.3")
          .from(".hero-intro", { y: 20, autoAlpha: 0, duration: 0.7 }, "-=0.48")
          .from(".hero-actions", { y: 16, autoAlpha: 0, duration: 0.65 }, "-=0.5");

        gsap.to(".hero-image", {
          scale: desktop ? 1.13 : 1.06,
          yPercent: desktop ? 8 : 3,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
        });

        gsap.to(".hero-copy", {
          yPercent: 16,
          autoAlpha: 0.12,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "45% top", end: "bottom top", scrub: 0.8 },
        });

        ScrollTrigger.batch(".reveal", {
          start: "top 84%",
          once: true,
          onEnter: (revealElements) => gsap.from(revealElements, {
            y: 52,
            autoAlpha: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
            overwrite: true,
          }),
        });

        gsap.from(".story-image", {
          scale: 1.12,
          clipPath: "inset(13% 9% 13% 9% round 28px)",
          ease: "none",
          scrollTrigger: { trigger: ".story-visual", start: "top bottom", end: "bottom 58%", scrub: 1 },
        });

        if (desktop) {
          const heroSection = pageElement.querySelector<HTMLElement>(".hero");
          const heroSpotlight = pageElement.querySelector<HTMLElement>(".hero-spotlight");
          if (heroSection && heroSpotlight) {
            const updateSpotlightHorizontalPosition = gsap.quickTo(heroSpotlight, "x", { duration: 0.55, ease: "power3.out" });
            const updateSpotlightVerticalPosition = gsap.quickTo(heroSpotlight, "y", { duration: 0.55, ease: "power3.out" });
            const followPointerWithinHero = (pointerEvent: PointerEvent) => {
              const heroBounds = heroSection.getBoundingClientRect();
              updateSpotlightHorizontalPosition(pointerEvent.clientX - heroBounds.left);
              updateSpotlightVerticalPosition(pointerEvent.clientY - heroBounds.top);
            };
            heroSection.addEventListener("pointermove", followPointerWithinHero);
            return () => heroSection.removeEventListener("pointermove", followPointerWithinHero);
          }
        }
      },
      pageElement,
    );

    const refreshScrollAnimations = () => ScrollTrigger.refresh();
    window.addEventListener("load", refreshScrollAnimations, { once: true });
    return () => {
      window.removeEventListener("load", refreshScrollAnimations);
      animationMediaQueries.revert();
    };
  }, []);

  return (
    <main ref={pageRootReference}>
      <SiteNav active="home" />

      <section className="hero" id="top">
        <img className="hero-image" src={siteAsset("/images/forest-river.jpg")} alt="河流穿過茂密森林的空拍景色" />
        <div className="hero-shade" />
        <div className="hero-spotlight" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <h1>
            <span className="title-mask"><span className="title-line">從手邊資料，</span></span>
            <span className="title-mask"><span className="title-line accent">走進企業永續。</span></span>
          </h1>
          <div className="hero-lower">
            <p className="hero-intro">剛開始接觸永續的中小企業，可以先從熟悉的文件與紀錄著手，不必一次改變原有的工作方式。</p>
            <div className="hero-actions">
              <a className="about-entry" href={siteHref("/about")}>
                <strong>前往永續簡介</strong><i aria-hidden="true">↗</i>
              </a>
              <a className="primary-action" href="#why">專題介紹 <span aria-hidden="true">↓</span></a>
            </div>
          </div>
        </div>
      </section>

      <section className="statement" id="why">
        <div className="section-index reveal"><span>01</span><p>專題介紹</p></div>
        <div className="statement-copy">
          <h2 className="reveal">專題介紹</h2>
          <div className="motivation-grid">
            <article className="motivation-card reveal">
              <span>01</span>
              <h3>永續資訊愈來愈多</h3>
              <p>隨著 ESG 相關揭露要求提高，企業得處理更多永續資訊。對人力有限的中小企業來說，把資料整理得清楚易讀並不容易。</p>
            </article>
            <article className="motivation-card reveal">
              <span>02</span>
              <h3>報告難以快速掌握</h3>
              <p>永續報告書篇幅長，資料又分散在不同章節與表格。要找出重要指標和變化，往往得花時間反覆閱讀、比對。</p>
            </article>
            <article className="motivation-card reveal">
              <span>03</span>
              <h3>讓資料更容易使用</h3>
              <p>我們希望結合 AI 與 Power BI，把靜態報告整理成重點摘要與互動式儀表板，讓使用者能查找、比較資料，作為後續討論的起點。</p>
            </article>
          </div>
        </div>
      </section>

      <section className="story">
        <figure className="story-visual">
          <img className="story-image" src={siteAsset("/images/city-night.jpg")} alt="夜間城市與道路形成的能源網絡" />
        </figure>
        <div className="story-notes">
          <div className="story-section-heading reveal"><span>02</span><h2>專題目的</h2></div>
          <article className="story-note reveal">
            <span>整理永續資料</span><h3>將公司現有的報告與營運資料，整理成可查閱的永續資訊。</h3>
            <p>平台會保留資料年度、單位與來源，方便企業日後核對與補充。</p>
          </article>
          <article className="story-note reveal">
            <span>呈現資料重點</span><h3>透過 Power BI，把分散資料整理成互動式儀表板。</h3>
            <p>企業可依年度與指標查看變化，不必在不同檔案之間反覆查找。</p>
          </article>
          <article className="story-note reveal">
            <span>提供治理建議</span><h3>從現有資料找出重點、缺口與值得優先處理的事項。</h3>
            <p>建議會標示資料依據，供企業規劃下一年度及中長期策略時參考。</p>
          </article>
        </div>
      </section>

      <footer className="site-footer">
        <div><h2>了解臺灣企業目前面對的永續規範、揭露時程，以及供應鏈帶來的資料要求。</h2></div>
        <a href={siteHref("/about")} aria-label="前往永續簡介"><span>前往永續簡介</span><strong aria-hidden="true">→</strong></a>
        <small>
          影像來源：
          <a href="https://unsplash.com/photos/an-aerial-view-of-a-river-running-through-a-forest-j-p1LIXbP_g" target="_blank" rel="noreferrer">Luke Oslizlo</a>
          {"、"}
          <a href="https://unsplash.com/photos/an-aerial-view-of-a-city-at-night-GEdcTEXmJyI" target="_blank" rel="noreferrer">Kasra Rasaee</a>
        </small>
      </footer>
    </main>
  );
}
