import fs from 'fs/promises';
import path from 'path';
import { DomUtils, parseDocument } from 'htmlparser2';
import type { RecentPublicationEntry } from '../src/data/recentPublications';

const ROOT = process.cwd();
const OUTPUT_FILE = path.join(ROOT, 'src/data/recentPublications.json');
const DEFAULT_SOURCE_URL = 'https://panhui.people.ust.hk/publications.html';
const DEFAULT_YEARS = [2026, 2025];
const REQUEST_TIMEOUT_MS = 30_000;
// Match exact author-name spellings only. This intentionally catches both Western and
// family-name-first spellings while leaving unrelated names such as "Zhiqi Gao" untouched.
const EXCLUDED_AUTHOR_NAMES = ['Ze Gao', 'Gao Ze'];

type PublicationData = Record<string, RecentPublicationEntry[]>;
type HtmlElement = ReturnType<typeof DomUtils.getElementsByTagName>[number];

interface SyncOptions {
  sourceUrl: string;
  years: number[];
  dryRun: boolean;
  checkOnly: boolean;
}

interface ChangeSummary {
  year: string;
  added: string[];
  removed: string[];
  changed: string[];
}

function printHelp(): void {
  console.log(`
Usage:
  npm run pub:sync
  npm run pub:sync:check
  npx tsx tools/sync-recent-publications.ts [--dry-run] [--check] [--year=2026] [--years=2026,2025] [--source=https://...]

Options:
  --dry-run          Parse remote publications and report differences without writing JSON.
  --check            Like --dry-run, but exits with code 1 when local JSON is out of sync.
  --year=YYYY        Publication year to sync from the remote page.
  --years=YYYY,...   Publication years to sync from the remote page. Defaults to 2026,2025.
  --source=URL       Remote publications page. Defaults to Pan Hui's publications page.

Policy:
  Entries with these exact excluded author names are removed from the synced year:
  ${EXCLUDED_AUTHOR_NAMES.join(', ')}
`);
}

function parseArgs(argv: string[]): SyncOptions {
  const options: SyncOptions = {
    sourceUrl: DEFAULT_SOURCE_URL,
    years: DEFAULT_YEARS,
    dryRun: false,
    checkOnly: false
  };

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--check') {
      options.checkOnly = true;
      options.dryRun = true;
      continue;
    }

    if (arg.startsWith('--year=')) {
      const year = Number(arg.slice('--year='.length));
      options.years = [parseYear(year, arg)];
      continue;
    }

    if (arg.startsWith('--years=')) {
      const years = arg
        .slice('--years='.length)
        .split(',')
        .map((value) => parseYear(Number(value.trim()), arg));
      if (!years.length) throw new Error(`Invalid --years value: ${arg}`);
      options.years = [...new Set(years)];
      continue;
    }

    if (arg.startsWith('--source=')) {
      const sourceUrl = arg.slice('--source='.length).trim();
      assertHttpUrl(sourceUrl, '--source');
      options.sourceUrl = sourceUrl;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function parseYear(year: number, label: string): number {
  if (!Number.isInteger(year) || year < 1900) {
    throw new Error(`Invalid year value in ${label}`);
  }

  return year;
}

function assertHttpUrl(value: string, label: string): void {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('URL must use http/https');
    }
  } catch (error) {
    throw new Error(`Invalid ${label}: ${value}. ${(error as Error).message}`);
  }
}

async function fetchHtml(sourceUrl: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        // Keep the request identifiable and boring; some university servers reject blank user agents.
        'User-Agent': 'MC2-Lab-publication-sync/1.0'
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Remote responded with ${response.status} ${response.statusText}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function getClassList(element: HtmlElement): string[] {
  const className = DomUtils.getAttributeValue(element, 'class') || '';
  return className.split(/\s+/).filter(Boolean);
}

function normalizeText(value: string): string {
  return value
    .replace(/\r/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/DIS\?26/g, "DIS '26")
    .replace(/\bHong Kong\?s\b/g, "Hong Kong's")
    .replace(/\bChildren\?s\b/g, "Children's")
    .replace(/Big Exhibitions \? Children's/g, "Big Exhibitions: Children's")
    .replace(/"\s+Is This Your True Intention to Participate\?"\?Simulated/g, '"Is This Your True Intention to Participate?": Simulated')
    .replace(/\bLgbtq\+/g, 'LGBTQ+')
    .replace(/\bZAgustin\b/g, 'Agustin')
    .replace(/\blvmin\b/g, 'Lvmin')
    .replace(/([a-z0-9)\]])\.In\b/g, '$1. In')
    .replace(/\.\s*\.\s*In\b/g, '. In')
    .replace(/\bProceeding of\b/g, 'Proceedings of')
    .replace(/\. \((Best|Honourable|Highlighted|Art|Selected|Long|Short)/g, ' ($1')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s+\)/g, ')')
    .trim();
}

