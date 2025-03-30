export function Footer() {
    const currentYear = new Date().getFullYear()
  
    return (
      <footer className="mt-auto border-t border-gray-800 bg-[#111827] py-4 text-center text-xs text-gray-400">
        <div className="container mx-auto">
          <p>Copyright © {currentYear} OriginMC. All Rights Reserved.</p>
        </div>
      </footer>
    )
  }
  
  