'use client'

import { LogOut } from 'lucide-react';
import { signOut } from '@/utils/actions';
import { Button } from '../ui/button';


export default function SignOutButton() {
  return (
    <Button size='sm' onClick={signOut}>
      <LogOut />
    </Button>
  )
}