function ensureSentencePeriod(value: string): string {
  const trimmed = value.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function normalizeAuthorForExactMatch(value: string): string {
  return normalizeText(value)
    .replace(/[*^†‡]+/g, '')
    .replace(/\.$/, '')
    .toLowerCase();
}

function splitAuthors(authors: string): string[] {
  return normalizeText(authors)
    .replace(/\.$/, '')
    .replace(/\s+(?:and|&)\s+/g, ', ')
    .split(',')
    .map((author) => author.trim())
    .filter(Boolean);
}

function hasExcludedAuthor(entry: RecentPublicationEntry): boolean {
  const excluded = new Set(EXCLUDED_AUTHOR_NAMES.map(normalizeAuthorForExactMatch));
  return splitAuthors(entry.authors).some((author) => excluded.has(normalizeAuthorForExactMatch(author)));
}

function startsWithPersonNameList(value: string): boolean {
  const firstNameGroup = (value.split(/,|\s+(?:and|&)\s+/)[0]?.trim() || '').replace(/[*^†‡]+/g, '');

  // The source page stores each item as "Title. Authors. Venue".
  // We only accept a title/authors split when the text after the split begins with a plausible person name.
  // This protects titles such as "Chirper.ai Case" and author initials such as "Kirill A. Shatilov".
  return /^[A-Z][A-Za-z'.-]+(?:\s+(?:[A-Z]\.|[A-Z][A-Za-z'.-]+)){1,5}$/.test(firstNameGroup);
}

function splitTitleAndRemainder(text: string): { title: string; remainder: string } {
  const boundaryPattern = /[.!?]\s+/g;
  let match: RegExpExecArray | null;

  while ((match = boundaryPattern.exec(text)) !== null) {
    const title = text.slice(0, match.index + 1).trim();
    const remainder = text.slice(match.index + match[0].length).trim();

    if (remainder.includes('Pan Hui') && startsWithPersonNameList(remainder)) {
      return { title, remainder };
    }
  }

  throw new Error(`Could not split title from remote publication: ${text}`);
}

function startsWithVenue(value: string): boolean {
  return /^(In|ACM|IEEE|Nature|Elsevier|Springer|Journal|Technical Report|Part of|Virtual Reality|Displays|Telecommunications Policy)\b/i.test(value);
}

function normalizeVenue(value: string): string {
  const venue = normalizeText(value).replace(/^In\s+In\s+/i, 'In ');
  return ensureSentencePeriod(/^In\b/i.test(venue) ? venue : `In ${venue}`);
}

function splitAuthorsAndVenue(remainder: string): Pick<RecentPublicationEntry, 'authors' | 'venue'> {
  const venueDelimiter = '. In ';
  const venueDelimiterIndex = remainder.lastIndexOf(venueDelimiter);
  if (venueDelimiterIndex !== -1) {
    return {
      authors: ensureSentencePeriod(remainder.slice(0, venueDelimiterIndex).trim()),
      venue: normalizeVenue(`In ${remainder.slice(venueDelimiterIndex + venueDelimiter.length).trim()}`)
    };
  }

  const boundaryPattern = /[.!?]\s+/g;
  let match: RegExpExecArray | null;

  while ((match = boundaryPattern.exec(remainder)) !== null) {
    const authors = remainder.slice(0, match.index + 1).trim();
    const venue = remainder.slice(match.index + match[0].length).trim();

    if (authors.includes('Pan Hui') && startsWithPersonNameList(authors) && startsWithVenue(venue)) {
      return {
        authors: ensureSentencePeriod(authors),
        venue: normalizeVenue(venue)
      };
    }
  }

  throw new Error(`Could not split authors/venue from remote publication: ${remainder}`);
}

function splitRemotePublicationText(rawText: string): RecentPublicationEntry {
  const text = normalizeText(rawText);
  const { title, remainder } = splitTitleAndRemainder(text);
  const { authors, venue } = splitAuthorsAndVenue(remainder);

  return {
    title: ensureSentencePeriod(title),
    authors,
    venue
  };
}

