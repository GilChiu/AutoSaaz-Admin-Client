import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building,
  ShoppingCart,
  LogOut,
  ChevronDown,
  FolderOpen,
  Settings
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./sidebar.css";

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Example group (can be extended later with dynamic config for easier data swap)
  const primaryNav = [
    { name: "Dashboard", href: "/dashboard/overview", icon: LayoutDashboard, group: true, children: [
      { name: "Overview", href: "/dashboard/overview" },
      { name: "Analytic", href: "/dashboard/analytics" }
    ] },
    { name: "User Management", href: "/users", icon: Users },
    { name: "Garage Management", href: "/garages", icon: Building },
    { name: "Order Management", href: "/orders/pending", icon: ShoppingCart, group: true, children: [
      { name: "Pending", href: "/orders/pending" },
      { name: "In Progress", href: "/orders/in-progress" },
      { name: "Completed", href: "/orders/completed" },
    ] },
    { name: "Payments", href: "/payments", icon: FolderOpen },
    { name: "Disputes & Revisions", href: "/disputes", icon: FolderOpen },
    { name: "Support", href: "/support/users", icon: FolderOpen, group: true, children: [
      { name: "User Tickets", href: "/support/users" },
      { name: "Garage Tickets", href: "/support/garages" }
    ] }
  ];

  const inspectionGroup = {
    label: "Content",
    icon: FolderOpen,
    basePath: "/content",
    children: [
  { name: "Push notification", href: "/content/push" },
  { name: "App Banners", href: "/content/banners" },
  { name: "CMS & Policies", href: "/content/cms" },
  { name: "Service Settings", href: "/content/service-settings" }
    ]
  };

  const [openGroups, setOpenGroups] = useState(() => {
    const init = {};
    if (location.pathname.startsWith(inspectionGroup.basePath)) init[inspectionGroup.label] = true;
    if (location.pathname.startsWith("/dashboard")) init["Dashboard"] = true;
    if (location.pathname.startsWith("/orders")) init["Order Management"] = true;
    if (location.pathname.startsWith("/support")) init["Support"] = true;
    return init;
  });

  // Ensure only active group's subtabs remain open; others collapse when navigating away
  useEffect(() => {
  setOpenGroups(prev => {
      const updated = { ...prev };
      const groups = [
    { key: "Dashboard", base: "/dashboard" },
    { key: inspectionGroup.label, base: inspectionGroup.basePath },
    { key: "Order Management", base: "/orders" },
    { key: "Support", base: "/support" },
      ];
      groups.forEach(g => {
        const active = location.pathname === g.base || location.pathname.startsWith(g.base + "/");
        updated[g.key] = active ? true : false;
      });
      return updated;
    });
  }, [location.pathname, inspectionGroup.basePath, inspectionGroup.label]);

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleGroupHeaderClick = (groupKey, defaultHref, isActiveRoute) => {
    // If not currently active route base, navigate to default first subtab to apply active styling
    if (!isActiveRoute) {
      navigate(defaultHref);
      return; // navigation will trigger effect to open group & highlight
    }
    // If already active, allow collapsing/expanding
    toggleGroup(groupKey);
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-header">
        <div className="dashboard-logo">
          <div className="dashboard-logo-icon">AS</div>
          <div className="dashboard-logo-text">
            <span className="dashboard-logo-name">AutoSaaz</span>
            <span className="dashboard-logo-subtitle">Admin</span>
          </div>
        </div>
      </div>

      <nav className="dashboard-sidebar-nav">
        <ul>
      {primaryNav.map((item) => {
            const Icon = item.icon;
            if (item.group) {
        const defaultHref = item.children?.[0]?.href || item.href || "/";
        const base = defaultHref.split('/').slice(0,2).join('/') || '/';
        const routeActive = location.pathname === base || location.pathname.startsWith(base + "/");
              const isOpen = openGroups[item.name];
              return (
                <li key={item.name} className={`dashboard-nav-group ${isOpen ? "expanded" : ""} ${routeActive ? 'active' : ''}`}>
                  <button
                    type="button"
                    className={`dashboard-nav-group-header`}
          onClick={() => handleGroupHeaderClick(item.name, item.children[0].href, routeActive)}
                  >
                    <span className="dashboard-nav-icon"><Icon size={16} /></span>
                    <span className="dashboard-nav-group-title">{item.name}</span>
                    <span className="dashboard-nav-chevron"><ChevronDown size={14} /></span>
                  </button>
                  <div className={`dashboard-nav-subitems-wrapper ${isOpen ? "open" : ""}`}>
                    <ul className="dashboard-nav-subitems">
                      {item.children.map(child => (
                        <li key={child.name}>
                          <NavLink to={child.href} className={({isActive}) => `dashboard-nav-sublink ${isActive ? 'active' : ''}`}>{child.name}</NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            }
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `dashboard-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <span className="dashboard-nav-icon"><Icon size={16} /></span>
                  {item.name}
                </NavLink>
              </li>
            );
          })}

          {/* Expandable group example */}
          {(() => {
            const routeActive = location.pathname === inspectionGroup.basePath || location.pathname.startsWith(inspectionGroup.basePath + "/");
            const isOpen = openGroups[inspectionGroup.label];
            return (
              <li className={`dashboard-nav-group ${isOpen ? 'expanded' : ''} ${routeActive ? 'active' : ''}`}>
                <button
                  type="button"
                  className="dashboard-nav-group-header"
                  onClick={() => handleGroupHeaderClick(inspectionGroup.label, inspectionGroup.children[0].href, routeActive)}
                >
                  <span className="dashboard-nav-icon"><inspectionGroup.icon size={16} /></span>
                  <span className="dashboard-nav-group-title">{inspectionGroup.label}</span>
                  <span className="dashboard-nav-chevron"><ChevronDown size={14} /></span>
                </button>
                <div className={`dashboard-nav-subitems-wrapper ${isOpen ? 'open' : ''}`}>
                  <ul className="dashboard-nav-subitems">
                    {inspectionGroup.children.map(child => (
                      <li key={child.name}>
                        <NavLink to={child.href} className={({isActive}) => `dashboard-nav-sublink ${isActive ? 'active' : ''}`}>{child.name}</NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })()}
        </ul>
      </nav>

      <div className="dashboard-sidebar-footer">
        <ul>
          <li>
            <NavLink
              to="/content/service-settings"
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="dashboard-nav-icon"><Settings size={16} /></span>
              Settings
            </NavLink>
          </li>
          <li>
            <button onClick={logout} className="dashboard-logout-btn" type="button">
              <span className="dashboard-nav-icon"><LogOut size={16} /></span>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
