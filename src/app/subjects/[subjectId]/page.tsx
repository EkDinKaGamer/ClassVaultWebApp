
import SubjectPageClient from '@/components/SubjectPageClient';

/**
 * Subject Library Page Shell
 * 
 * Satisfies Next.js 15 requirements for static export by awaiting params correctly.
 */

export const dynamicParams = true;

// This ensures the static build completes successfully
export async function generateStaticParams() {
  return [{ subjectId: 'initial' }];
}

interface PageProps {
  params: Promise<{ subjectId: string }>;
}

export default async function Page({ params }: PageProps) {
  // In Next.js 15, params is a Promise that must be awaited
  await params;
  
  return <SubjectPageClient />;
}
