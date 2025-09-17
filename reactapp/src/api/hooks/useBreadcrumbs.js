import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

const LABEL_OVERRIDES = {
  statistika: "Statistika",
  create: "Kreiraj post",
  posts: "Postovi",
  post: "Post",
  login: "Prijava",
  register: "Registracija",
};

const humanize = (segment) => {
  if (!segment) {
    return "";
  }
  const lower = segment.replace(/-/g, " ").toLowerCase();
  return lower.replace(/\b\w/g, (char) => char.toUpperCase());
};

const resolveLabel = (segment) => {
  if (LABEL_OVERRIDES[segment]) {
    return LABEL_OVERRIDES[segment];
  }
  if (/^\d+$/.test(segment)) {
    return `#${segment}`;
  }
  return humanize(segment);
};

export const useBreadcrumbs = () => {
  const location = useLocation();

  return useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const crumbs = [{ label: "Home", path: "/", isCurrent: segments.length === 0 }];

    if (segments.length === 0) {
      return crumbs;
    }

    let pathAccumulator = "";
    segments.forEach((segment, index) => {
      pathAccumulator += `/${segment}`;
      crumbs.push({
        label: resolveLabel(segment),
        path: pathAccumulator,
        isCurrent: index === segments.length - 1,
      });
    });

    return crumbs;
  }, [location.pathname]);
};

export function Breadcrumbs({ className = "", style = {}, separator = "/" }) {
  const crumbs = useBreadcrumbs();

  if (crumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={className}
      style={{ margin: "12px 16px 0", ...style }}
    >
      <ol
        style={{
          listStyle: "none",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          padding: 0,
          margin: 0,
          alignItems: "center",
        }}
      >
        {crumbs.map((crumb, index) => (
          <li
            key={crumb.path || index}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            {index > 0 && <span aria-hidden="true">{separator}</span>}
            {crumb.isCurrent ? (
              <span aria-current="page" style={{ fontWeight: 600 }}>
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                style={{ color: "#2563eb", textDecoration: "underline" }}
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
