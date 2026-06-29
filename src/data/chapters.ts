import { siteConfig } from '../site.config';

export const chapters = siteConfig.chapters;

export const chapterByNumber = new Map(chapters.map((chapter) => [chapter.number, chapter]));
