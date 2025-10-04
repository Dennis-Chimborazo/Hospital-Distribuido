// app/page.jsx (server component)
import { redirect } from 'next/navigation';

export default function HomePage() {
    redirect('/login');
}