function parseRemotePublicationData(html: string, targetYears: number[]): PublicationData {
  const document = parseDocument(html, { decodeEntities: true });
  const headings = DomUtils.getElementsByTagName('h3', document.children);
  const remoteData: PublicationData = {};
  const yearsToSync = new Set(targetYears);

  for (const heading of headings) {
    const year = normalizeText(DomUtils.textContent(heading));
    const numericYear = Number(year);
    if (!yearsToSync.has(numericYear)) continue;

    const list = DomUtils.nextElementSibling(heading);
    if (!list || DomUtils.getName(list) !== 'ul') {
      throw new Error(`Expected a <ul> immediately after remote year heading ${year}.`);
    }

    const entries = DomUtils.getElementsByTagName('li', [list])
      .filter((item) => getClassList(item).includes('nisan'))
      .map((item) => splitRemotePublicationText(DomUtils.textContent(item)));

    if (!entries.length) {
      throw new Error(`Remote year ${year} did not contain any li.nisan publication entries.`);
    }

    remoteData[year] = entries.filter((entry) => !hasExcludedAuthor(entry));
  }

  const missingYears = targetYears.filter((year) => !remoteData[String(year)]);
  if (missingYears.length) {
    throw new Error(`Remote publication year(s) ${missingYears.join(', ')} were not found.`);
  }

  return remoteData;
}

function titleKey(title: string): string {
  return normalizeText(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function summarizeChanges(local: PublicationData, remote: PublicationData, targetYears: number[]): ChangeSummary[] {
  return targetYears
    .map(String)
    .map((year) => {
      const localByTitle = new Map((local[year] || []).map((entry) => [titleKey(entry.title), entry]));
      const remoteByTitle = new Map((remote[year] || []).map((entry) => [titleKey(entry.title), entry]));

      const added: string[] = [];
      const removed: string[] = [];
      const changed: string[] = [];

      remoteByTitle.forEach((remoteEntry, key) => {
        const localEntry = localByTitle.get(key);
        if (!localEntry) {
          added.push(remoteEntry.title);
          return;
        }

        if (JSON.stringify(localEntry) !== JSON.stringify(remoteEntry)) {
          changed.push(remoteEntry.title);
        }
      });

      localByTitle.forEach((localEntry, key) => {
        if (!remoteByTitle.has(key)) {
          removed.push(localEntry.title);
        }
      });

      return { year, added, removed, changed };
    })
    .filter((summary) => summary.added.length || summary.removed.length || summary.changed.length);
}

function buildSyncedData(local: PublicationData, remote: PublicationData, targetYears: number[]): PublicationData {
  const synced = { ...local };
  for (const year of targetYears) {
    synced[String(year)] = remote[String(year)] || [];
  }
  return synced;
}

function printChangeSummary(changes: ChangeSummary[]): void {
  for (const change of changes) {
    console.log(`Year ${change.year}: +${change.added.length} / -${change.removed.length} / ~${change.changed.length}`);
    for (const title of change.added) console.log(`  + ${title}`);
    for (const title of change.removed) console.log(`  - ${title}`);
    for (const title of change.changed) console.log(`  ~ ${title}`);
  }
}

async function run(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const local = JSON.parse(await fs.readFile(OUTPUT_FILE, 'utf8')) as PublicationData;
  const remoteHtml = await fetchHtml(options.sourceUrl);
  const remote = parseRemotePublicationData(remoteHtml, options.years);
  const synced = buildSyncedData(local, remote, options.years);
  const changes = summarizeChanges(local, remote, options.years);
  const hasChanges = JSON.stringify(local) !== JSON.stringify(synced);

  console.log(
    `Fetched ${options.years.map((year) => `${remote[String(year)].length} remote ${year} publication(s)`).join(', ')} from ${options.sourceUrl}.`
  );
  console.log(`Excluded exact author names: ${EXCLUDED_AUTHOR_NAMES.join(', ')}`);

  if (!hasChanges) {
    console.log(`${path.relative(ROOT, OUTPUT_FILE)} is already in sync for ${options.years.join(', ')} publications.`);
    return;
  }

  printChangeSummary(changes);

  if (options.dryRun) {
    console.log(`Dry run only: ${path.relative(ROOT, OUTPUT_FILE)} was not changed.`);
    if (options.checkOnly) process.exit(1);
    return;
  }

  await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(synced, null, 2)}\n`, 'utf8');
  console.log(`Updated ${path.relative(ROOT, OUTPUT_FILE)}.`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
