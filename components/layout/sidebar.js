"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain } from 'lucide-react';
import links from './links';
import { Button } from '../ui/button';
import { CardTitle } from '../ui/card';

export default function Sidebar() {

  const pathname = usePathname()

  return (
    <div className="h-full bg-slate-100">
      <CardTitle className="flex flex-row justify-center items-center gap-1 h-20 text-4xl">
        <span>brainst</span>
        <span className="-ml-1 -mr-1.5 mb-0.5"><Brain size={38} className="animate-pulse" /></span>
        <span>re</span>
      </CardTitle>

      <div className="row-span-11 flex flex-col gap-y-4 px-8 pt-4">
        {links.map((link) => {
          return (
            <Button
              asChild
              key={link.label}
              size="sm"
              variant={pathname.startsWith(link.href) ? 'default' : 'link'}
            // variant={pathname === link.href ? 'default' : 'link'}
            >
              <Link href={link.href} className='flex items-center gap-x-2'>
                {link.icon} <span className='capitalize text-left'>{link.label}</span>
              </Link>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
