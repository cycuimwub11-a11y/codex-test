function isLocalStandalone() {
  return typeof document !== "undefined" && document.documentElement.dataset.localStandalone === "true";
}

export function siteHref(path: string) {
  if (!isLocalStandalone()) return path;
  return path === "/" ? "./index.html" : `./index.html?page=${encodeURIComponent(path.slice(1))}`;
}

export function siteAsset(path: string) {
  return isLocalStandalone() ? `.${path}` : path;
}
