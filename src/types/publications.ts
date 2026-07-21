export interface ArchivedPublication {
  alt: string;
  authors: string;
  conference: string;
  doiHref: string;
  image: string;
  nestedRow: boolean;
  pdfHref: string;
  title: string;
  videoHref: string;
}

export interface ArchivedPublicationYear {
  publications: ArchivedPublication[];
  year: string;
}
