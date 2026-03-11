"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
//import AgentModal from "../AgentModal/AgentModal";

// Navigation
interface NavItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
  image: string;
  description: React.ReactNode;
  shortDescription: string;
}
const navigation: NavItem[] = [];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  //const [selectedAgent, setSelectedAgent] = useState<NavItem | null>(null);
  //const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  // Auth Hooks (Local SaaS)
  const isAuthenticated = !!localStorage.getItem("saas_auth_token");
  const storedUser = localStorage.getItem("saas_user");
  const account = storedUser ? JSON.parse(storedUser) : null;

  // Utiliser useLocation pour détecter la page actuelle et l'agent courant
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/chat");

  // Récupérer l'agent courant depuis l'URL

  // Handle agent selection
  const handleAgentSelect = async (item: NavItem) => {
    // Fermer le dropdown d'abord
    setMobileMenuOpen(false);
    window.location.href = item.href;

    // Petit délai pour laisser le DOM se mettre à jour
    await new Promise(resolve => setTimeout(resolve, 100));

    // Ensuite ouvrir le modal
    // setSelectedAgent(item);
    //setIsAgentModalOpen(true);
  };

  const handleLogout = () => {
    setIsProfileDropdownOpen(false);
    localStorage.removeItem("saas_auth_token");
    localStorage.removeItem("saas_user");
    window.location.href = "/sign-in";
  };

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="absolute inset-x-0 top-0 z-20 ">
      <nav className="flex items-center justify-between p-6 lg:px-8">
        {/* Logo avec texte Aïna */}
        <div className="flex lg:flex-1 items-center space-x-3">
          <Link to="/" className="flex items-center space-x-4 group">
            <img
              ref={logoRef}
              alt="Logo Aïna"
              src="/aina-clim-mag-v8.png"
              className="h-12 w-auto transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl sm:text-2xl font-bold 
                           text-gray-900 dark:text-white 
                           transition-all duration-300 leading-none">
                aïna
              </h3>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                by ITSynchronic
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation - Version Dropdown pour les pages chat */}
        {isChatPage ? (
          // ✅ Conteneur décalé plus à gauche
          (<div className="hidden lg:flex lg:flex-1 justify-start ml-2">
          </div>)
        ) : (
          // Version originale pour les autres pages
          (<div className="hidden lg:flex lg:gap-x-6">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleAgentSelect(item)}
                className="bg-transparent hover:bg-transparent text-gray-900 dark:text-white 
                           font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 
                           transition flex items-center focus:outline-none text-base
                           px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </div>)
        )}

        {/* Le reste du code reste inchangé */}
        {/* Auth Status + Theme + Mobile menu */}
        <div className="flex items-center gap-4">
          {isAuthenticated && account ? (
            <div
              className="hidden lg:flex items-center gap-3 relative"
              ref={dropdownRef}
            >
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-3 p-1.5 px-3 rounded-full bg-white/40 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-md"
              >
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {account?.name || "Aïna User"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    SaaS Marketplace
                  </span>
                </div>
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold shadow-md">
                  {account?.name ? account.name.charAt(0).toUpperCase() : "U"}
                </div>
              </button>

              {/* ✅ Nouveau Dropdown */}
              {isProfileDropdownOpen && (
                <div
                  className="absolute right-0 mt-60 w-72 max-w-xs
               bg-white dark:bg-gray-900
               border border-gray-200 dark:border-gray-700
               rounded-xl overflow-hidden
               shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.04)]
               hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.08),0_15px_15px_-6px_rgba(0,0,0,0.06)]
               transition-all duration-300 z-1" // Réduit à 30
                >
                  <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700
                                  bg-gradient-to-r from-indigo-600 to-purple-600">
                    <p className="text-xs font-medium text-blue-100 uppercase tracking-wider">
                      Connecté en tant que
                    </p>
                    <div className="flex items-center mt-2">
                      <p className="text-sm font-bold text-white truncate">
                        {account?.email || "admin@aina-saas.local"}
                      </p>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="py-1.5">

                    {/* ThemeToggle à l'intérieur ✅ */}
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Thème
                      </span>
                      <ThemeToggle />
                    </div>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="group relative w-full flex items-center px-4 py-2.5 text-sm bg-transparent
                                 text-gray-700  dark:text-gray-200
                                 hover:bg-red-100 dark:hover:bg-red-800
                                 transition-all duration-200"
                    >
                      {/* Bordure gauche */}
                      <div
                        className="absolute left-0 top-0 h-full w-1
                                   bg-red-500 dark:bg-red-400
                                   rounded-r opacity-0 group-hover:opacity-100
                                   transition-all duration-200"
                      />

                      {/* Icône */}
                      <div
                        className="w-8 h-8 rounded-lg
                                   bg-red-100 dark:bg-red-700
                                   flex items-center justify-center mr-3
                                   group-hover:bg-red-200 dark:group-hover:bg-red-600
                                   transition-colors duration-200"
                      >
                        <svg
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          className="h-5 w-5
                                     text-red-500 dark:text-red-300
                                     group-hover:text-red-600 dark:group-hover:text-red-200"
                        >
                          <path
                            clipRule="evenodd"
                            fillRule="evenodd"
                            d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                          />
                        </svg>
                      </div>

                      {/* Texte */}
                      <span
                        className="font-medium
                                   text-red-600 dark:text-red-300
                                   group-hover:text-red-700 dark:group-hover:text-red-200"
                      >
                        Déconnexion
                      </span>
                    </button>

                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Menu mobile */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6 lg:hidden">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5 flex items-center space-x-3">
              <img
                alt="Aïna AI Agent Logo"
                src="/logo-blue.png"
                className="h-10 w-auto"
              />
              <div className="flex flex-col justify-center">
                {/* Texte Aïna dans le menu mobile */}
                <h3 className="text-2xl font-bold 
                              bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 
                              bg-clip-text text-transparent leading-none">
                  Aïna
                </h3>
                <span className="text-[10px] items-center font-bold text-gray-500 uppercase tracking-widest mt-1">
                  by ITSynchronic
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md p-2.5 text-gray-700 dark:text-gray-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center rounded-lg px-3 py-3 text-gray-900 dark:text-white 
                 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left
                 text-base border border-gray-200 dark:border-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            {/* Mobile Auth Section */}
            {isAuthenticated && account ? (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between px-2 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                      {account.idTokenClaims?.picture &&
                        typeof account.idTokenClaims.picture === "string" ? (
                        <img
                          src={account.idTokenClaims.picture}
                          alt={account.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-indigo-700 dark:text-indigo-300 font-medium">
                          {account.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {account.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
      {/* <AgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        agent={
          selectedAgent
            ? {
                name: selectedAgent.name,
                image: selectedAgent.image,
                description: selectedAgent.description!,
                href: selectedAgent.href,
              }
            : null
        }
      /> */}
    </header>
  );
}