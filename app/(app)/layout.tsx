import BottomNav from '@/components/layout/BottomNav'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-pf-bg relative pb-20">
      <main className="mx-auto max-w-md w-full min-h-screen relative">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
