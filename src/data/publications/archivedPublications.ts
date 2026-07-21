import publications2021 from './2021.json';
import publications2022 from './2022.json';
import publications2023 from './2023.json';
import publications2024 from './2024.json';
import type { ArchivedPublicationYear } from '../../types/publications';

export const archivedPublicationYears: ArchivedPublicationYear[] = [
  { year: '2024', publications: publications2024 },
  { year: '2023', publications: publications2023 },
  { year: '2022', publications: publications2022 },
  { year: '2021', publications: publications2021 }
];
