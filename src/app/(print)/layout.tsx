import "@/app/globals.css"

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-white text-black print:text-[11pt]">
      <div className="max-w-[210mm] mx-auto">
        {children}
      </div>
    </div>
  )
}
