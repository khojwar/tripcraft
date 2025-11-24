import { Geist, Geist_Mono, Satisfy, Open_Sans } from 'next/font/google'


export const satisfy = Satisfy({
  subsets: ['latin'],
  weight: ['400'],
})

export const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: "--font-open-sans",
});


