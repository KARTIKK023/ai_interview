const { chromium } = require('playwright');

const attempts = [
  { u: 'superadmin@hiresmart.ai', p: 'super@1234' },
  { u: 'superadmin@aiinterview.com', p: 'super@1234' },
  { u: 'superadmin@hiresmart.ai', p: 'superadmin' },
];
(async () => {
  const browser = await chromium.launch();
  for (const a of attempts) {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await page.goto('http://localhost:5174/super-admin/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    // try to locate fields more reliably
    const inputs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('input')).map(i => ({ type: i.type, ph: i.placeholder, cls: i.className.slice(0,40) }))
    );
    console.log('FIELD MAP:', JSON.stringify(inputs));
    const vals = await page.evaluate(([u,p]) => {
      const ins = Array.from(document.querySelectorAll('input'));
      const text = ins.find(i => (i.type === 'text' || i.type === 'email') && !/password/i.test(i.type));
      const pw = ins.find(i => i.type === 'password');
      const set = (el, v) => el && Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(el, v);
      if (text) set(text, u);
      if (pw) set(pw, p);
      return { textFound: !!text, pwFound: !!pw, n: ins.length };
    }, [a.u, a.p]);
    console.log('FILL', JSON.stringify(a), '->', JSON.stringify(vals));
    await page.click('button[type="submit"]').catch(e => console.log('no submit btn', e.message));
    await page.waitForTimeout(3500);
    console.log('POST URL:', page.url());
    const banner = await page.evaluate(() => document.body.innerText.replace(/\n+/g, ' | ').slice(0, 200));
    console.log('VISIBLE:', banner);
    await page.close();
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(2); });
