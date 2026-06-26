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
  check('首页章节索引进入章节页', (await page.locator('.chapter-row').first().getAttribute('href')) === '/tutorial/chapter-1');
  check('首页展示真实课程统计', (await page.locator('.course-facts').innerText()).includes('308'));
  check('桌面导航包含源码仓库入口', await page.locator('.header-nav a[href="https://github.com/yanboim/Mistery"][target="_blank"]').count() === 1);
  check('桌面导航包含 X 图标入口', await page.locator('.header-nav a[href="https://x.com/ImYanBoss"][target="_blank"] svg.nav-icon').count() === 1);
  check('桌面导航源码仓库使用图标', await page.locator('.header-nav a[href="https://github.com/yanboim/Mistery"] svg.nav-icon').count() === 1);
  check('页脚第一行包含 Mi姐 X 链接', await page.locator('.site-footer p a[href="https://x.com/Mimiwftt"][target="_blank"]').count() === 1);
  check('页脚不再单独显示 Mi姐 X 第二行', await page.locator('.site-footer nav[aria-label="页脚链接"]').count() === 0);
  check('页脚包含版权信息', (await page.locator('.site-footer small').innerText()).includes('©') && (await page.locator('.site-footer small').innerText()).includes('YanBo'));
  check('页脚版权包含 YanBo X 链接', await page.locator('.site-footer small a[href="https://x.com/ImYanBoss"][target="_blank"]').count() === 1);
  check('页面加载 LXGW WenKai 字体样式', await page.locator('link[href*="lxgw-wenkai-webfont/1.7.0"][rel="stylesheet"]').count() === 1);
  check('正文和代码字体变量优先使用 LXGW WenKai', await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return styles.getPropertyValue('--font-body').includes('LXGW WenKai')
      && styles.getPropertyValue('--font-heading').includes('LXGW WenKai')
      && styles.getPropertyValue('--font-code').includes('LXGW WenKai');
  }));
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
  check('站点地图包含章节页面', sitemap.includes('/tutorial/chapter-1') && sitemap.includes('/tutorial/chapter-6'));
  const robots = await (await desktop.request.get(`${baseURL}/robots.txt`)).text();
  check('robots 声明 sitemap', robots.includes('Sitemap: https://mi.yanbo.im/sitemap.xml'));

  await page.goto(`${baseURL}/tutorial/chapter-1/001`, { waitUntil: 'networkidle' });
  check('教程标题正确', (await page.locator('.lesson-head h1').innerText()).includes('写给最近几个月新入市的朋友们'));
  check('教程页提供源文件编辑链接', (await page.locator('.source-edit-link').getAttribute('href')) === 'https://github.com/yanboim/Mistery/edit/main/src/content/lessons/chapter-1/001.md');
  check('教程页章节入口进入章节页', (await page.locator('.chapter-link').getAttribute('href')) === '/tutorial/chapter-1');
  check('相邻教程空白区域不露灰色底', await page.locator('.lesson-pager').evaluate((element) => getComputedStyle(element).backgroundColor === 'rgba(0, 0, 0, 0)'));
  check('相邻教程导航保持紧凑高度', await page.locator('.lesson-pager a.next').evaluate((element) => element.getBoundingClientRect().height <= 86));
  check('教程页结构化数据为 Article', await page.locator('script[type="application/ld+json"]').evaluate((element) => JSON.parse(element.textContent || '{}')['@type'] === 'Article'));
  check('教程正文已渲染', await page.locator('.prose p').count() > 2);
  check('教程正文启用 Heti 中文排版容器', await page.locator('.prose.heti[data-typography="heti"]').count() === 1);
  check('教程正文排版保持紧凑阅读密度', await page.locator('.prose').evaluate((element) => {
    const style = getComputedStyle(element);
    const firstHeading = element.querySelector('h2');
    const headingStyle = firstHeading ? getComputedStyle(firstHeading) : null;
    return Number.parseFloat(style.lineHeight) <= 29
      && Number.parseFloat(style.fontSize) <= 17
      && (!headingStyle || Number.parseFloat(headingStyle.fontSize) <= 25);
  }));
  check('当前教程在侧栏高亮', await page.locator('.lesson-sidebar a.active').count() === 1);
  check('教程侧栏不重复放置全站搜索按钮', await page.locator('.lesson-sidebar [data-search-open]').count() === 0);
  check('教程目录总标题固定，章节区域独立滚动', await page.locator('.lesson-sidebar').evaluate((sidebar) => {
    const sidebarStyle = getComputedStyle(sidebar);
    const navStyle = getComputedStyle(sidebar.querySelector('nav'));
    return sidebarStyle.overflowY === 'hidden' && navStyle.overflowY === 'auto';
  }));
  check('教程侧栏章节标题可以关闭和打开', await page.locator('.lesson-sidebar details[open]').first().evaluate(async (details) => {
    const summary = details.querySelector('summary');
    summary.click();
    await new Promise((resolve) => setTimeout(resolve, 80));
    const closed = !details.open;
    summary.click();
    await new Promise((resolve) => setTimeout(resolve, 80));
    return closed && details.open;
  }));
  check('第一篇提供下一篇', await page.locator('.lesson-pager a.next').count() === 1);
  check('编号段落已转换为语义标题', await page.locator('.prose h2').count() >= 7);
  check('结构化长文生成页内目录', await page.locator('.page-toc a').count() >= 7);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, document.documentElement.scrollHeight); });
  await page.waitForTimeout(100);
  check('滚动到底部时阅读进度完成', Number(await page.locator('.reading-progress').evaluate((element) => getComputedStyle(element).getPropertyValue('--reading-progress'))) > 0.98);
  check('教程页无框架错误浮层', await page.locator('.vite-error-overlay, #webpack-dev-server-client-overlay').count() === 0);
  await page.screenshot({ path: 'artifacts/lesson-desktop.png', fullPage: false });
  await page.goto(`${baseURL}/tutorial/chapter-5/001`, { waitUntil: 'networkidle' });
  check('Heti 自动处理中英文混排间距', await page.locator('.prose heti-spacing').count() > 0);
  await page.goto(`${baseURL}/tutorial/chapter-4/008`, { waitUntil: 'networkidle' });
  check('短标题在桌面宽度下不被人为换行', await page.locator('.lesson-head h1').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const lineHeight = Number.parseFloat(getComputedStyle(element).lineHeight);
    return rect.height < lineHeight * 1.45;
  }));
  await page.goto(`${baseURL}/tutorial/chapter-1/002`, { waitUntil: 'networkidle' });
  check('无页内目录时正文居中', await page.locator('.lesson-main.without-toc').count() === 1);
  await page.goto(`${baseURL}/tutorial/chapter-1`, { waitUntil: 'networkidle' });
  check('章节页标题正确', (await page.locator('.chapter-hero h1').innerText()) === '交易基础认知');
  check('章节页展示本章教程列表', await page.locator('.chapter-lessons a').count() === 47);
  check('章节页提供开始或继续本章入口', (await page.locator('[data-chapter-start]').getAttribute('href'))?.startsWith('/tutorial/chapter-1/'));
  await page.goto(`${baseURL}/tutorial`, { waitUntil: 'networkidle' });
  check('全部教程每章提供章节页入口', await page.locator('.chapter-page-link[href="/tutorial/chapter-1"]').count() === 1);
  check('目录页不重复放置全站搜索按钮', await page.locator('.catalog-search').count() === 0);
  check('目录页不重复放置文本筛选框', await page.locator('[data-catalog-filter]').count() === 0);
  const firstChapterLayout = await page.locator('.catalog-chapter').first().evaluate((section) => {
    const header = section.querySelector('header');
    const list = section.querySelector('ol');
    const headerStyle = getComputedStyle(header);
    const listStyle = getComputedStyle(list);
    return {
      headerPosition: headerStyle.position,
      headerHasCardSurface: headerStyle.borderTopStyle !== 'none' || headerStyle.backgroundColor !== 'rgba(0, 0, 0, 0)',
      listOverflowY: listStyle.overflowY,
      sectionTallerThanViewport: section.getBoundingClientRect().height > window.innerHeight,
    };
  });
  check('桌面目录左侧章节说明固定', firstChapterLayout.headerPosition === 'sticky');
  check('桌面目录左侧保持非卡片样式', !firstChapterLayout.headerHasCardSurface);
  check('桌面目录右侧课程跟随页面滚动', firstChapterLayout.listOverflowY === 'visible' && firstChapterLayout.sectionTallerThanViewport);
  check('目录列表空白格不露灰色底', await page.locator('.catalog-chapter ol').first().evaluate((element) => getComputedStyle(element).backgroundColor === 'rgba(0, 0, 0, 0)'));
  const stickyScrollBehavior = await page.locator('.catalog-chapter').first().evaluate(async (section) => {
    document.documentElement.style.scrollBehavior = 'auto';
    const header = section.querySelector('header');
    const top = Number.parseFloat(getComputedStyle(header).top);
    const startY = window.scrollY + section.getBoundingClientRect().top - top;
    window.scrollTo(0, startY);
    await new Promise((resolve) => setTimeout(resolve, 50));
    const firstTop = header.getBoundingClientRect().top;
    window.scrollTo(0, startY + 420);
    await new Promise((resolve) => setTimeout(resolve, 50));
    const secondTop = header.getBoundingClientRect().top;
    return Math.abs(firstTop - top) < 2 && Math.abs(secondTop - top) < 2;
  });
  check('桌面目录左侧在当前章节滚动期间吸顶', stickyScrollBehavior);
  await desktop.close();

  const light = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'light' });
  const lightPage = await light.newPage();
  await lightPage.goto(baseURL, { waitUntil: 'networkidle' });
  check('默认使用浅色主题', await lightPage.evaluate(() => document.documentElement.dataset.theme === 'light' && getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() === '#f4f2ed'));
  await lightPage.screenshot({ path: 'artifacts/home-light.png', fullPage: false });
  await lightPage.locator('[data-theme-toggle]').click();
  check('主题按钮可切换到深色', await lightPage.evaluate(() => document.documentElement.dataset.theme === 'dark'));
  check('主题按钮状态显示为深色', await lightPage.locator('[data-theme-toggle][data-theme-state="dark"]').count() === 1);
  await lightPage.locator('[data-theme-toggle]').click();
  check('主题按钮可切换到跟随系统', await lightPage.evaluate(() => document.documentElement.dataset.theme === 'auto'));
  check('主题按钮状态显示为跟随系统', await lightPage.locator('[data-theme-toggle][data-theme-state="auto"]').count() === 1);
  await lightPage.locator('[data-theme-toggle]').click();
  check('主题按钮可切回浅色', await lightPage.evaluate(() => document.documentElement.dataset.theme === 'light'));
  check('主题按钮状态显示为浅色', await lightPage.locator('[data-theme-toggle][data-theme-state="light"]').count() === 1);
  await lightPage.goto(`${baseURL}/404.html`, { waitUntil: 'networkidle' });
  check('404 页面提供返回路径', await lightPage.locator('.not-found a').count() === 2);
  await light.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark', isMobile: true });
  const mobilePage = await mobile.newPage();
  await mobilePage.addInitScript(() => {
    localStorage.setItem('mjie-completed-lessons', JSON.stringify(['chapter-1/001', 'chapter-1/002']));
    localStorage.setItem('mjie-last-lesson', 'chapter-1/002');
  });
  mobilePage.on('console', (message) => {
    if (message.type() === 'error') errors.push(`mobile console: ${message.text()}`);
  });
  mobilePage.on('pageerror', (error) => errors.push(`mobile pageerror: ${error.message}`));
  await mobilePage.goto(`${baseURL}/tutorial`, { waitUntil: 'networkidle' });
  check('移动端目录页无横向溢出', await mobilePage.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
  check('移动端站点导航默认收起为抽屉', await mobilePage.evaluate(() => {
    const panel = document.querySelector('[data-mobile-menu]');
    const trigger = document.querySelector('[data-mobile-menu-open]');
    if (!panel || !trigger) return false;
    const matrix = new DOMMatrixReadOnly(getComputedStyle(panel).transform);
    return getComputedStyle(trigger).display !== 'none' && matrix.m41 > 200;
  }));
  await mobilePage.locator('[data-mobile-menu-open]').click();
  await mobilePage.waitForTimeout(320);
  check('移动端站点导航可打开', await mobilePage.evaluate(() => document.documentElement.classList.contains('mobile-menu-visible')));
  check('移动端抽屉显示同一套导航', await mobilePage.locator('[data-mobile-menu] .header-nav a:visible').count() === 4);
  check('移动端抽屉包含源码仓库入口', await mobilePage.locator('[data-mobile-menu] .header-nav a[href="https://github.com/yanboim/Mistery"][target="_blank"]').count() === 1);
  check('移动端抽屉包含 X 图标入口', await mobilePage.locator('[data-mobile-menu] .header-nav a[href="https://x.com/ImYanBoss"][target="_blank"] svg.nav-icon').count() === 1);
  check('移动端搜索和主题切换放在抽屉外', await mobilePage.evaluate(() => {
    const search = document.querySelector('.site-header > .header-inner > .header-actions [data-search-open]');
    const theme = document.querySelector('.site-header > .header-inner > .header-actions [data-theme-toggle]');
    const searchInDrawer = document.querySelector('[data-mobile-menu] [data-search-open]');
    const themeInDrawer = document.querySelector('[data-mobile-menu] [data-theme-toggle]');
    const isVisibleInViewport = (element) => {
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight;
    };
    return isVisibleInViewport(search) && isVisibleInViewport(theme) && !searchInDrawer && !themeInDrawer;
  }));
  await mobilePage.locator('[data-mobile-menu-close]').first().click();
  await mobilePage.waitForTimeout(240);
  check('移动端站点导航可关闭', await mobilePage.evaluate(() => !document.documentElement.classList.contains('mobile-menu-visible')));
  check('移动端课程目录默认只展开一章', await mobilePage.locator('.catalog-chapter ol:visible').count() === 1);
  check('目录显示章节完成进度', (await mobilePage.locator('[data-chapter-progress="1"]').innerText()).includes('2 / 47'));
  check('章节跳转显示完成百分比', (await mobilePage.locator('[data-chapter-jump-progress="1"]').innerText()) === '4%');
  await mobilePage.locator('[data-progress-filter="read"]').click();
  check('目录可筛选已读教程', (await mobilePage.locator('[data-filter-status]').innerText()).includes('找到 2 篇 已读教程'));
  await mobilePage.locator('[data-progress-filter="unread"]').click();
  check('目录可筛选未读教程', (await mobilePage.locator('[data-filter-status]').innerText()).includes('找到 306 篇 未读教程'));
  await mobilePage.locator('[data-progress-filter="all"]').click();
  await mobilePage.goto(`${baseURL}/tutorial/chapter-2/001`, { waitUntil: 'networkidle' });
  check('移动端无横向溢出', await mobilePage.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
  await mobilePage.locator('[data-mobile-menu-open]').click();
  await mobilePage.waitForTimeout(320);
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
