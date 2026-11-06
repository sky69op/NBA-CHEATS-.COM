import net from 'node:net';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

export async function withLocalServer(argsForPort, env, run) {
  const probe = net.createServer();
  probe.listen(0, '127.0.0.1'); await once(probe, 'listening');
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  const child = spawn(process.execPath, argsForPort(port), {
    env: { ...process.env, ...env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  child.stdout.on('data', data => { log += data; });
  child.stderr.on('data', data => { log += data; });
  let failure;
  child.on('error', error => { failure = error; });
  const origin = `http://127.0.0.1:${port}`;
  try {
    const deadline = Date.now() + 120000;
    for (;;) {
      if (failure) throw failure;
      if (child.exitCode !== null) throw new Error(`Local server exited ${child.exitCode}: ${log}`);
      try {
        // Readiness only; do not follow host redirects.
        await fetch(origin, { redirect: 'manual', signal: AbortSignal.timeout(1000) });
        break;
      } catch {
        if (Date.now() > deadline) throw new Error(`Local server timed out: ${log}`);
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    }
    return await run(origin);
  } catch (error) {
    error.message += '\nLocal server log (tail):\n' + log.slice(-6000);
    throw error;
  } finally {
    if (child.exitCode === null) {
      if (process.platform === 'win32') {
        // Stop only this spawned process tree, including Wrangler's workerd child.
        const stop = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' });
        await once(stop, 'exit');
      } else {
        child.kill();
      }
    }
  }
}
