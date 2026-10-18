"use client";

import { useEffect, useState } from "react";
import { siteHref } from "../lib/site-path";

type SiteNavProps = {
  active?: "home" | "about" | "upload" | "recommendations" | "future-strategy";
  solid?: boolean;
};

const navigationItems = [
  { id: "home", label: "首頁", href: "/" },
  { id: "about", label: "永續簡介", href: "/about" },
  { id: "upload", label: "資料上傳", href: "/upload" },
  { id: "recommendations", label: "報告摘要", href: "/recommendations" },
  { id: "future-strategy", label: "未來方針建議", href: "/future-strategy" },
] as const;

export function SiteNav({ active, solid = false }: SiteNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateNavigationScrollState = () => setScrolled(window.scrollY > 24);
    updateNavigationScrollState();
    window.addEventListener("scroll", updateNavigationScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateNavigationScrollState);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-lock", menuOpen);
    return () => document.body.classList.remove("menu-lock");
  }, [menuOpen]);

  const navigationClassName = [
    "site-nav",
    solid ? "nav-solid" : "",
    scrolled ? "is-scrolled" : "",
    menuOpen ? "menu-open" : "",
  ].filter(Boolean).join(" ");

  return (
    <nav className={navigationClassName} aria-label="主要導覽">
      <a className="brand" href={siteHref("/")} aria-label="智能永續企業平台首頁" onClick={() => setMenuOpen(false)}>
        <span className="brand-mark" aria-hidden="true"><i /><i /></span>
        <span>智能永續企業平台</span>
      </a>

      <div className="nav-links">
        {navigationItems.map((navigationItem) => (
          <a className={active === navigationItem.id ? "active" : ""} href={siteHref(navigationItem.href)} key={navigationItem.id}>
            {navigationItem.label}
          </a>
        ))}
      </div>

      <a className="nav-cta" href={siteHref("/upload")}>
        開始整理
        <span aria-hidden="true">↘</span>
      </a>

      <button
        className="menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        onClick={() => setMenuOpen((currentMenuState) => !currentMenuState)}
      >
        <span>{menuOpen ? "關閉" : "選單"}</span>
        <i aria-hidden="true" />
      </button>

      <div className="mobile-menu" id="mobile-menu" aria-hidden={!menuOpen}>
        <p>網站導覽</p>
        <div>
          {navigationItems.map((navigationItem, navigationItemIndex) => (
            <a href={siteHref(navigationItem.href)} onClick={() => setMenuOpen(false)} key={navigationItem.id}>
              <span>0{navigationItemIndex + 1}</span>
              <strong>{navigationItem.label}</strong>
              <i aria-hidden="true">↗</i>
            </a>
          ))}
        </div>
        <small>讓散落的企業資料，成為可以持續追蹤的永續線索。</small>
      </div>
    </nav>
  );
}
