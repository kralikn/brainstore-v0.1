import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import SignOutButton from './sign-out-button';

export default async function Navbar() {

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }

  const userName = data?.user?.user_metadata?.name || ''

  return (
    <div className="h-20 flex justify-between items-center space-x-4 px-8">
      <div>
        {/* <LinkDropdown /> */}
      </div>
      <div className="flex items-center space-x-4">
        <p>{userName}</p>
        <SignOutButton />
      </div>
    </div>
  )
}
