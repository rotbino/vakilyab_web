// app/layout.tsx
import React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Head from "next/head";

import { Providers } from "@/lib/provider/providers";
import {LocalStorageInitializer} from "@/app/public/LocalStorageInitializer";


export const metadata: Metadata = {
    title: "وکیل یاب",
    description: "پلتفرم ارتباط با وکلا",
    generator: "Saeed Yousefi",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="fa"
            dir="rtl"
            suppressHydrationWarning
            className={`${GeistSans.variable} ${GeistMono.variable}`}
        >
        <Head>
            <link rel="icon" href="/images/favicon.png" sizes="any"/>
        </Head>
        <body className={GeistSans.className}>
        <Providers>
            <LocalStorageInitializer />
            {children}
        </Providers>
        </body>
        </html>
    );
}