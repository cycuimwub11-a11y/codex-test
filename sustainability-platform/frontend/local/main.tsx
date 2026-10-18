import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../app/globals.css";
import Home from "../app/page";
import AboutPage from "../app/about/page";
import UploadPage from "../app/upload/page";
import RecommendationsPage from "../app/recommendations/page";
import FutureStrategyPage from "../app/future-strategy/page";

const pages = {
  home: { title: "企業永續", component: Home },
  about: { title: "永續簡介｜企業永續", component: AboutPage },
  upload: { title: "資料上傳｜企業永續", component: UploadPage },
  recommendations: { title: "報告摘要｜企業永續", component: RecommendationsPage },
  "future-strategy": { title: "未來方針建議｜企業永續", component: FutureStrategyPage },
} as const;

const requestedPage = new URLSearchParams(window.location.search).get("page") ?? "home";
const page = pages[requestedPage as keyof typeof pages] ?? pages.home;
const Page = page.component;

document.title = page.title;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="site-content"><Page /></div>
    <footer className="site-disclaimer-footer">
      <p>此網頁用途僅限中原大學B-11組別作為專題研究做使用，並無任何盈利與不當等非法行為。</p>
    </footer>
  </StrictMode>,
);
