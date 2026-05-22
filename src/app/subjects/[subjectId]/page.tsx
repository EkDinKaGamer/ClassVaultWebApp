
import SubjectPageClient from '@/components/SubjectPageClient';

/**
 * Subject Library Page
 * 
 * Optimized for both dynamic web hosting and static Android exports.
 */

interface PageProps {
  params: Promise<{ subjectId: string }>;
}

export default async function Page({ params }: PageProps) {
  // In Next.js 15, params is a Promise that must be awaited
  await params;
  
  return <SubjectPageClient />;
}

// We remove generateStaticParams to avoid 500 errors in dev/web.
// Next.js will handle these dynamically on Vercel/Netlify.
