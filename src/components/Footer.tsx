import React from 'react'

const Footer = () => {
  return (
    <div>
        <footer className="w-full border-t mt-20 py-6">
            <div className="container mx-auto px-4 text-center">
                <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} TripCraft. All rights reserved.
                </p>
            </div>
        </footer>
    </div>
  )
}

export default Footer