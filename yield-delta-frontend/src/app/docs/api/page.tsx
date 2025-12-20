import { redirect } from 'next/navigation';

export default function APIRedirectPage() {
  redirect('/docs/api-reference');
}

export const metadata = {
  title: 'API Documentation - Yield Delta',
  description: 'Redirecting to API Reference documentation',
};
