import localtunnel from 'localtunnel';

async function main() {
  console.log('Opening localtunnel to port 5000...');
  try {
    const tunnel = await localtunnel({ port: 5000 });
    console.log('PUBLIC_LIVE_URL:', tunnel.url);

    tunnel.on('close', () => {
      console.log('Localtunnel closed. Reconnecting...');
      setTimeout(main, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('Localtunnel error:', err);
    });
  } catch (err) {
    console.error('Failed to start localtunnel:', err);
    setTimeout(main, 5000);
  }
}

main();
