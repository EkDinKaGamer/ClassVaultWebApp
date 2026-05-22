
import SubjectPageClient from '@/components/SubjectPageClient';

/**
 * Subject Library Page
 * 
 * Optimized for standard dynamic web hosting.
 */

interface PageProps {
  params: Promise<{ subjectId: string }>;
}

export default async function Page({ params }: PageProps) {
  // Await params as required in Next.js 15
  await params;
  
  return <SubjectPageClient />;
}
