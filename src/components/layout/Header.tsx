"use client"

import type React from "react"
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { LayoutGrid, FileText, ListChecks, LogIn, LogOut, Menu } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-30 w-full glass border-b border-[#ffffff50]">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-hospital-600 font-semibold text-lg">MediForm</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavItem to="/" isActive={isActive("/")} icon={<LayoutGrid className="w-4 h-4" />} label="Dashboard" />
          <NavItem
            to="/templates"
            isActive={isActive("/templates")}
            icon={<FileText className="w-4 h-4" />}
            label="Templates"
          />
          <NavItem
            to="/records"
            isActive={isActive("/records")}
            icon={<ListChecks className="w-4 h-4" />}
            label="Records"
          />
        </nav>

        <div className="flex items-center space-x-2">
          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium">
                  <span className="text-muted-foreground">Hello, </span>
                  <span>{user?.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogIn className="h-4 w-4 mr-2" />
                <span>Login</span>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center py-4">
                  <span className="text-hospital-600 font-semibold text-lg">MediForm</span>
                </div>

                <nav className="flex flex-col space-y-3 py-6">
                  <MobileNavItem
                    to="/"
                    isActive={isActive("/")}
                    icon={<LayoutGrid className="w-4 h-4" />}
                    label="Dashboard"
                    onClick={closeMobileMenu}
                  />
                  <MobileNavItem
                    to="/templates"
                    isActive={isActive("/templates")}
                    icon={<FileText className="w-4 h-4" />}
                    label="Templates"
                    onClick={closeMobileMenu}
                  />
                  <MobileNavItem
                    to="/records"
                    isActive={isActive("/records")}
                    icon={<ListChecks className="w-4 h-4" />}
                    label="Records"
                    onClick={closeMobileMenu}
                  />
                </nav>

                <div className="mt-auto pb-6">
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="text-sm font-medium px-3">
                        <span className="text-muted-foreground">Hello, </span>
                        <span>{user?.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleLogout()
                          closeMobileMenu()
                        }}
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        <span>Logout</span>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigate("/login")
                        closeMobileMenu()
                      }}
                      className="w-full justify-start text-muted-foreground hover:text-foreground"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      <span>Login</span>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

interface NavItemProps {
  to: string
  isActive: boolean
  icon: React.ReactNode
  label: string
}

const NavItem: React.FC<NavItemProps> = ({ to, isActive, icon, label }) => {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-hospital-100 text-hospital-700"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </Link>
  )
}

interface MobileNavItemProps extends NavItemProps {
  onClick: () => void
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ to, isActive, icon, label, onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-hospital-100 text-hospital-700"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </Link>
  )
}

export default Header
