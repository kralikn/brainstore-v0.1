import { EqualNot, FolderPlus, Workflow } from 'lucide-react';

const links = [
  {
    href: '/dashboard/admin',
    label: 'témakörök',
    icon: <FolderPlus />,
  },
  {
    href: '/dashboard/chat/comparison',
    label: 'összehasonlítás',
    icon: <EqualNot />,
  }
];

export default links;