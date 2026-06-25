import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
await mkdir('artifacts', { recursive: true });

const browser = await chromium.launch({ headless: true });
const errors = [];
const checks = [];
const check = (name, value) => {
  checks.push({ name, pass: Boolean(value) });
  if (!value) throw new Error(`验证失败: ${name}`);
};

try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 960 }, colorScheme: 'dark' });
  const page = await desktop.newPage();
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  check('首页有主标题', await page.locator('h1').count() === 1);
  check('首页学习方法包含 3 个步骤', await page.locator('.study-method li').count() === 3);
  check('首页渲染 6 个章节索引', await page.locator('.chapter-row').count() === 6);
  check('首页展示真实课程统计', (await page.locator('.course-facts').innerText()).includes('308'));
  check('首页包含 canonical', (await page.locator('link[rel="canonical"]').getAttribute('href')) === 'https://mi.yanbo.im/');
  check('首页包含分享图', (await page.locator('meta[property="og:image"]').getAttribute('content')) === 'https://mi.yanbo.im/og.svg');
  check('首页包含结构化数据', await page.locator('script[type="application/ld+json"]').count() === 1);
  check('首页无横向溢出', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
  await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: true });

  await page.locator('[data-search-open]').first().click();
  await page.locator('[data-search-input]').fill('微信群里的一句');
  await page.waitForFunction(() => document.querySelectorAll('.search-result').length > 0);
  check('正文搜索返回结果', await page.locator('.search-result').count() > 0);
  check('搜索摘要包含正文上下文', (await page.locator('.search-result').first().innerText()).includes('微信群'));
  await page.locator('[data-search-close]').click();
  check('搜索关闭后焦点返回触发按钮', await page.evaluate(() => document.activeElement?.matches('[data-search-open]')));

  const sitemap = await (await desktop.request.get(`${baseURL}/sitemap.xml`)).text();
  check('站点地图包含全部教程路径', sitemap.includes('/tutorial/chapter-1/001') && sitemap.includes('/tutorial/chapter-6/139'));
  const robots = await (await desktop.request.get(`${baseURL}/robots.txt`)).text();
  check('robots 声明 sitemap', robots.includes('Sitemap: https://mi.yanbo.im/sitemap.xml'));

  await page.goto(`${baseURL}/tutorial/chapter-1/001`, { waitUntil: 'networkidle' });
  check('教程标题正确', (await page.locator('.lesson-head h1').innerText()).includes('写给最近几个月新入市的朋友们'));
  check('教程页提供源文件编辑链接', (await page.locator('.source-edit-link').getAttribute('href')) === 'https://github.com/yanboim/Mistery/edit/main/src/content/lessons/chapter-1/001.md');
  check('教程页结构化数据为 Article', await page.locator('script[type="application/ld+json"]').evaluate((element) => JSON.parse(element.textContent || '{}')['@type'] === 'Article'));
  check('教程正文已渲染', await page.locator('.prose p').count() > 2);
  check('当前教程在侧栏高亮', await page.locator('.lesson-sidebar a.active').count() === 1);
  check('第一篇提供下一篇', await page.locator('.lesson-pager a.next').count() === 1);
  check('编号段落已转换为语义标题', await page.locator('.prose h2').count() >= 7);
  check('结构化长文生成页内目录', await page.locator('.page-toc a').count() >= 7);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, document.documentElement.scrollHeight); });
  await page.waitForTimeout(100);
  check('滚动到底部时阅读进度完成', Number(await page.locator('.reading-progress').evaluate((element) => getComputedStyle(element).getPropertyValue('--reading-progress'))) > 0.98);
  check('教程页无框架错误浮层', await page.locator('.vite-error-overlay, #webpack-dev-server-client-overlay').count() === 0);
  await page.screenshot({ path: 'artifacts/lesson-desktop.png', fullPage: false });
  await page.goto(`${baseURL}/tutorial/chapter-1/002`, { waitUntil: 'networkidle' });
  check('无页内目录时正文居中', await page.locator('.lesson-main.without-toc').count() === 1);
  await desktop.close();

  const light = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'light' });
  const lightPage = await light.newPage();
  await lightPage.goto(baseURL, { waitUntil: 'networkidle' });
  check('浅色主题按系统偏好渲染', await lightPage.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() === '#f4f2ed'));
  await lightPage.screenshot({ path: 'artifacts/home-light.png', fullPage: false });
  await lightPage.locator('[data-theme-toggle]').click();
  check('主题按钮可切换到深色', await lightPage.evaluate(() => document.documentElement.dataset.theme === 'dark'));
  check('主题按钮显示下一个模式', (await lightPage.locator('[data-theme-toggle]').innerText()) === '浅色');
  await lightPage.goto(`${baseURL}/404.html`, { waitUntil: 'networkidle' });
  check('404 页面提供返回路径', await lightPage.locator('.not-found a').count() === 2);
  await light.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark', isMobile: true });
  const mobilePage = await mobile.newPage();
  mobilePage.on('console', (message) => {
    if (message.type() === 'error') errors.push(`mobile console: ${message.text()}`);
  });
  mobilePage.on('pageerror', (error) => errors.push(`mobile pageerror: ${error.message}`));
  await mobilePage.goto(`${baseURL}/tutorial`, { waitUntil: 'networkidle' });
  check('移动端课程目录默认只展开一章', await mobilePage.locator('.catalog-chapter ol:visible').count() === 1);
  await mobilePage.locator('[data-catalog-filter]').fill('趋势');
  check('目录筛选只显示匹配教程', await mobilePage.locator('.catalog-chapter li:visible').count() > 0 && await mobilePage.locator('.catalog-chapter li[hidden]').count() > 0);
  await mobilePage.goto(`${baseURL}/tutorial/chapter-2/001`, { waitUntil: 'networkidle' });
  check('移动端无横向溢出', await mobilePage.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
  await mobilePage.locator('[data-sidebar-open]').click();
  await mobilePage.waitForTimeout(350);
  check('移动端目录可打开', await mobilePage.evaluate(() => document.documentElement.classList.contains('sidebar-visible')));
  check('移动端目录可见', await mobilePage.locator('[data-sidebar]').isVisible());
  check('移动端目录进入视口', (await mobilePage.locator('[data-sidebar]').boundingBox())?.x >= -1);
  await mobilePage.screenshot({ path: 'artifacts/lesson-mobile-menu.png', fullPage: false });
  await mobilePage.locator('.sidebar-head [data-sidebar-close]').click();
  await mobilePage.waitForTimeout(350);
  check('移动端目录可关闭', await mobilePage.evaluate(() => !document.documentElement.classList.contains('sidebar-visible')));
  await mobile.close();

  check('浏览器无控制台错误', errors.length === 0);
  console.log(JSON.stringify({ status: 'PASS', checks, errors }, null, 2));
} finally {
  await browser.close();
}
