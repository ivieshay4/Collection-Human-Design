import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Bodygraph</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&display=swap" rel="stylesheet" />
        <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { background: #0A0800; color: #E8DCC8; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #2A2418; } select option { background: #13100C; } @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8);} 50%{opacity:1;transform:scale(1.1);} }`}</style>
      </Head>
      <Component {...pageProps} />
    </>
  )
}
