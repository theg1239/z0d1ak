"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface SidebarTableOfContentsProps {
  content: string;
  className?: string;
}

export default function SidebarTableOfContents({ content, className = "" }: SidebarTableOfContentsProps) {
  const [activeId, setActiveId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  const cleanedContent = content.replace(/```[\s\S]*?```/g, "");
  const headings = cleanedContent.match(/#{1,4}\s.+/g) || [];
  const toc = headings.map((heading) => {
    const level = (heading.match(/^#+/) || [""])[0].length;
    const title = heading.replace(/^#+\s/, "");
    const id = title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    return { level, title, id };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const headingElements = Array.from(document.querySelectorAll("h1, h2, h3, h4"));
    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-30% 0px -70% 0px",
        threshold: 0,
      }
    );
    
    headingElements.forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, [content]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const onScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      if (scrollY + viewportHeight >= documentHeight - 50) {
        const headingElements = Array.from(document.querySelectorAll("h1, h2, h3, h4"));
        if (headingElements.length > 0) {
          setActiveId(headingElements[headingElements.length - 1].id);
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (toc.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-background shadow-md"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle table of contents</span>
        </Button>
      </div>

      <div 
        className={`
          fixed z-40 h-screen top-24 right-0 transform bg-background/95 backdrop-blur
          w-64 transition-transform duration-300 ease-in-out overflow-y-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'} 
          md:translate-x-0
          ${className}
        `}
      >
        <div className="p-4 sticky top-0">
          <h3 className="text-lg font-semibold mb-2">Table of Contents</h3>
          <nav>
            {toc.map((item, index) => (
              <a
                key={index}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(item.id);
                  if (element) {
                    const offset = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: "smooth"
                    });
                  }
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                className={`
                  block text-sm py-1 px-2 rounded transition-colors
                  ${activeId === item.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/20"}
                  ${item.level === 1 ? "font-medium" : ""}
                  ${item.level === 2 ? "pl-4" : ""}
                  ${item.level === 3 ? "pl-6" : ""}
                  ${item.level === 4 ? "pl-8" : ""}
                `}
              >
                {item.title}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
