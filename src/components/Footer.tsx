import React from 'react'

const Footer = () => {
  return (
    <footer className="w-full border-t mt-12 py-6 mb-0">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground mb-0">
          &copy; {new Date().getFullYear()} TripCraft. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer